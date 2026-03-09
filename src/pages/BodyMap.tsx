import { useState, useMemo, useCallback } from 'react';
import { useStore, Part, PartType } from '@/lib/store';
import { useBodyMapStore, BodyView, BodyPlacement, SensationMark, SensationType } from '@/lib/bodyMapStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ZoomIn, ZoomOut, X, Activity, Clock, BarChart3, Paintbrush } from 'lucide-react';
import { format } from 'date-fns';

const PART_TYPE_COLORS: Record<PartType, string> = {
  Manager: 'hsl(var(--ifs-manager))',
  Firefighter: 'hsl(var(--ifs-firefighter))',
  Exile: 'hsl(var(--ifs-exile))',
  Self: 'hsl(var(--ifs-self))',
};

const SENSATION_COLORS: Record<SensationType, string> = {
  tight: 'hsl(0, 70%, 55%)',
  heavy: 'hsl(240, 30%, 40%)',
  numb: 'hsl(210, 10%, 60%)',
  buzzing: 'hsl(50, 90%, 55%)',
  warm: 'hsl(20, 80%, 55%)',
  cold: 'hsl(200, 70%, 55%)',
  hollow: 'hsl(220, 15%, 75%)',
  expansive: 'hsl(160, 60%, 50%)',
  constricted: 'hsl(340, 50%, 45%)',
  painful: 'hsl(0, 90%, 45%)',
  tingly: 'hsl(280, 60%, 60%)',
};

const SENSATION_LABELS: Record<SensationType, string> = {
  tight: 'Tight', heavy: 'Heavy', numb: 'Numb', buzzing: 'Buzzing',
  warm: 'Warm', cold: 'Cold', hollow: 'Hollow', expansive: 'Expansive',
  constricted: 'Constricted', painful: 'Painful', tingly: 'Tingly',
};

// intensity to heat color
function intensityColor(val: number) {
  if (val <= 3) return 'hsl(210,70%,60%)';
  if (val <= 5) return 'hsl(50,80%,55%)';
  if (val <= 7) return 'hsl(30,90%,50%)';
  return 'hsl(0,80%,50%)';
}

function BodySilhouette({ view }: { view: BodyView }) {
  // A simple human outline SVG path
  const frontPath = `M 50 8 C 44 8 40 12 40 18 C 40 24 44 28 50 28 C 56 28 60 24 60 18 C 60 12 56 8 50 8 Z
    M 50 28 L 50 30 C 42 32 35 36 33 44 L 28 62 C 27 65 29 67 31 66 L 38 52 L 38 70 L 36 92 C 36 95 39 96 40 93 L 50 72 L 60 93 C 61 96 64 95 64 92 L 62 70 L 62 52 L 69 66 C 71 67 73 65 72 62 L 67 44 C 65 36 58 32 50 30 Z`;
  const backPath = frontPath; // same silhouette for both sides in this prototype

  return (
    <path
      d={view === 'front' ? frontPath : backPath}
      fill="hsl(var(--muted))"
      stroke="hsl(var(--muted-foreground) / 0.4)"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
  );
}

