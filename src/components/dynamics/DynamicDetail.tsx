import { useState } from 'react';
import { useStore, PartType } from '@/lib/store';
import { useDynamicsStore, PartDynamic, DynamicStatus } from '@/lib/dynamicsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronLeft, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const typeColors: Record<PartType, string> = {
  Manager: 'bg-[hsl(var(--ifs-manager)/.15)] text-[hsl(var(--ifs-manager))] border-[hsl(var(--ifs-manager)/.3)]',
  Firefighter: 'bg-[hsl(var(--ifs-firefighter)/.15)] text-[hsl(var(--ifs-firefighter))] border-[hsl(var(--ifs-firefighter)/.3)]',
  Exile: 'bg-[hsl(var(--ifs-exile)/.15)] text-[hsl(var(--ifs-exile))] border-[hsl(var(--ifs-exile)/.3)]',
  Self: 'bg-[hsl(var(--ifs-self)/.15)] text-[hsl(var(--ifs-self))] border-[hsl(var(--ifs-self)/.3)]',
};

interface Props {
  dynamic: PartDynamic;
  onBack: () => void;
}

export function DynamicDetail({ dynamic, onBack }: Props) {
  const parts = useStore((s) => s.parts);
  const { updateDynamic, deleteDynamic, setStatus, addSessionNote } = useDynamicsStore();
  const [description, setDescription] = useState(dynamic.description);
  const [cost, setCost] = useState(dynamic.costToSystem);
  const [resolution, setResolution] = useState(dynamic.resolutionNotes);
  const [fears, setFears] = useState(dynamic.eachPartFears);
  const [noteText, setNoteText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveField = (field: string, value: string | Record<string, string>) => {
    updateDynamic(dynamic.id, { [field]: value } as any);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addSessionNote(dynamic.id, noteText.trim());
    setNoteText('');
  };

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteDynamic(dynamic.id);
    onBack();
  };

  const statusColor = (s: DynamicStatus) =>
    s === 'active' ? 'border-dynamics-polarization text-dynamics-polarization' :
    s === 'easing' ? 'border-amber-500 text-amber-500' :
    'border-dynamics-alliance text-dynamics-alliance';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 mt-1">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={dynamic.dynamicType === 'polarization' ? 'bg-dynamics-polarization text-white border-0' : 'bg-dynamics-alliance text-white border-0'}>
              {dynamic.dynamicType === 'polarization' ? 'Polarization' : 'Alliance'}
            </Badge>
            <Badge variant="outline" className={statusColor(dynamic.status)}>
              {dynamic.status.charAt(0).toUpperCase() + dynamic.status.slice(1)}
            </Badge>
          </div>
          <h2 className="text-xl font-bold mt-1">{dynamic.title}</h2>
        </div>
        <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {confirmDelete && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm">
          Are you sure? This cannot be undone.{' '}
          <Button size="sm" variant="destructive" onClick={handleDelete} className="ml-2">Yes, delete</Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)} className="ml-1">Cancel</Button>
        </div>
      )}

      {/* Section 1 — Parts Involved */}
      <CollapsibleSection title="Parts Involved" defaultOpen>
        <div className="space-y-2">
          {dynamic.partIds.map((pId) => {
            const part = parts.find((p) => p.id === pId);
            if (!part) return null;
            return (
              <Link key={pId} to={`/part/${pId}`} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: `${part.accentColor}20`, color: part.accentColor }}
                >
                  {part.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-sm">{part.name}</div>
                  <Badge variant="outline" className={`text-[10px] ${typeColors[part.type]}`}>{part.type}</Badge>
                </div>
              </Link>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Section 2 — The Dynamic */}
      <CollapsibleSection title="The Dynamic" defaultOpen>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => saveField('description', description)}
              className="min-h-[80px]"
            />
          </div>
          {dynamic.dynamicType === 'polarization' && dynamic.partIds.map((pId) => {
            const part = parts.find((p) => p.id === pId);
            if (!part) return null;
            return (
              <div key={pId} className="rounded-lg border p-3">
                <label className="text-xs font-medium mb-1 block" style={{ color: part.accentColor }}>
                  {part.name} fears:
                </label>
                <Textarea
                  value={fears[pId] || ''}
                  onChange={(e) => setFears((f) => ({ ...f, [pId]: e.target.value }))}
                  onBlur={() => saveField('eachPartFears', fears)}
                  className="min-h-[60px]"
                  placeholder="What this part fears if it relaxes..."
                />
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Section 3 — Cost + Resolution */}
      <CollapsibleSection title="Cost + Resolution">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Cost to the system</label>
            <Textarea
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              onBlur={() => saveField('costToSystem', cost)}
              className="min-h-[60px]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">What would ease this?</label>
            <Textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              onBlur={() => saveField('resolutionNotes', resolution)}
              className="min-h-[60px]"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 4 — Session Notes */}
      <CollapsibleSection title="Session Notes" defaultOpen>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note..."
              className="min-h-[60px] flex-1"
            />
            <Button onClick={handleAddNote} disabled={!noteText.trim()} className="self-end">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          {dynamic.sessionNotes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">No notes yet.</p>
          )}
          {[...dynamic.sessionNotes].reverse().map((note) => (
            <div key={note.id} className="text-sm border-l-2 border-muted pl-3 py-1">
              <span className="text-xs text-muted-foreground">{format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
              <p className="mt-0.5">{note.text}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Status control */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['active', 'easing', 'resolved'] as DynamicStatus[]).map((s) => (
              <Button
                key={s}
                variant={dynamic.status === s ? 'default' : 'outline'}
                size="sm"
                className={dynamic.status === s ? (
                  s === 'active' ? 'bg-dynamics-polarization hover:bg-dynamics-polarization/90' :
                  s === 'easing' ? 'bg-amber-500 hover:bg-amber-500/90' :
                  'bg-dynamics-alliance hover:bg-dynamics-alliance/90'
                ) : ''}
                onClick={() => setStatus(dynamic.id, s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CollapsibleSection({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer hover:bg-accent/30 transition-colors">
            <CardTitle className="text-sm flex items-center justify-between">
              {title}
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
