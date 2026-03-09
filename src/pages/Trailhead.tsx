import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/lib/store';
import {
  useTrailheadStore, EntryType, TrailChainNode,
} from '@/lib/trailheadStore';
import {
  Brain, Heart, Zap, Activity, ChevronRight, ChevronLeft, Pause,
  ArrowDown, Sparkles, Wind, Save, Map, CheckCircle2, Star,
} from 'lucide-react';

// ─── Grounding Exercise Component ───
function GroundingExercise({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<'in' | 'hold1' | 'out' | 'hold2'>('in');
  const [count, setCount] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          setPhase((p) => {
            if (p === 'in') return 'hold1';
            if (p === 'hold1') return 'out';
            if (p === 'out') return 'hold2';
            return 'in';
          });
          return 4;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const phaseLabel = { in: 'Breathe In', hold1: 'Hold', out: 'Breathe Out', hold2: 'Hold' };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-sm mx-auto px-6">
        <motion.div
          animate={{
            scale: phase === 'in' ? [1, 1.3] : phase === 'out' ? [1.3, 1] : 1.3,
          }}
          transition={{ duration: 4, ease: 'easeInOut' }}
          className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{count}</div>
            <div className="text-xs text-muted-foreground">{phaseLabel[phase]}</div>
          </div>
        </motion.div>
        <h2 className="text-xl font-semibold mb-2">Box Breathing</h2>
        <p className="text-sm text-muted-foreground mb-6">4 counts in · 4 hold · 4 out · 4 hold</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onExit}>Return to Trail</Button>
          <Button variant="outline" onClick={() => {
            useTrailheadStore.getState().pauseTrail();
          }}>
            <Save className="h-4 w-4 mr-1.5" /> Save & Exit
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Trail Chain Visualizer ───
function TrailChain({ chain, exile }: { chain: TrailChainNode[]; exile?: any }) {
  if (chain.length === 0 && !exile) return null;
  return (
    <div className="flex flex-col items-center gap-1 my-4">
      {chain.map((node, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="px-3 py-1.5 rounded-lg border text-xs font-medium bg-card shadow-sm flex items-center gap-1.5"
            style={{ borderColor: node.partType === 'Manager' ? 'hsl(230,60%,40%)' : node.partType === 'Firefighter' ? 'hsl(30,90%,50%)' : 'hsl(270,50%,60%)' }}>
            <Badge variant="outline" className="text-[9px] px-1">{node.partType}</Badge>
            {node.partName}
          </div>
          {(i < chain.length - 1 || exile) && (
            <ArrowDown className="h-4 w-4 text-muted-foreground my-0.5" />
          )}
        </div>
      ))}
      {exile && (
        <div className="px-3 py-1.5 rounded-full border-2 border-ifs-exile text-xs font-medium bg-ifs-exile/10 shadow-sm">
          <Sparkles className="inline h-3 w-3 mr-1 text-ifs-exile" />
          {exile.partName}
        </div>
      )}
    </div>
  );
}

// ─── Main Trailhead Page ───
export default function Trailhead() {
  const navigate = useNavigate();
  const parts = useStore((s) => s.parts);
  const {
    activeTrailId, currentStep, currentChainIndex, trails,
    startTrail, setStep, updateEntry, addChainNode, updateChainNode,
    setExile, updateExile, addSelfEnergyCheck, completeTrail, pauseTrail,
    getActiveTrail, enterGrounding, exitGrounding, setChainIndex,
  } = useTrailheadStore();

  const trail = getActiveTrail();

  // Local form state
  const [entryType, setEntryType] = useState<EntryType | null>(null);
  const [entryDesc, setEntryDesc] = useState('');
  const [entryIntensity, setEntryIntensity] = useState([5]);
  const [entryBody, setEntryBody] = useState('');
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [newPartName, setNewPartName] = useState('');
  const [selfEnergy, setSelfEnergy] = useState([50]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [trailName, setTrailName] = useState('');
  const [followChoice, setFollowChoice] = useState('');

  // If no active trail, show start screen
  if (!activeTrailId) {
    return <TrailLibrary onStart={() => startTrail()} />;
  }

  // ─── GROUNDING ───
  if (currentStep === 'grounding') {
    return <GroundingExercise onExit={exitGrounding} />;
  }

  // Pause & Ground button (always visible during session)
  const PauseButton = () => (
    <Button variant="ghost" size="sm" onClick={enterGrounding} className="text-muted-foreground gap-1.5 fixed bottom-6 right-6 z-50 bg-card border shadow-md">
      <Pause className="h-3.5 w-3.5" /> Pause & Ground
    </Button>
  );

  // ─── STEP 1: ENTRY ───
  if (currentStep === 'entry') {
    const entryOptions: { type: EntryType; icon: any; title: string; desc: string }[] = [
      { type: 'thought', icon: Brain, title: 'Thought', desc: 'A recurring or intrusive thought pattern' },
      { type: 'feeling', icon: Heart, title: 'Feeling', desc: 'An emotion that feels strong or disproportionate' },
      { type: 'sensation', icon: Activity, title: 'Sensation', desc: 'A noticeable physical sensation or tension' },
      { type: 'impulse', icon: Zap, title: 'Impulse', desc: 'A behavioral urge or reaction' },
    ];

    const entryQuestions: Record<EntryType, { q1: string; q3: string }> = {
      thought: { q1: 'What specific thought are you noticing?', q3: 'Where in your body do you notice a response to this thought?' },
      feeling: { q1: 'What emotion are you experiencing?', q3: 'Where do you feel this in your body?' },
      sensation: { q1: 'Describe the sensation', q3: 'What happens when you bring attention to it?' },
      impulse: { q1: 'What urge or action tendency are you experiencing?', q3: 'What happens in your body when you notice this?' },
    };

    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <PauseButton />
        <h1 className="text-2xl font-bold mb-1">Start a Trailhead</h1>
        <p className="text-muted-foreground mb-6 text-sm">What are you noticing right now that you'd like to follow?</p>

        {!entryType ? (
          <div className="grid grid-cols-2 gap-4">
            {entryOptions.map((opt) => (
              <motion.button
                key={opt.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEntryType(opt.type)}
                className="p-6 rounded-xl border-2 border-border hover:border-primary/50 bg-card text-left transition-colors"
              >
                <opt.icon className="h-8 w-8 text-primary mb-3" />
                <div className="font-semibold">{opt.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{opt.desc}</div>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 space-y-5">
                <Badge variant="outline" className="capitalize">{entryType}</Badge>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{entryQuestions[entryType].q1}</label>
                  <Textarea value={entryDesc} onChange={(e) => setEntryDesc(e.target.value)} rows={3} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">How strongly is this present? ({entryIntensity[0]}/10)</label>
                  <Slider value={entryIntensity} onValueChange={setEntryIntensity} max={10} min={1} step={1} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{entryQuestions[entryType].q3}</label>
                  <Textarea value={entryBody} onChange={(e) => setEntryBody(e.target.value)} rows={2} />
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setEntryType(null)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button
                    disabled={!entryDesc.trim()}
                    onClick={() => {
                      updateEntry({ type: entryType, description: entryDesc, intensity: entryIntensity[0], bodyResponse: entryBody });
                      setStep('part-id');
                    }}
                  >
                    Continue <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    );
  }

  // ─── STEP 2: PART IDENTIFICATION ───
  if (currentStep === 'part-id') {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <PauseButton />
        {trail && trail.chain.length > 0 && <TrailChain chain={trail.chain} />}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Does this experience connect to a part you know?</h2>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {parts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPartId(p.id); setNewPartName(''); }}
                  className={`p-3 rounded-lg border text-left text-sm transition-all ${selectedPartId === p.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-accent'}`}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.type}</div>
                </button>
              ))}
              <button
                onClick={() => { setSelectedPartId('new'); }}
                className={`p-3 rounded-lg border text-left text-sm border-dashed transition-all ${selectedPartId === 'new' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}
              >
                <div className="font-medium">+ New Part</div>
                <div className="text-xs text-muted-foreground">This feels like a new part</div>
              </button>
            </div>
            {selectedPartId === 'new' && (
              <Input placeholder="What name feels right for this part?" value={newPartName} onChange={(e) => setNewPartName(e.target.value)} />
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('entry')}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button
                disabled={!selectedPartId || (selectedPartId === 'new' && !newPartName.trim())}
                onClick={() => {
                  let partId = selectedPartId!;
                  let partName = '';
                  let partType = 'Manager';
                  let isNew = false;
                  if (selectedPartId === 'new') {
                    // Create new part
                    const id = Math.random().toString(36).substring(7);
                    useStore.getState().addPart({
                      name: newPartName, type: 'Manager', manifestationMode: 'Cognitive',
                      description: '', intensity: 'Medium', avatar: 'circle', accentColor: 'hsl(230, 60%, 40%)',
                    });
                    const newParts = useStore.getState().parts;
                    partId = newParts[newParts.length - 1].id;
                    partName = newPartName;
                    isNew = true;
                  } else {
                    const p = parts.find((p) => p.id === partId);
                    partName = p?.name || '';
                    partType = p?.type || 'Manager';
                  }
                  addChainNode({
                    partId, partName, partType, isNew,
                    purpose: '', duration: '', fear: '', isProtecting: '', managingFeelings: '',
                    underneathFeeling: '', willingToStep: '', whatComesUp: '',
                  });
                  setSelectedPartId(null);
                  setNewPartName('');
                  setStep('self-check');
                }}
              >
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── STEP 3: SELF CHECK-IN ───
  if (currentStep === 'self-check') {
    const energy = selfEnergy[0];
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <PauseButton />
        {trail && <TrailChain chain={trail.chain} />}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-semibold">Self-Energy Check</h2>
            <p className="text-sm text-muted-foreground">How connected do you feel to your Self energy right now?</p>
            <div className="space-y-2">
              <Slider value={selfEnergy} onValueChange={setSelfEnergy} max={100} min={0} step={1} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Blended</span>
                <span className="font-medium text-foreground">{energy}%</span>
                <span>Self-Led</span>
              </div>
            </div>
            {energy < 40 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg bg-accent border">
                <p className="text-sm mb-3">Before we go deeper, let's take a moment to settle.</p>
                <Button variant="outline" size="sm" onClick={enterGrounding}>
                  <Wind className="h-4 w-4 mr-1.5" /> Guided Breathing (60s)
                </Button>
              </motion.div>
            )}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('part-id')}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={() => { addSelfEnergyCheck(energy); setStep('part-explore'); }}>
                {energy < 40 ? 'Continue Anyway' : 'Continue'} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── STEP 4: PART EXPLORATION ───
  if (currentStep === 'part-explore') {
    const node = trail?.chain[currentChainIndex];
    if (!node) { setStep('entry'); return null; }
    const questions = [
      { key: 'purpose', q: 'What is this part trying to do for you?' },
      { key: 'duration', q: 'How long has this part been active in your system?' },
      { key: 'fear', q: 'What is this part afraid might happen if it didn\'t do its job?' },
      { key: 'isProtecting', q: 'Is this part protecting something or someone in your system?' },
      { key: 'managingFeelings', q: 'What feelings is this part trying to manage or prevent?' },
    ];
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <PauseButton />
        <TrailChain chain={trail?.chain || []} />
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{node.partType}</Badge>
              <h2 className="text-lg font-semibold">{node.partName}</h2>
            </div>
            {questions.map(({ key, q }) => (
              <div key={key}>
                <label className="text-sm font-medium mb-1.5 block">{q}</label>
                <Textarea
                  value={formData[key] || (node as any)[key] || ''}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  rows={2}
                />
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('self-check')}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={() => {
                updateChainNode(currentChainIndex, formData);
                setFormData({});
                setStep('follow');
              }}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── STEP 5: FOLLOWING THE TRAIL ───
  if (currentStep === 'follow') {
    const node = trail?.chain[currentChainIndex];
    if (!node) { setStep('entry'); return null; }
    const followQs = [
      { key: 'underneathFeeling', q: 'If you were to look past this part, what feeling might be underneath?' },
      { key: 'willingToStep', q: 'Ask this part: would it be willing to step aside slightly so we can see what\'s behind it?' },
      { key: 'whatComesUp', q: 'Notice what comes up when this part relaxes its activity a bit.' },
    ];
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <PauseButton />
        <TrailChain chain={trail?.chain || []} />
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-semibold">Following the Trail Deeper</h2>
            {followQs.map(({ key, q }) => (
              <div key={key}>
                <label className="text-sm font-medium mb-1.5 block">{q}</label>
                <Textarea
                  value={formData[key] || (node as any)[key] || ''}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  rows={2}
                />
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('part-explore')}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={() => {
                updateChainNode(currentChainIndex, formData);
                setFormData({});
                setStep('follow-choice');
              }}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── FOLLOW CHOICE ───
  if (currentStep === 'follow-choice') {
    const choices = [
      { value: 'another', label: 'Yes, another part is emerging', icon: ArrowDown },
      { value: 'vulnerable', label: 'I\'m sensing a vulnerable feeling', icon: Heart },
      { value: 'bottom', label: 'I\'ve reached the bottom', icon: CheckCircle2 },
      { value: 'pause', label: 'I need to pause here', icon: Pause },
    ];
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <PauseButton />
        <TrailChain chain={trail?.chain || []} />
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">What's emerging?</h2>
            <p className="text-sm text-muted-foreground">Is there another part, or a feeling/sensation underneath?</p>
            <div className="grid grid-cols-1 gap-2">
              {choices.map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    if (c.value === 'another') { setStep('part-id'); }
                    else if (c.value === 'vulnerable') { setStep('exile-recognition'); }
                    else if (c.value === 'bottom') { setStep('complete'); }
                    else { pauseTrail(); navigate('/'); }
                  }}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent text-left transition-all"
                >
                  <c.icon className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{c.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── STEP 6: EXILE RECOGNITION ───
  if (currentStep === 'exile-recognition') {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <PauseButton />
        <TrailChain chain={trail?.chain || []} />
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-semibold">Connecting with Something Deeper</h2>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Does this part carry emotions like abandonment, rejection, shame, fear, or sadness?</label>
              <Textarea value={formData.carriesEmotions || ''} onChange={(e) => setFormData({ ...formData, carriesEmotions: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Does this part feel younger or more vulnerable than the parts above it?</label>
              <Textarea value={formData.feelsYounger || ''} onChange={(e) => setFormData({ ...formData, feelsYounger: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Is there a sense this part has been carrying this burden for a long time?</label>
              <Textarea value={formData.longBurden || ''} onChange={(e) => setFormData({ ...formData, longBurden: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">What name feels right for this vulnerable part?</label>
              <Input value={formData.exileName || ''} onChange={(e) => setFormData({ ...formData, exileName: e.target.value })} placeholder="e.g., The Little One, The Scared One" />
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('follow-choice')}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={() => {
                const exileName = formData.exileName || 'Unnamed Exile';
                // Check if this exile exists
                const existing = parts.find((p) => p.name.toLowerCase() === exileName.toLowerCase());
                let partId = existing?.id || '';
                let isNew = !existing;
                if (isNew) {
                  useStore.getState().addPart({
                    name: exileName, type: 'Exile', manifestationMode: 'Emotional',
                    description: formData.carriesEmotions || '', intensity: 'High',
                    avatar: 'heart', accentColor: 'hsl(270, 50%, 60%)',
                  });
                  const newParts = useStore.getState().parts;
                  partId = newParts[newParts.length - 1].id;
                }
                setExile({
                  partId, partName: exileName, isNew,
                  carriesEmotions: formData.carriesEmotions || '',
                  feelsYounger: formData.feelsYounger || '',
                  longBurden: formData.longBurden || '',
                  selfAwareness: '', exileMessage: '',
                });
                setFormData({});
                setStep('exile-safety');
              }}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── EXILE SAFETY CHECK ───
  if (currentStep === 'exile-safety') {
    const energy = selfEnergy[0];
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <PauseButton />
        <TrailChain chain={trail?.chain || []} exile={trail?.exile} />
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-semibold">Safety Check</h2>
            <p className="text-sm text-muted-foreground">Check that you have enough Self-energy to be with this exile.</p>
            <Slider value={selfEnergy} onValueChange={setSelfEnergy} max={100} min={0} step={1} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Blended</span><span className="font-medium text-foreground">{energy}%</span><span>Self-Led</span>
            </div>
            {energy < 30 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="text-sm">This exile carries deep feelings. It's okay to stop here and come back when you have more Self-energy available.</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => { pauseTrail(); navigate('/'); }}>
                  <Save className="h-4 w-4 mr-1.5" /> Save Trail for Later
                </Button>
              </motion.div>
            )}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('exile-recognition')}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={() => { addSelfEnergyCheck(energy); setStep('exile-connect'); }}>
                {energy < 30 ? 'Proceed Carefully' : 'Continue'} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── EXILE CONNECT ───
  if (currentStep === 'exile-connect') {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <PauseButton />
        <TrailChain chain={trail?.chain || []} exile={trail?.exile} />
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-semibold">Connecting with {trail?.exile?.partName}</h2>
            <div>
              <label className="text-sm font-medium mb-1.5 block">From your Self, bring gentle awareness to this exile. What do you notice?</label>
              <Textarea value={formData.selfAwareness || ''} onChange={(e) => setFormData({ ...formData, selfAwareness: e.target.value })} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Is there anything this exile wants you to know right now?</label>
              <Textarea value={formData.exileMessage || ''} onChange={(e) => setFormData({ ...formData, exileMessage: e.target.value })} rows={3} />
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('exile-safety')}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={() => {
                updateExile({ selfAwareness: formData.selfAwareness || '', exileMessage: formData.exileMessage || '' });
                setFormData({});
                setStep('complete');
              }}>
                Complete Trail <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── STEP 7: COMPLETION ───
  if (currentStep === 'complete') {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Trail Complete</h1>
          <p className="text-muted-foreground text-sm">You followed the activation chain to its source.</p>
        </motion.div>

        <TrailChain chain={trail?.chain || []} exile={trail?.exile} />

        <Card className="border-0 shadow-md mt-4">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name this trail</label>
              <Input value={trailName} onChange={(e) => setTrailName(e.target.value)} placeholder="e.g., Presentation Anxiety Trail" />
            </div>

            <div className="space-y-2 pt-2">
              <Button className="w-full gap-2" onClick={() => {
                completeTrail(trailName || 'Untitled Trail');
                navigate('/map');
              }}>
                <Map className="h-4 w-4" /> Save & View Parts Map
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => {
                completeTrail(trailName || 'Untitled Trail');
                navigate('/inventory');
              }}>
                Save & View Inventory
              </Button>
              {trail?.exile && (
                <Button variant="outline" className="w-full gap-2" onClick={() => {
                  completeTrail(trailName || 'Untitled Trail');
                  navigate(`/elaborate/${trail.exile!.partId}`);
                }}>
                  <Sparkles className="h-4 w-4" /> Elaborate on {trail.exile.partName}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

// ─── Trail Library (shown when no active trail) ───
function TrailLibrary({ onStart }: { onStart: () => void }) {
  const navigate = useNavigate();
  const { trails, resumeTrail, toggleStar } = useTrailheadStore();
  const completed = trails.filter((t) => t.status === 'completed');
  const paused = trails.filter((t) => t.status === 'paused');

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Trailhead</h1>
          <p className="text-muted-foreground">Follow activation chains to discover what's underneath.</p>
        </div>
        <Button onClick={onStart} className="gap-2">
          <Zap className="h-4 w-4" /> Start a Trail
        </Button>
      </div>

      {paused.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Paused Trails</h2>
          <div className="grid gap-3">
            {paused.map((t) => (
              <Card key={t.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { resumeTrail(t.id); }}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.name || 'In Progress'}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()} · {t.chain.length} parts in chain</div>
                  </div>
                  <Badge variant="secondary">Paused</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Completed Trails</h2>
          <div className="grid gap-3">
            {completed.map((t) => (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {t.starred && <Star className="h-3.5 w-3.5 text-ifs-self fill-ifs-self" />}
                      {t.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(t.date).toLocaleDateString()} · {t.entry?.type} →{' '}
                      {t.chain.length} parts{t.exile ? ` → ${t.exile.partName}` : ''}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleStar(t.id); }}>
                    <Star className={`h-4 w-4 ${t.starred ? 'text-ifs-self fill-ifs-self' : 'text-muted-foreground'}`} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {trails.length === 0 && (
        <div className="text-center py-16">
          <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No trails yet. Start your first trailhead to discover what's beneath your protection system.</p>
        </div>
      )}
    </div>
  );
}
