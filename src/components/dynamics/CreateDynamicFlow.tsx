import { useState } from 'react';
import { useStore, PartType } from '@/lib/store';
import { useDynamicsStore, DynamicType, DynamicStatus } from '@/lib/dynamicsStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

const typeColors: Record<PartType, string> = {
  Manager: 'bg-[hsl(var(--ifs-manager)/.15)] text-[hsl(var(--ifs-manager))] border-[hsl(var(--ifs-manager)/.3)]',
  Firefighter: 'bg-[hsl(var(--ifs-firefighter)/.15)] text-[hsl(var(--ifs-firefighter))] border-[hsl(var(--ifs-firefighter)/.3)]',
  Exile: 'bg-[hsl(var(--ifs-exile)/.15)] text-[hsl(var(--ifs-exile))] border-[hsl(var(--ifs-exile)/.3)]',
  Self: 'bg-[hsl(var(--ifs-self)/.15)] text-[hsl(var(--ifs-self))] border-[hsl(var(--ifs-self)/.3)]',
};

const statusOptions: { value: DynamicStatus; label: string; desc: string; color: string }[] = [
  { value: 'active', label: 'Active', desc: 'This dynamic is currently present and activated', color: 'border-dynamics-polarization bg-dynamics-polarization/10' },
  { value: 'easing', label: 'Easing', desc: 'Starting to shift — less intense than before', color: 'border-amber-500 bg-amber-500/10' },
  { value: 'resolved', label: 'Resolved', desc: 'This dynamic has settled and no longer drives behavior', color: 'border-dynamics-alliance bg-dynamics-alliance/10' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dynamicType: DynamicType;
  preSelectedPartId?: string;
}

export function CreateDynamicFlow({ open, onOpenChange, dynamicType, preSelectedPartId }: Props) {
  const parts = useStore((s) => s.parts).filter((p) => p.type !== 'Self');
  const addDynamic = useDynamicsStore((s) => s.addDynamic);

  const maxParts = dynamicType === 'polarization' ? 2 : 4;
  const minParts = 2;
  const totalSteps = dynamicType === 'polarization' ? 7 : 6;

  const [step, setStep] = useState(0);
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>(preSelectedPartId ? [preSelectedPartId] : []);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fears, setFears] = useState<Record<string, string>>({});
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState<DynamicStatus>('active');

  const togglePart = (id: string) => {
    setSelectedPartIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : prev.length < maxParts ? [...prev, id] : prev
    );
  };

  const defaultTitle = () => {
    const names = selectedPartIds.map((id) => parts.find((p) => p.id === id)?.name || '?');
    return names.join(' + ');
  };

  const handleSave = () => {
    addDynamic({
      dynamicType,
      title: title.trim() || defaultTitle(),
      partIds: selectedPartIds,
      description,
      eachPartFears: fears,
      costToSystem: cost,
      resolutionNotes: '',
      status,
    });
    onOpenChange(false);
    // Reset
    setStep(0);
    setSelectedPartIds(preSelectedPartId ? [preSelectedPartId] : []);
    setTitle('');
    setDescription('');
    setFears({});
    setCost('');
    setStatus('active');
  };

  // Step mapping: for alliances, skip the "fears" step
  const getActualStep = () => {
    if (dynamicType === 'alliance' && step >= 4) return step + 1; // skip fears step index 4
    return step;
  };

  const actualStep = getActualStep();

  const canContinue = () => {
    if (step === 0) return selectedPartIds.length >= minParts;
    return true;
  };

  const isLastStep = step === totalSteps - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge className={dynamicType === 'polarization' ? 'bg-dynamics-polarization text-white border-0' : 'bg-dynamics-alliance text-white border-0'}>
              {dynamicType === 'polarization' ? 'Polarization' : 'Alliance'}
            </Badge>
            <span className="text-xs text-muted-foreground">Step {step + 1} of {totalSteps}</span>
          </div>
        </DialogHeader>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full bg-muted">
          <div
            className="h-1 rounded-full transition-all"
            style={{
              width: `${((step + 1) / totalSteps) * 100}%`,
              backgroundColor: dynamicType === 'polarization' ? 'hsl(var(--dynamics-polarization))' : 'hsl(var(--dynamics-alliance))',
            }}
          />
        </div>

        <div className="py-4 space-y-4">
          {/* Step 0 — Select parts */}
          {actualStep === 0 && (
            <>
              <DialogTitle className="text-lg">Which parts are involved in this {dynamicType}?</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Select {dynamicType === 'polarization' ? 'exactly 2 parts' : '2 to 4 parts'}.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {parts.map((part) => {
                  const selected = selectedPartIds.includes(part.id);
                  return (
                    <button
                      key={part.id}
                      onClick={() => togglePart(part.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                        selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: `${part.accentColor}20`, color: part.accentColor }}
                      >
                        {part.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{part.name}</div>
                        <Badge variant="outline" className={`text-[10px] px-1 ${typeColors[part.type]}`}>{part.type}</Badge>
                      </div>
                      {selected && <Check className="h-4 w-4 text-primary ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 1 — Name */}
          {actualStep === 1 && (
            <>
              <DialogTitle className="text-lg">Give this dynamic a name</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Something that captures what this pattern feels like — e.g. "The Push-Pull", "Critic and Escaper", "The Perfectionist Pair"
              </p>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={defaultTitle()}
              />
              <p className="text-xs text-muted-foreground">Optional — defaults to "{defaultTitle()}"</p>
            </>
          )}

          {/* Step 2 — Description */}
          {actualStep === 2 && (
            <>
              <DialogTitle className="text-lg">What does this dynamic look like in behavior?</DialogTitle>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="How does this pattern show up in daily life? What triggers it? What does it feel like from the inside?"
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">Optional — you can add this later.</p>
            </>
          )}

          {/* Step 3 — Fears (polarizations only, actualStep === 3) */}
          {actualStep === 3 && dynamicType === 'polarization' && (
            <>
              <DialogTitle className="text-lg">What does each part fear?</DialogTitle>
              {selectedPartIds.map((pId) => {
                const part = parts.find((p) => p.id === pId);
                if (!part) return null;
                return (
                  <div key={pId} className="space-y-1.5">
                    <label className="text-sm font-medium">
                      What does <span style={{ color: part.accentColor }}>{part.name}</span> fear will happen if it relaxes?
                    </label>
                    <Textarea
                      value={fears[pId] || ''}
                      onChange={(e) => setFears((f) => ({ ...f, [pId]: e.target.value }))}
                      placeholder="Optional"
                      className="min-h-[80px]"
                    />
                  </div>
                );
              })}
            </>
          )}

          {/* Step 4/3 — Cost */}
          {((dynamicType === 'polarization' && actualStep === 4) || (dynamicType === 'alliance' && actualStep === 4)) && (
            <>
              <DialogTitle className="text-lg">What does this dynamic cost the system?</DialogTitle>
              <Textarea
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="What opportunities, connections, or peace does this pattern consume?"
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">Optional</p>
            </>
          )}

          {/* Step 5/4 — Status */}
          {((dynamicType === 'polarization' && actualStep === 5) || (dynamicType === 'alliance' && actualStep === 5)) && (
            <>
              <DialogTitle className="text-lg">Current status</DialogTitle>
              <div className="space-y-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      status === opt.value ? opt.color + ' shadow-sm' : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="font-medium text-sm">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Final step — Review */}
          {((dynamicType === 'polarization' && actualStep === 6) || (dynamicType === 'alliance' && actualStep === 6)) && (
            <>
              <DialogTitle className="text-lg">Review</DialogTitle>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={dynamicType === 'polarization' ? 'bg-dynamics-polarization text-white border-0' : 'bg-dynamics-alliance text-white border-0'}>
                    {dynamicType === 'polarization' ? 'Polarization' : 'Alliance'}
                  </Badge>
                  <Badge variant="outline" className={
                    status === 'active' ? 'border-dynamics-polarization text-dynamics-polarization' :
                    status === 'easing' ? 'border-amber-500 text-amber-500' :
                    'border-dynamics-alliance text-dynamics-alliance'
                  }>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </div>
                <h3 className="font-semibold">{title.trim() || defaultTitle()}</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedPartIds.map((pId) => {
                    const part = parts.find((p) => p.id === pId);
                    if (!part) return null;
                    return (
                      <Badge key={pId} variant="outline" className={typeColors[part.type]}>
                        {part.name}
                      </Badge>
                    );
                  })}
                </div>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between pt-2">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>

          {isLastStep ? (
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" /> Save
            </Button>
          ) : (
            <Button onClick={() => setStep(step + 1)} disabled={!canContinue()}>
              {step === 0 ? 'Continue' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
