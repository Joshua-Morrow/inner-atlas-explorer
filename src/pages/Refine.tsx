import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { useRefineStore, CustomAttribute } from '@/lib/refineStore';
import { useAssessmentStore } from '@/lib/assessmentStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  PenLine, Sparkles, Save, ChevronLeft, Palette, Type, FileText, BookOpen,
  Plus, Trash2, ChevronDown, RotateCcw, Check, X, Diamond,
  Heart, Shield, Eye, Brain, Star, Sun, Moon, Flame, Leaf, Mountain,
  Cloud, Droplets, Wind, Zap, Anchor, Crown, Gem, Feather, Shell, Flower2,
  TreePine, Bird, Fish, Cat, Dog, Rabbit, Bug, Skull, Ghost, Smile,
  Frown, Meh, Lightbulb, Key, Lock, Unlock, Sword, CircleDot, Hexagon, Triangle,
} from 'lucide-react';
import { format } from 'date-fns';

const ICON_LIBRARY = [
  { name: 'heart', Icon: Heart, category: 'figures' },
  { name: 'shield', Icon: Shield, category: 'objects' },
  { name: 'eye', Icon: Eye, category: 'figures' },
  { name: 'brain', Icon: Brain, category: 'figures' },
  { name: 'star', Icon: Star, category: 'symbols' },
  { name: 'sun', Icon: Sun, category: 'nature' },
  { name: 'moon', Icon: Moon, category: 'nature' },
  { name: 'flame', Icon: Flame, category: 'nature' },
  { name: 'leaf', Icon: Leaf, category: 'nature' },
  { name: 'mountain', Icon: Mountain, category: 'nature' },
  { name: 'cloud', Icon: Cloud, category: 'nature' },
  { name: 'droplets', Icon: Droplets, category: 'nature' },
  { name: 'wind', Icon: Wind, category: 'nature' },
  { name: 'zap', Icon: Zap, category: 'symbols' },
  { name: 'anchor', Icon: Anchor, category: 'objects' },
  { name: 'crown', Icon: Crown, category: 'objects' },
  { name: 'gem', Icon: Gem, category: 'objects' },
  { name: 'feather', Icon: Feather, category: 'nature' },
  { name: 'shell', Icon: Shell, category: 'nature' },
  { name: 'flower2', Icon: Flower2, category: 'nature' },
  { name: 'treePine', Icon: TreePine, category: 'nature' },
  { name: 'bird', Icon: Bird, category: 'nature' },
  { name: 'fish', Icon: Fish, category: 'nature' },
  { name: 'cat', Icon: Cat, category: 'nature' },
  { name: 'dog', Icon: Dog, category: 'nature' },
  { name: 'rabbit', Icon: Rabbit, category: 'nature' },
  { name: 'bug', Icon: Bug, category: 'nature' },
  { name: 'skull', Icon: Skull, category: 'figures' },
  { name: 'ghost', Icon: Ghost, category: 'figures' },
  { name: 'smile', Icon: Smile, category: 'figures' },
  { name: 'frown', Icon: Frown, category: 'figures' },
  { name: 'meh', Icon: Meh, category: 'figures' },
  { name: 'lightbulb', Icon: Lightbulb, category: 'objects' },
  { name: 'key', Icon: Key, category: 'objects' },
  { name: 'lock', Icon: Lock, category: 'objects' },
  { name: 'unlock', Icon: Unlock, category: 'objects' },
  { name: 'sword', Icon: Sword, category: 'objects' },
  { name: 'diamond', Icon: Diamond, category: 'symbols' },
  { name: 'circleDot', Icon: CircleDot, category: 'symbols' },
  { name: 'hexagon', Icon: Hexagon, category: 'symbols' },
  { name: 'triangle', Icon: Triangle, category: 'symbols' },
  { name: 'sparkles', Icon: Sparkles, category: 'symbols' },
  { name: 'penLine', Icon: PenLine, category: 'symbols' },
];

const SUGGESTED_ATTRIBUTES = [
  'Favorite phrases',
  'Physical posture',
  'Historical figure that represents this part',
  'This part sounds like...',
  "This part's age",
  "This part's biggest fear",
];

