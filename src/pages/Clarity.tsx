import { useState } from 'react';
import { useClarityStore } from '@/lib/clarityStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Globe, Compass, Gem, BookMarked, ChevronLeft } from 'lucide-react';
import TherapeuticGoals from '@/components/clarity/TherapeuticGoals';
import LifeGoals from '@/components/clarity/LifeGoals';
import MissionStatement from '@/components/clarity/MissionStatement';
import CoreValues from '@/components/clarity/CoreValues';
import CoreMemories from '@/components/clarity/CoreMemories';

type Section = null | 'therapeutic-goals' | 'life-goals' | 'mission' | 'values' | 'memories';

const SECTIONS: { id: Section & string; title: string; description: string; icon: typeof Target }[] = [
  { id: 'therapeutic-goals', title: 'Therapeutic Goals', description: 'Identify and track what you want from your inner work.', icon: Target },
  { id: 'life-goals', title: 'Life Goals', description: 'Map your aspirations across life domains.', icon: Globe },
  { id: 'mission', title: 'Mission Statement', description: 'Build a personal mission rooted in Self-energy.', icon: Compass },
  { id: 'values', title: 'Core Values', description: 'Clarify what matters most — and who holds each value.', icon: Gem },
  { id: 'memories', title: 'Core Memories', description: 'Archive significant memories connected to your parts.', icon: BookMarked },
];

export default function Clarity() {
  const [activeSection, setActiveSection] = useState<Section>(null);
  const { savedMissionStatement, therapeuticGoals, memories, valueEntries } = useClarityStore();

  const essentialValues = valueEntries.filter((e) => e.bucket === 'essential');

  if (activeSection) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => setActiveSection(null)}>
          <ChevronLeft className="h-4 w-4" /> Back to Clarity
        </Button>
        {activeSection === 'therapeutic-goals' && <TherapeuticGoals />}
        {activeSection === 'life-goals' && <LifeGoals />}
        {activeSection === 'mission' && <MissionStatement />}
        {activeSection === 'values' && <CoreValues />}
        {activeSection === 'memories' && <CoreMemories />}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Clarity Suite</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Who am I, where am I going, and what matters most to me?
        </p>
      </div>

      {/* Mission banner */}
      {savedMissionStatement && (
        <Card className="bg-gradient-to-r from-primary/5 to-card border-primary/20">
          <CardContent className="py-4 text-center">
            <Compass className="h-5 w-5 text-primary mx-auto mb-2" />
            <blockquote className="text-sm font-medium italic max-w-lg mx-auto">"{savedMissionStatement}"</blockquote>
          </CardContent>
        </Card>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="py-3 text-center">
          <p className="text-2xl font-bold text-primary">{therapeuticGoals.length}</p>
          <p className="text-[10px] text-muted-foreground">Active Goals</p>
        </CardContent></Card>
        <Card><CardContent className="py-3 text-center">
          <p className="text-2xl font-bold text-primary">{essentialValues.length}</p>
          <p className="text-[10px] text-muted-foreground">Core Values</p>
        </CardContent></Card>
        <Card><CardContent className="py-3 text-center">
          <p className="text-2xl font-bold text-primary">{memories.length}</p>
          <p className="text-[10px] text-muted-foreground">Memories</p>
        </CardContent></Card>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map(({ id, title, description, icon: Icon }) => (
          <Card key={id}
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30 group"
            onClick={() => setActiveSection(id)}>
            <CardContent className="pt-6 pb-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