// Popup to pick a part when clicking on the body
function PlacementPopup({
  position,
  parts,
  onSelect,
  onClose,
}: {
  position: { x: number; y: number };
  parts: Part[];
  onSelect: (partId: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = parts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="absolute z-50 bg-popover border rounded-lg shadow-lg p-3 w-56"
      style={{ left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, 8px)' }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Place a part here</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </div>
      <Input
        placeholder="Search parts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-8 text-xs mb-2"
      />
      <ScrollArea className="max-h-40">
        <div className="space-y-1">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground p-2">No parts found. Add parts in Inventory first.</p>
          )}
          {filtered.map((part) => (
            <button
              key={part.id}
              className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-accent flex items-center gap-2"
              onClick={() => onSelect(part.id)}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: PART_TYPE_COLORS[part.type] }}
              />
              <span className="truncate">{part.name}</span>
              <Badge variant="outline" className="text-[9px] ml-auto">{part.type}</Badge>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Check-In Mode ───
function CheckInMode({ parts, onDone }: { parts: Part[]; onDone: () => void }) {
  const { saveCheckIn } = useBodyMapStore();
  const [entries, setEntries] = useState<{ partId: string; x: number; y: number; view: BodyView; intensity: number }[]>([]);
  const [view, setView] = useState<BodyView>('front');
  const [popup, setPopup] = useState<{ x: number; y: number } | null>(null);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPopup({ x, y });
  };

  const addEntry = (partId: string) => {
    if (!popup) return;
    setEntries((prev) => [...prev, { partId, x: popup.x, y: popup.y, view, intensity: 5 }]);
    setPopup(null);
  };

  const updateIntensity = (idx: number, val: number) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, intensity: val } : e)));
  };

  const save = () => {
    if (entries.length === 0) return;
    saveCheckIn({ placements: entries });
    onDone();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Right Now Check-In</h3>
          <p className="text-xs text-muted-foreground">Tap where you feel activation, then select the part.</p>
        </div>
        <Button onClick={save} disabled={entries.length === 0} size="sm">Save Check-In</Button>
      </div>

      <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as BodyView)} className="mb-2">
        <ToggleGroupItem value="front" className="text-xs">Front</ToggleGroupItem>
        <ToggleGroupItem value="back" className="text-xs">Back</ToggleGroupItem>
      </ToggleGroup>

      <div className="relative w-full max-w-[280px] mx-auto">
        <svg viewBox="0 0 100 100" className="w-full cursor-crosshair" onClick={handleSvgClick}>
          <BodySilhouette view={view} />
          {entries.filter((e) => e.view === view).map((e, i) => {
            const part = parts.find((p) => p.id === e.partId);
            return (
              <circle
                key={i}
                cx={e.x}
                cy={e.y}
                r={2.5}
                fill={part ? PART_TYPE_COLORS[part.type] : 'hsl(var(--primary))'}
                stroke="hsl(var(--background))"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>
        {popup && (
          <PlacementPopup
            position={popup}
            parts={parts}
            onSelect={addEntry}
            onClose={() => setPopup(null)}
          />
        )}
      </div>

      {entries.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs">Adjust intensity for each placement:</Label>
          {entries.map((e, i) => {
            const part = parts.find((p) => p.id === e.partId);
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: part ? PART_TYPE_COLORS[part.type] : 'gray' }} />
                <span className="text-xs w-24 truncate">{part?.name}</span>
                <Slider value={[e.intensity]} onValueChange={([v]) => updateIntensity(i, v)} min={1} max={10} step={1} className="flex-1" />
                <span className="text-xs text-muted-foreground w-6 text-right">{e.intensity}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sensation Mode ───
function SensationMode({ view, onSave }: { view: BodyView; onSave: () => void }) {
  const { saveSensationMap } = useBodyMapStore();
  const [marks, setMarks] = useState<SensationMark[]>([]);
  const [activeSensation, setActiveSensation] = useState<SensationType>('tight');

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMarks((prev) => [...prev, { id: crypto.randomUUID(), x, y, view, sensation: activeSensation }]);
  };

  const save = () => {
    if (marks.length === 0) return;
    saveSensationMap(marks);
    setMarks([]);
    onSave();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2"><Paintbrush className="h-4 w-4" /> Sensation Overlay</h3>
          <p className="text-xs text-muted-foreground">Select a sensation then paint on the body.</p>
        </div>
        <Button onClick={save} disabled={marks.length === 0} size="sm">Save Map</Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(SENSATION_LABELS) as SensationType[]).map((s) => (
          <button
            key={s}
            onClick={() => setActiveSensation(s)}
            className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
              activeSensation === s
                ? 'ring-2 ring-ring font-medium'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: SENSATION_COLORS[s] + '33',
              borderColor: SENSATION_COLORS[s],
              color: SENSATION_COLORS[s],
            }}
          >
            {SENSATION_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="relative w-full max-w-[280px] mx-auto">
        <svg viewBox="0 0 100 100" className="w-full cursor-crosshair" onClick={handleClick}>
          <BodySilhouette view={view} />
          {marks.filter((m) => m.view === view).map((m) => (
            <circle
              key={m.id}
              cx={m.x}
              cy={m.y}
              r={3}
              fill={SENSATION_COLORS[m.sensation]}
              opacity={0.7}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Main Body Map Page ───
export default function BodyMap() {
  const parts = useStore((s) => s.parts);
  const {
    placements,
    addPlacement,
    removePlacement,
    checkIns,
    sensationMaps,
  } = useBodyMapStore();

  const [view, setView] = useState<BodyView>('front');
  const [zoom, setZoom] = useState(1);
  const [popup, setPopup] = useState<{ x: number; y: number } | null>(null);
  const [tab, setTab] = useState('map');
  const [mode, setMode] = useState<'normal' | 'checkin' | 'sensation'>('normal');

  // Filters
  const [typeFilters, setTypeFilters] = useState<Record<PartType, boolean>>({
    Manager: true,
    Firefighter: true,
    Exile: true,
    Self: true,
  });
  const [intensityMin, setIntensityMin] = useState(0);
  const [colorMode, setColorMode] = useState<'type' | 'intensity'>('type');
  const [singlePartId, setSinglePartId] = useState<string | null>(null);

  const intensityNum = (i: string) => (i === 'Low' ? 2 : i === 'Medium' ? 5 : 8);

  const visiblePlacements = useMemo(() => {
    return placements
      .filter((pl) => pl.view === view)
      .filter((pl) => {
        const part = parts.find((p) => p.id === pl.partId);
        if (!part) return false;
        if (singlePartId) return pl.partId === singlePartId;
        if (!typeFilters[part.type]) return false;
        if (intensityNum(part.intensity) < intensityMin) return false;
        return true;
      });
  }, [placements, view, parts, typeFilters, intensityMin, singlePartId]);

  // Group placements by approximate location for stacking
  const grouped = useMemo(() => {
    const groups: Record<string, BodyPlacement[]> = {};
    visiblePlacements.forEach((pl) => {
      const key = `${Math.round(pl.x / 4) * 4}-${Math.round(pl.y / 4) * 4}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(pl);
    });
    return groups;
  }, [visiblePlacements]);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== 'normal') return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPopup({ x, y });
  };

  const handlePartSelect = (partId: string) => {
    if (!popup) return;
    addPlacement({ partId, x: popup.x, y: popup.y, view });
    setPopup(null);
  };

  const getDotColor = (pl: BodyPlacement) => {
    const part = parts.find((p) => p.id === pl.partId);
    if (!part) return 'gray';
    if (colorMode === 'intensity') return intensityColor(intensityNum(part.intensity));
    return PART_TYPE_COLORS[part.type];
  };

  // Pattern analysis
  const regionCounts = useMemo(() => {
    const counts: Record<string, { count: number; partIds: Set<string>; x: number; y: number }> = {};
    placements.forEach((pl) => {
      const key = `${Math.round(pl.x / 8) * 8}-${Math.round(pl.y / 8) * 8}`;
      if (!counts[key]) counts[key] = { count: 0, partIds: new Set(), x: Math.round(pl.x / 8) * 8, y: Math.round(pl.y / 8) * 8 };
      counts[key].count++;
      counts[key].partIds.add(pl.partId);
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [placements]);

  const partLocationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    placements.forEach((pl) => {
      counts[pl.partId] = (counts[pl.partId] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([partId, count]) => ({ part: parts.find((p) => p.id === partId), count }))
      .filter((e) => e.part)
      .sort((a, b) => b.count - a.count);
  }, [placements, parts]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Body Map</h1>
        <p className="text-muted-foreground">Explore where you feel your parts in your body.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="map"><Activity className="h-3.5 w-3.5 mr-1.5" />Map</TabsTrigger>
          <TabsTrigger value="history"><Clock className="h-3.5 w-3.5 mr-1.5" />History</TabsTrigger>
          <TabsTrigger value="patterns"><BarChart3 className="h-3.5 w-3.5 mr-1.5" />Patterns</TabsTrigger>
        </TabsList>

        {/* ═══ MAP TAB ═══ */}
        <TabsContent value="map">
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button
              variant={mode === 'normal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('normal')}
            >
              Place Parts
            </Button>
            <Button
              variant={mode === 'checkin' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('checkin')}
            >
              <Activity className="h-3.5 w-3.5 mr-1" /> Right Now
            </Button>
            <Button
              variant={mode === 'sensation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('sensation')}
            >
              <Paintbrush className="h-3.5 w-3.5 mr-1" /> Sensations
            </Button>
          </div>

          {mode === 'checkin' && (
            <Card>
              <CardContent className="pt-6">
                <CheckInMode parts={parts} onDone={() => setMode('normal')} />
              </CardContent>
            </Card>
          )}

          {mode === 'sensation' && (
            <Card>
              <CardContent className="pt-6">
                <SensationMode view={view} onSave={() => setMode('normal')} />
              </CardContent>
            </Card>
          )}

          {mode === 'normal' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
              {/* Body canvas */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <ToggleGroup
                      type="single"
                      value={view}
                      onValueChange={(v) => v && setView(v as BodyView)}
                    >
                      <ToggleGroupItem value="front" className="text-xs">Front View</ToggleGroupItem>
                      <ToggleGroupItem value="back" className="text-xs">Back View</ToggleGroupItem>
                    </ToggleGroup>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.min(2, z + 0.25))}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div
                    className="relative mx-auto overflow-hidden"
                    style={{ maxWidth: 320 * zoom, transition: 'max-width 0.2s ease' }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full cursor-crosshair" onClick={handleSvgClick}>
                      <BodySilhouette view={view} />
                      {/* Dots */}
                      {Object.values(grouped).map((group, gi) => {
                        const base = group[0];
                        if (group.length === 1) {
                          return (
                            <g key={gi}>
                              <circle
                                cx={base.x}
                                cy={base.y}
                                r={2.5}
                                fill={getDotColor(base)}
                                stroke="hsl(var(--background))"
                                strokeWidth="0.5"
                                className="cursor-pointer"
                                opacity={singlePartId && base.partId !== singlePartId ? 0.2 : 1}
                              />
                              <title>{parts.find((p) => p.id === base.partId)?.name}</title>
                            </g>
                          );
                        }
                        return (
                          <g key={gi}>
                            {group.slice(0, 3).map((pl, pi) => (
                              <circle
                                key={pl.id}
                                cx={base.x + pi * 2 - (group.length - 1)}
                                cy={base.y}
                                r={2}
                                fill={getDotColor(pl)}
                                stroke="hsl(var(--background))"
                                strokeWidth="0.4"
                                opacity={singlePartId && pl.partId !== singlePartId ? 0.2 : 1}
                              />
                            ))}
                            {group.length > 3 && (
                              <text
                                x={base.x + 5}
                                y={base.y + 1}
                                fontSize="3"
                                fill="hsl(var(--muted-foreground))"
                              >
                                +{group.length - 3}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                    {popup && (
                      <PlacementPopup
                        position={popup}
                        parts={parts}
                        onSelect={handlePartSelect}
                        onClose={() => setPopup(null)}
                      />
                    )}
                  </div>

                  {/* Placed parts list */}
                  {visiblePlacements.length > 0 && (
                    <div className="mt-4 space-y-1">
                      <Label className="text-xs text-muted-foreground">Placed parts ({view} view)</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {visiblePlacements.map((pl) => {
                          const part = parts.find((p) => p.id === pl.partId);
                          return (
                            <Badge
                              key={pl.id}
                              variant="secondary"
                              className="text-xs gap-1 cursor-pointer group"
                              onClick={() => removePlacement(pl.id)}
                            >
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getDotColor(pl) }} />
                              {part?.name}
                              <X className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Filters panel */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Part Types</Label>
                      {(['Manager', 'Firefighter', 'Exile', 'Self'] as PartType[]).map((type) => (
                        <div key={type} className="flex items-center gap-2">
                          <Switch
                            checked={typeFilters[type]}
                            onCheckedChange={(v) =>
                              setTypeFilters((f) => ({ ...f, [type]: v }))
                            }
                          />
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PART_TYPE_COLORS[type] }} />
                          <span className="text-xs">{type}s</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Min Intensity</Label>
                      <Slider
                        value={[intensityMin]}
                        onValueChange={([v]) => setIntensityMin(v)}
                        min={0}
                        max={10}
                        step={1}
                      />
                      <span className="text-[10px] text-muted-foreground">{intensityMin} / 10</span>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Color Mode</Label>
                      <ToggleGroup
                        type="single"
                        value={colorMode}
                        onValueChange={(v) => {
                          if (v) {
                            setColorMode(v as 'type' | 'intensity');
                            setSinglePartId(null);
                          }
                        }}
                        className="justify-start"
                      >
                        <ToggleGroupItem value="type" className="text-[10px] h-7 px-2">Type</ToggleGroupItem>
                        <ToggleGroupItem value="intensity" className="text-[10px] h-7 px-2">Heat</ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Highlight Single Part</Label>
                      <Select
                        value={singlePartId || 'none'}
                        onValueChange={(v) => setSinglePartId(v === 'none' ? null : v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="All parts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">All parts</SelectItem>
                          {parts.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Legend */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Legend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Manager', 'Firefighter', 'Exile', 'Self'] as PartType[]).map((t) => (
                        <div key={t} className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PART_TYPE_COLORS[t] }} />
                          <span className="text-[10px]">{t}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ═══ HISTORY TAB ═══ */}
        <TabsContent value="history">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Check-In History</h2>
            {checkIns.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  No check-ins yet. Use "Right Now" mode to create your first body check-in.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...checkIns].reverse().map((ci) => (
                  <Card key={ci.id} className="overflow-hidden">
                    <div className="p-3">
                      <svg viewBox="0 0 100 100" className="w-full">
                        <BodySilhouette view="front" />
                        {ci.placements.map((pl, i) => {
                          const part = parts.find((p) => p.id === pl.partId);
                          return (
                            <circle
                              key={i}
                              cx={pl.x}
                              cy={pl.y}
                              r={2.5}
                              fill={part ? PART_TYPE_COLORS[part.type] : 'gray'}
                              opacity={0.8}
                            />
                          );
                        })}
                      </svg>
                    </div>
                    <div className="px-3 pb-3">
                      <p className="text-[10px] text-muted-foreground">{format(new Date(ci.createdAt), 'MMM d, h:mm a')}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ci.placements.map((pl, i) => {
                          const part = parts.find((p) => p.id === pl.partId);
                          return (
                            <Badge key={i} variant="outline" className="text-[9px] px-1">
                              {part?.name || '?'} ({pl.intensity})
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {sensationMaps.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-foreground mt-8">Sensation Maps</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[...sensationMaps].reverse().map((sm) => (
                    <Card key={sm.id} className="overflow-hidden">
                      <div className="p-3">
                        <svg viewBox="0 0 100 100" className="w-full">
                          <BodySilhouette view="front" />
                          {sm.marks.map((m) => (
                            <circle key={m.id} cx={m.x} cy={m.y} r={3} fill={SENSATION_COLORS[m.sensation]} opacity={0.6} />
                          ))}
                        </svg>
                      </div>
                      <div className="px-3 pb-3">
                        <p className="text-[10px] text-muted-foreground">{format(new Date(sm.createdAt), 'MMM d, h:mm a')}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* ═══ PATTERNS TAB ═══ */}
        <TabsContent value="patterns">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
            {/* Composite heat map */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Composite Body Map</CardTitle>
                <CardDescription className="text-xs">All-time activation density</CardDescription>
              </CardHeader>
              <CardContent>
                {placements.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Place parts on the body map to see patterns.</p>
                ) : (
                  <svg viewBox="0 0 100 100" className="w-full max-w-[280px] mx-auto">
                    <BodySilhouette view="front" />
                    {regionCounts.map((r, i) => {
                      const maxCount = regionCounts[0]?.count || 1;
                      const opacity = 0.15 + (r.count / maxCount) * 0.7;
                      const radius = 3 + (r.count / maxCount) * 5;
                      return (
                        <circle
                          key={i}
                          cx={r.x}
                          cy={r.y}
                          r={radius}
                          fill="hsl(0, 80%, 50%)"
                          opacity={opacity}
                        />
                      );
                    })}
                  </svg>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Most Active Regions</CardTitle>
                </CardHeader>
                <CardContent>
                  {regionCounts.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No data yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {regionCounts.slice(0, 5).map((r, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-8 h-2 rounded-full bg-destructive/30 overflow-hidden">
                            <div
                              className="h-full bg-destructive rounded-full"
                              style={{ width: `${(r.count / (regionCounts[0]?.count || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{r.count} placements</span>
                          <div className="flex gap-0.5 ml-auto">
                            {Array.from(r.partIds).slice(0, 3).map((pid) => {
                              const part = parts.find((p) => p.id === pid);
                              return part ? (
                                <div
                                  key={pid}
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: PART_TYPE_COLORS[part.type] }}
                                  title={part.name}
                                />
                              ) : null;
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Most Distributed Parts</CardTitle>
                  <CardDescription className="text-xs">Parts with the most body locations</CardDescription>
                </CardHeader>
                <CardContent>
                  {partLocationCounts.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No data yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {partLocationCounts.slice(0, 6).map(({ part, count }, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: PART_TYPE_COLORS[part!.type] }}
                          />
                          <span className="text-xs truncate">{part!.name}</span>
                          <Badge variant="secondary" className="text-[9px] ml-auto">{count} locations</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{placements.length}</p>
                    <p className="text-[10px] text-muted-foreground">Placements</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{checkIns.length}</p>
                    <p className="text-[10px] text-muted-foreground">Check-ins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{sensationMaps.length}</p>
                    <p className="text-[10px] text-muted-foreground">Sensation Maps</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
