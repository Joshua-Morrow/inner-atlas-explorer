import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  useSelfEnergyStore, practicesLibrary, Practice,
} from '@/lib/selfEnergyStore';
import { Heart, Star, Clock, ChevronRight, ChevronLeft, Plus } from 'lucide-react';

const categories = [
  'All',
  'Breathing & Grounding',
  'Unblending from Parts',
  'Compassion Practices',
  'Self Qualities',
];

export default function PracticesLibrary() {
  const { favoritePractices, toggleFavoritePractice, selfMoments, addSelfMoment, toggleMomentStar } = useSelfEnergyStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePractice, setActivePractice] = useState<Practice | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showJournal, setShowJournal] = useState(false);
  const [journalForm, setJournalForm] = useState({ whatHappened: '', whatHelped: '', howItFelt: '' });

  const favorites = practicesLibrary.filter((p) => favoritePractices.includes(p.id));
  const filtered = selectedCategory === 'All'
    ? practicesLibrary
    : practicesLibrary.filter((p) => p.category === selectedCategory);

  const depthColor = (d: string) => {
    if (d === 'Gentle') return 'bg-primary/10 text-primary border-primary/20';
    if (d === 'Moderate') return 'bg-ifs-firefighter/10 text-ifs-firefighter border-ifs-firefighter/20';
    return 'bg-ifs-exile/10 text-ifs-exile border-ifs-exile/20';
  };

  // Active practice step-through
  if (activePractice) {
    return (
      <div className="max-w-lg mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => { setActivePractice(null); setActiveStep(0); }}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Badge variant="outline">{activePractice.category}</Badge>
        </div>
        <h2 className="text-xl font-semibold mb-1">{activePractice.title}</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Clock className="h-3 w-3" /> {activePractice.duration}
          <Badge variant="outline" className={`text-[10px] ${depthColor(activePractice.depth)}`}>{activePractice.depth}</Badge>
        </div>

        <motion.div key={activeStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <div className="text-xs text-muted-foreground mb-2">Step {activeStep + 1} of {activePractice.steps.length}</div>
              <p className="text-lg leading-relaxed">{activePractice.steps[activeStep]}</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          {activeStep < activePractice.steps.length - 1 ? (
            <Button onClick={() => setActiveStep(activeStep + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={() => { setActivePractice(null); setActiveStep(0); }}>
              Complete
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Journal view
  if (showJournal) {
    return (
      <div className="max-w-lg mx-auto py-6 px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Self Moments Journal</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowJournal(false)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Record a Self Moment</h3>
            <div>
              <label className="text-sm font-medium mb-1 block">What was happening?</label>
              <Textarea value={journalForm.whatHappened} onChange={(e) => setJournalForm({ ...journalForm, whatHappened: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">What helped you access Self?</label>
              <Textarea value={journalForm.whatHelped} onChange={(e) => setJournalForm({ ...journalForm, whatHelped: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">How did it feel?</label>
              <Textarea value={journalForm.howItFelt} onChange={(e) => setJournalForm({ ...journalForm, howItFelt: e.target.value })} rows={2} />
            </div>
            <Button onClick={() => {
              if (journalForm.whatHappened.trim()) {
                addSelfMoment(journalForm);
                setJournalForm({ whatHappened: '', whatHelped: '', howItFelt: '' });
              }
            }} disabled={!journalForm.whatHappened.trim()}>
              Save Moment
            </Button>
          </CardContent>
        </Card>

        {selfMoments.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Past Moments</h3>
            {[...selfMoments].reverse().map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm">{m.whatHappened}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(m.date).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => toggleMomentStar(m.id)}>
                      <Star className={`h-4 w-4 ${m.starred ? 'text-ifs-self fill-ifs-self' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Library view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Self Practices</h2>
          <p className="text-sm text-muted-foreground">Guided exercises to strengthen Self-energy.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowJournal(true)} className="gap-1.5">
          <Heart className="h-3.5 w-3.5" /> Self Moments Journal
        </Button>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Favorites</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {favorites.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePractice(p)}
                className="flex-shrink-0 px-4 py-2 rounded-lg border bg-card hover:bg-accent transition-all text-left"
              >
                <div className="text-sm font-medium">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.duration}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${selectedCategory === c ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent text-muted-foreground'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Practices grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((p) => {
          const isFav = favoritePractices.includes(p.id);
          return (
            <Card key={p.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActivePractice(p)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">{p.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.category}</div>
                    {p.quality && <Badge variant="outline" className="mt-1 text-[10px] bg-ifs-self/10 text-ifs-self border-ifs-self/20">{p.quality}</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {p.duration}
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${depthColor(p.depth)}`}>{p.depth}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); toggleFavoritePractice(p.id); }}>
                      <Star className={`h-3.5 w-3.5 ${isFav ? 'text-ifs-self fill-ifs-self' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