export default function Refine() {
  const { partId } = useParams<{ partId: string }>();
  const navigate = useNavigate();
  const parts = useStore((s) => s.parts);
  const updatePart = useStore((s) => s.updatePart);
  const part = parts.find((p) => p.id === partId);

  const { getRefinement, initRefinement, updateRefinement, addCustomAttribute, updateCustomAttribute, deleteCustomAttribute, revertChange, getRefinementLevel } = useRefineStore();

  useEffect(() => {
    if (partId) initRefinement(partId);
  }, [partId, initRefinement]);

  const refinement = partId ? getRefinement(partId) : null;
  const level = partId ? getRefinementLevel(partId) : 'none';

  const [activeTab, setActiveTab] = useState('rename');
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [showNewAttr, setShowNewAttr] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [iconFilter, setIconFilter] = useState<string>('all');

  if (!part || !partId) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-muted-foreground">Part not found.</p>
        <Button variant="link" onClick={() => navigate('/inventory')}>Back to Inventory</Button>
      </div>
    );
  }

  const currentColor = refinement?.customColor || part.accentColor;
  const currentName = refinement?.customName || part.name;
  const currentIcon = refinement?.selectedIcon;

  const SelectedIconComponent = currentIcon ? ICON_LIBRARY.find((i) => i.name === currentIcon)?.Icon : null;

  const handleSave = () => {
    // Sync visual changes to part store
    const updates: any = {};
    if (refinement?.customName) updates.name = refinement.customName;
    if (refinement?.customColor) updates.accentColor = refinement.customColor;
    if (refinement?.selectedIcon) updates.avatar = refinement.selectedIcon;
    if (Object.keys(updates).length > 0) {
      updatePart(partId, updates);
    }
    navigate('/inventory');
  };

  const filteredIcons = iconFilter === 'all' ? ICON_LIBRARY : ICON_LIBRARY.filter((i) => i.category === iconFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" />
            <Sparkles className="h-4 w-4 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Refine: {currentName}</h1>
            {level !== 'none' && (
              <Badge variant="outline" className="ml-2 text-xs">
                <Diamond className="h-3 w-3 mr-1" />
                {level === 'full' ? 'Fully Refined' : 'Partially Refined'}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">Personalize this part to make it truly yours.</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" /> Save & Apply
        </Button>
      </div>

      {/* Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Current Profile */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Live Preview Node */}
            <div className="flex justify-center py-4">
              <div
                className="w-24 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-1 shadow-md relative transition-all"
                style={{
                  borderColor: currentColor,
                  backgroundColor: `${currentColor}15`,
                  transform: `scale(${0.8 + (refinement?.prominence || 3) * 0.08})`,
                  boxShadow: level !== 'none' ? `0 0 16px 3px ${currentColor}40` : undefined,
                }}
              >
                {SelectedIconComponent ? (
                  <SelectedIconComponent className="h-8 w-8" style={{ color: currentColor }} />
                ) : (
                  <span className="text-2xl font-bold" style={{ color: currentColor }}>
                    {currentName.charAt(0)}
                  </span>
                )}
                <span className="text-[10px] font-medium text-center px-1 truncate w-full">{currentName}</span>
                {level !== 'none' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Diamond className="h-2.5 w-2.5 text-primary-foreground" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <span className="ml-2 font-medium">{part.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline" className="ml-2 text-xs">{part.type}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Description:</span>
                <p className="text-xs mt-1 text-muted-foreground">{part.description}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Mode:</span>
                <span className="ml-2 text-xs">{part.manifestationMode}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Intensity:</span>
                <span className="ml-2 text-xs">{part.intensity}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Refinement Workspace */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="rename" className="gap-1.5 text-xs">
                <Type className="h-3.5 w-3.5" /> Rename
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-1.5 text-xs">
                <Palette className="h-3.5 w-3.5" /> Appearance
              </TabsTrigger>
              <TabsTrigger value="attributes" className="gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" /> Attributes
              </TabsTrigger>
              <TabsTrigger value="narrative" className="gap-1.5 text-xs">
                <BookOpen className="h-3.5 w-3.5" /> Narrative
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: RENAME */}
            <TabsContent value="rename">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <Label className="text-muted-foreground text-xs">Original Name (from assessment)</Label>
                    <Input value={part.name} disabled className="mt-1 bg-muted/50" />
                  </div>

                  <div>
                    <Label>Your Name for This Part</Label>
                    <Input
                      value={refinement?.customName || ''}
                      onChange={(e) => updateRefinement(partId, { customName: e.target.value }, 'customName')}
                      placeholder="What feels right?"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-xs">Why does this name feel right? (optional)</Label>
                    <Textarea
                      value={refinement?.nameReason || ''}
                      onChange={(e) => updateRefinement(partId, { nameReason: e.target.value })}
                      placeholder="What captures the essence of how this part shows up for you?"
                      className="mt-1 min-h-[80px]"
                    />
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Prompts to guide naming:</p>
                    <ul className="text-xs text-muted-foreground space-y-1.5">
                      <li className="flex gap-2"><Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" /> What captures the essence of how this part shows up for you?</li>
                      <li className="flex gap-2"><Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" /> Does this part remind you of a character, figure, or archetype?</li>
                      <li className="flex gap-2"><Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" /> What one word or phrase best describes what this part does?</li>
                    </ul>
                  </div>

                  {refinement && refinement.nameHistory.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Name History</Label>
                      <div className="mt-1 space-y-1">
                        {refinement.nameHistory.map((h, i) => (
                          <div key={i} className="text-xs flex justify-between items-center bg-muted/20 rounded px-2 py-1">
                            <span>{h.name}</span>
                            <span className="text-muted-foreground">{format(new Date(h.date), 'MMM d, yyyy')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: APPEARANCE */}
            <TabsContent value="appearance">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {/* Representation Type */}
                  <div>
                    <Label>Representation</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {(['icon', 'color', 'image'] as const).map((type) => (
                        <Button
                          key={type}
                          variant={refinement?.representationType === type ? 'default' : 'outline'}
                          className="h-auto py-3 flex-col gap-1"
                          onClick={() => updateRefinement(partId, { representationType: type })}
                        >
                          {type === 'icon' && <Star className="h-4 w-4" />}
                          {type === 'color' && <Palette className="h-4 w-4" />}
                          {type === 'image' && <FileText className="h-4 w-4" />}
                          <span className="text-xs capitalize">{type === 'icon' ? 'Icon Library' : type === 'color' ? 'Color Only' : 'Upload Image'}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Icon Library */}
                  {refinement?.representationType === 'icon' && (
                    <div>
                      <div className="flex gap-1 mb-2">
                        {['all', 'nature', 'figures', 'objects', 'symbols'].map((cat) => (
                          <Button
                            key={cat}
                            variant={iconFilter === cat ? 'secondary' : 'ghost'}
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => setIconFilter(cat)}
                          >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </Button>
                        ))}
                      </div>
                      <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-1">
                        {filteredIcons.map(({ name, Icon }) => (
                          <button
                            key={name}
                            className={`p-2 rounded-md border transition-all hover:bg-muted/50 ${
                              refinement?.selectedIcon === name ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-transparent'
                            }`}
                            onClick={() => updateRefinement(partId, { selectedIcon: name }, 'selectedIcon')}
                          >
                            <Icon className="h-5 w-5 mx-auto" style={{ color: currentColor }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Picker */}
                  <div>
                    <Label>Custom Color</Label>
                    <p className="text-xs text-muted-foreground mb-2">Changing color will override the default type color on your map.</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={refinement?.customColor || part.accentColor}
                        onChange={(e) => updateRefinement(partId, { customColor: e.target.value }, 'customColor')}
                        className="w-10 h-10 rounded-md border cursor-pointer"
                      />
                      <div className="flex-1">
                        <Input
                          value={refinement?.customColor || part.accentColor}
                          onChange={(e) => updateRefinement(partId, { customColor: e.target.value }, 'customColor')}
                          placeholder="hsl(230, 60%, 40%)"
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Prominence */}
                  <div>
                    <Label>Prominence on Map</Label>
                    <p className="text-xs text-muted-foreground mb-3">Controls node size on the Parts Map.</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">Low</span>
                      <Slider
                        value={[refinement?.prominence || 3]}
                        onValueChange={([v]) => updateRefinement(partId, { prominence: v })}
                        min={1}
                        max={5}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground">High</span>
                    </div>
                  </div>

                  {/* Visual Notes */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Why did you choose this representation? (optional)</Label>
                    <Textarea
                      value={refinement?.visualNotes || ''}
                      onChange={(e) => updateRefinement(partId, { visualNotes: e.target.value })}
                      placeholder="What feels right about this visual?"
                      className="mt-1 min-h-[60px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: ATTRIBUTES */}
            <TabsContent value="attributes">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Standard Attributes */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Standard Attributes</h3>
                      {[
                        { key: 'editedDescription', label: 'Description', original: part.description },
                        { key: 'editedManifestations', label: 'Manifestation Mode', original: part.manifestationMode },
                        { key: 'editedIntensity', label: 'Intensity', original: part.intensity },
                      ].map(({ key, label, original }) => (
                        <div key={key}>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">{label}</Label>
                            {(refinement as any)?.[key] && (
                              <Badge variant="outline" className="text-[9px] px-1">Personalized</Badge>
                            )}
                          </div>
                          <Textarea
                            value={(refinement as any)?.[key] || original}
                            onChange={(e) => updateRefinement(partId, { [key]: e.target.value }, key)}
                            className="mt-1 min-h-[60px] text-xs"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Right: Custom Attributes */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Custom Attributes</h3>
                        <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={() => setShowNewAttr(true)}>
                          <Plus className="h-3 w-3" /> Add
                        </Button>
                      </div>

                      {/* Suggested chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_ATTRIBUTES.filter(
                          (s) => !refinement?.customAttributes.some((a) => a.name === s)
                        ).map((s) => (
                          <button
                            key={s}
                            className="text-[10px] px-2 py-1 rounded-full border border-dashed border-primary/30 text-primary/70 hover:bg-primary/5 transition-colors"
                            onClick={() => {
                              addCustomAttribute(partId, s, '');
                            }}
                          >
                            + {s}
                          </button>
                        ))}
                      </div>

                      {showNewAttr && (
                        <div className="border rounded-lg p-3 space-y-2 bg-muted/20">
                          <Input
                            placeholder="Attribute name"
                            value={newAttrName}
                            onChange={(e) => setNewAttrName(e.target.value)}
                            className="text-xs h-8"
                          />
                          <Textarea
                            placeholder="Value"
                            value={newAttrValue}
                            onChange={(e) => setNewAttrValue(e.target.value)}
                            className="min-h-[50px] text-xs"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() => {
                                if (newAttrName.trim()) {
                                  addCustomAttribute(partId, newAttrName.trim(), newAttrValue);
                                  setNewAttrName('');
                                  setNewAttrValue('');
                                  setShowNewAttr(false);
                                }
                              }}
                            >
                              <Check className="h-3 w-3" /> Add
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowNewAttr(false)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {refinement?.customAttributes.map((attr) => (
                        <div key={attr.id} className="border rounded-lg p-3 space-y-1 bg-card">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">{attr.name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => deleteCustomAttribute(partId, attr.id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                          <Textarea
                            value={attr.value}
                            onChange={(e) => updateCustomAttribute(partId, attr.id, attr.name, e.target.value)}
                            className="min-h-[40px] text-xs"
                            placeholder={`Describe ${attr.name.toLowerCase()}...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: NARRATIVE */}
            <TabsContent value="narrative">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <Label className="text-sm font-semibold">This Part's Story</Label>
                    <Textarea
                      value={refinement?.story || ''}
                      onChange={(e) => updateRefinement(partId, { story: e.target.value }, 'story')}
                      placeholder="In your own words, write about this part — its history, its role in your life, what it's been through, what it wants you to know."
                      className="mt-2 min-h-[160px]"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Origin Story</Label>
                    <Textarea
                      value={refinement?.originStory || ''}
                      onChange={(e) => updateRefinement(partId, { originStory: e.target.value }, 'originStory')}
                      placeholder="How did this part come to be? What experiences shaped it?"
                      className="mt-1 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Part's Voice</Label>
                    <Textarea
                      value={refinement?.partVoice || ''}
                      onChange={(e) => updateRefinement(partId, { partVoice: e.target.value }, 'partVoice')}
                      placeholder="What would this part say if it could speak directly to you right now?"
                      className="mt-1 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Evolution Notes</Label>
                    <Textarea
                      value={refinement?.evolutionNotes || ''}
                      onChange={(e) => updateRefinement(partId, { evolutionNotes: e.target.value }, 'evolutionNotes')}
                      placeholder="How has this part changed over time? What have you learned about it?"
                      className="mt-1 min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Refinement History */}
          {refinement && refinement.history.length > 0 && (
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen} className="mt-4">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between text-xs text-muted-foreground">
                  <span>Refinement History ({refinement.history.length} changes)</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border rounded-lg mt-2 divide-y max-h-64 overflow-y-auto">
                  {[...refinement.history].reverse().map((change) => (
                    <div key={change.id} className="flex items-center justify-between px-3 py-2 text-xs">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{change.field}</span>
                        <span className="text-muted-foreground ml-2">
                          {change.oldValue ? `"${change.oldValue.slice(0, 20)}…"` : '(empty)'} → "{change.newValue.slice(0, 20)}…"
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-muted-foreground">{format(new Date(change.timestamp), 'MMM d, h:mm a')}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => revertChange(partId, change.id)}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
}
