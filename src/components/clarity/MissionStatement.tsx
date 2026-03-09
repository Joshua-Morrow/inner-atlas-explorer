import { useState } from 'react';
import { useClarityStore, PeakExperience, MissionData } from '@/lib/clarityStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Compass, Check, X } from 'lucide-react';

const TALENT_SUGGESTIONS = [
  'Listening', 'Creating', 'Organizing', 'Connecting people', 'Teaching',
  'Solving problems', 'Building', 'Holding space', 'Leading', 'Imagining', 'Healing',
];

export default function MissionStatement() {
  const { mission, setMission, savedMissionStatement, setSavedMissionStatement } = useClarityStore();
  const [step, setStep] = useState(mission?.savedAt ? 0 : 1);

  const [peaks, setPeaks] = useState<[PeakExperience, PeakExperience, PeakExperience]>(
    mission?.peakExperiences || [{ description: '', values: '' }, { description: '', values: '' }, { description: '', values: '' }]
  );
  const [talents, setTalents] = useState<string[]>(mission?.talents || []);
  const [talentInput, setTalentInput] = useState('');
  const [serveWho, setServeWho] = useState(mission?.serveWho || '');
  const [difference, setDifference] = useState(mission?.difference || '');
  const [problem, setProblem] = useState(mission?.problem || '');
  const [partsReview, setPartsReview] = useState<'yes' | 'no' | 'not-sure'>(mission?.partsReview || 'no');
  const [partsNote, setPartsNote] = useState(mission?.partsNote || '');
  const [selfResponse, setSelfResponse] = useState(mission?.selfResponse || '');
  const [draft, setDraft] = useState(mission?.draft || '');
  const [selfCheckDone, setSelfCheckDone] = useState(false);

  const generateDraft = () => {
    const means = talents.slice(0, 3).join(', ');
    return `I exist to ${difference || '[impact]'} for ${serveWho || '[who]'} by ${means || '[means]'}.`;
  };

  const handleComplete = () => {
    const data: MissionData = {
      peakExperiences: peaks, talents, serveWho, difference, problem,
      partsReview, partsNote, selfResponse, draft: draft || generateDraft(),
      selfCheck: selfCheckDone, savedAt: new Date().toISOString(),
    };
    setMission(data);
    setSavedMissionStatement(data.draft);
    setStep(0);
  };

  // Saved state view
  if (step === 0 && savedMissionStatement) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Mission Statement</h2>
        <Card className="bg-gradient-to-br from-primary/5 to-card border-primary/20">
          <CardContent className="pt-6 text-center space-y-4">
            <Compass className="h-8 w-8 text-primary mx-auto" />
            <blockquote className="text-lg font-medium italic leading-relaxed max-w-lg mx-auto">
              "{savedMissionStatement}"
            </blockquote>
            {mission?.savedAt && <p className="text-[10px] text-muted-foreground">Saved {new Date(mission.savedAt).toLocaleDateString()}</p>}
          </CardContent>
        </Card>
        <Button variant="outline" size="sm" onClick={() => setStep(1)}>Revise Mission Statement</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mission Statement Workshop — Step {step} of 4</h2>
        {savedMissionStatement && <Button variant="ghost" size="sm" onClick={() => setStep(0)}>Cancel</Button>}
      </div>
      <div className="flex gap-1">
        {[1,2,3,4].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      {step === 1 && (
        <Card><CardContent className="pt-6 space-y-6">
          <p className="text-sm font-medium">Describe 3 moments when you felt most alive, most yourself, most fulfilled.</p>
          {peaks.map((peak, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2">
              <Label className="text-xs">Moment {i + 1}</Label>
              <Textarea value={peak.description} onChange={(e) => {
                const updated = [...peaks] as typeof peaks;
                updated[i] = { ...updated[i], description: e.target.value };
                setPeaks(updated);
              }} placeholder="Describe this moment..." className="min-h-[80px]" />
              <Label className="text-xs text-muted-foreground">What values were you expressing?</Label>
              <Input value={peak.values} onChange={(e) => {
                const updated = [...peaks] as typeof peaks;
                updated[i] = { ...updated[i], values: e.target.value };
                setPeaks(updated);
              }} placeholder="e.g., creativity, connection, courage..." />
            </div>
          ))}
        </CardContent></Card>
      )}

      {step === 2 && (
        <Card><CardContent className="pt-6 space-y-4">
          <Label>What comes naturally to you that others often notice or appreciate?</Label>
          <div className="flex flex-wrap gap-1.5">
            {TALENT_SUGGESTIONS.filter((t) => !talents.includes(t)).map((t) => (
              <button key={t} className="text-xs px-2.5 py-1 rounded-full border border-dashed border-primary/30 text-primary/70 hover:bg-primary/5"
                onClick={() => setTalents([...talents, t])}>
                + {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={talentInput} onChange={(e) => setTalentInput(e.target.value)}
              placeholder="Add your own..." className="text-xs" onKeyDown={(e) => {
                if (e.key === 'Enter' && talentInput.trim()) { setTalents([...talents, talentInput.trim()]); setTalentInput(''); }
              }} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {talents.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1 text-xs">
                {t}
                <button onClick={() => setTalents(talents.filter((x) => x !== t))}><X className="h-2.5 w-2.5" /></button>
              </Badge>
            ))}
          </div>
        </CardContent></Card>
      )}

      {step === 3 && (
        <Card><CardContent className="pt-6 space-y-4">
          <div><Label>Who do you most want to serve or contribute to?</Label>
            <Textarea value={serveWho} onChange={(e) => setServeWho(e.target.value)} className="mt-1 min-h-[60px]" /></div>
          <div><Label>What difference do you most want to make in the world?</Label>
            <Textarea value={difference} onChange={(e) => setDifference(e.target.value)} className="mt-1 min-h-[60px]" /></div>
          <div><Label>What problem or suffering do you feel drawn to address?</Label>
            <Textarea value={problem} onChange={(e) => setProblem(e.target.value)} className="mt-1 min-h-[60px]" /></div>
        </CardContent></Card>
      )}

      {step === 4 && (
        <Card><CardContent className="pt-6 space-y-4">
          <Label>Parts Review — Do any parts want to edit this for approval, achievement, or safety?</Label>
          <div className="flex gap-2">
            {(['yes', 'no', 'not-sure'] as const).map((opt) => (
              <Button key={opt} variant={partsReview === opt ? 'default' : 'outline'} size="sm"
                onClick={() => setPartsReview(opt)}>
                {opt === 'yes' ? 'Yes' : opt === 'no' ? 'No' : 'Not sure'}
              </Button>
            ))}
          </div>
          {partsReview === 'yes' && (
            <>
              <Textarea value={partsNote} onChange={(e) => setPartsNote(e.target.value)} placeholder="What are those parts saying?" className="min-h-[60px]" />
              <Textarea value={selfResponse} onChange={(e) => setSelfResponse(e.target.value)} placeholder="What would your Self say back?" className="min-h-[60px]" />
            </>
          )}

          <div className="border-t pt-4 space-y-3">
            <Label className="font-semibold">Your Mission Draft</Label>
            <Textarea value={draft || generateDraft()} onChange={(e) => setDraft(e.target.value)}
              className="min-h-[80px] text-base font-medium" />
            <div className="flex items-center gap-2">
              <Button variant={selfCheckDone ? 'default' : 'outline'} size="sm" className="gap-1"
                onClick={() => setSelfCheckDone(!selfCheckDone)}>
                <Check className="h-3 w-3" /> This feels true from Self-energy
              </Button>
            </div>
          </div>
        </CardContent></Card>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" size="sm" disabled={step <= 1} onClick={() => setStep(step - 1)}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {step < 4 ? (
          <Button size="sm" onClick={() => setStep(step + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleComplete} disabled={!draft && !difference}>Save Mission</Button>
        )}
      </div>
    </div>
  );
}
