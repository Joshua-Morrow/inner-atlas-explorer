import { useState } from 'react';
import { useStore, PartType } from '@/lib/store';
import { useDynamicsStore, PartDynamic, DynamicType } from '@/lib/dynamicsStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeftRight, Users } from 'lucide-react';
import { CreateDynamicFlow } from '@/components/dynamics/CreateDynamicFlow';
import { DynamicDetail } from '@/components/dynamics/DynamicDetail';

const typeColors: Record<PartType, string> = {
  Manager: 'bg-[hsl(var(--ifs-manager)/.15)] text-[hsl(var(--ifs-manager))] border-[hsl(var(--ifs-manager)/.3)]',
  Firefighter: 'bg-[hsl(var(--ifs-firefighter)/.15)] text-[hsl(var(--ifs-firefighter))] border-[hsl(var(--ifs-firefighter)/.3)]',
  Exile: 'bg-[hsl(var(--ifs-exile)/.15)] text-[hsl(var(--ifs-exile))] border-[hsl(var(--ifs-exile)/.3)]',
  Self: 'bg-[hsl(var(--ifs-self)/.15)] text-[hsl(var(--ifs-self))] border-[hsl(var(--ifs-self)/.3)]',
};

export default function Dynamics() {
  const parts = useStore((s) => s.parts);
  const dynamics = useDynamicsStore((s) => s.dynamics);

  const [tab, setTab] = useState<DynamicType>('polarization');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDynamic, setSelectedDynamic] = useState<PartDynamic | null>(null);

  const polarizations = dynamics.filter((d) => d.dynamicType === 'polarization');
  const alliances = dynamics.filter((d) => d.dynamicType === 'alliance');

  // If viewing detail, show that
  if (selectedDynamic) {
    const fresh = dynamics.find((d) => d.id === selectedDynamic.id);
    if (!fresh) return <DynamicDetail dynamic={selectedDynamic} onBack={() => setSelectedDynamic(null)} />;
    return <DynamicDetail dynamic={fresh} onBack={() => setSelectedDynamic(null)} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dynamics</h1>
        <p className="text-muted-foreground">Polarizations and alliances between your parts.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as DynamicType)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="polarization" className="gap-1.5">
            <ArrowLeftRight className="h-4 w-4" /> Polarizations
          </TabsTrigger>
          <TabsTrigger value="alliance" className="gap-1.5">
            <Users className="h-4 w-4" /> Alliances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="polarization" className="space-y-3 mt-4">
          {polarizations.length === 0 ? (
            <EmptyState type="polarization" />
          ) : (
            polarizations.map((d) => (
              <DynamicCard key={d.id} dynamic={d} parts={parts} onClick={() => setSelectedDynamic(d)} />
            ))
          )}
        </TabsContent>

        <TabsContent value="alliance" className="space-y-3 mt-4">
          {alliances.length === 0 ? (
            <EmptyState type="alliance" />
          ) : (
            alliances.map((d) => (
              <DynamicCard key={d.id} dynamic={d} parts={parts} onClick={() => setSelectedDynamic(d)} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* FAB */}
      <Button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-20"
        style={{
          backgroundColor: tab === 'polarization' ? 'hsl(var(--dynamics-polarization))' : 'hsl(var(--dynamics-alliance))',
        }}
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>

      <CreateDynamicFlow
        open={createOpen}
        onOpenChange={setCreateOpen}
        dynamicType={tab}
      />
    </div>
  );
}

function DynamicCard({ dynamic, parts, onClick }: { dynamic: PartDynamic; parts: any[]; onClick: () => void }) {
  const statusColor =
    dynamic.status === 'active' ? 'border-dynamics-polarization text-dynamics-polarization' :
    dynamic.status === 'easing' ? 'border-amber-500 text-amber-500' :
    'border-dynamics-alliance text-dynamics-alliance';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-4 hover:bg-accent/30 transition-colors ${
        dynamic.status === 'resolved' ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm">{dynamic.title}</h3>
        <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColor}`}>
          {dynamic.status.charAt(0).toUpperCase() + dynamic.status.slice(1)}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {dynamic.partIds.map((pId) => {
          const part = parts.find((p: any) => p.id === pId);
          if (!part) return null;
          return (
            <Badge key={pId} variant="outline" className={`text-[10px] ${typeColors[part.type]}`}>
              {part.name}
            </Badge>
          );
        })}
      </div>
      {dynamic.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{dynamic.description}</p>
      )}
    </button>
  );
}

function EmptyState({ type }: { type: DynamicType }) {
  return (
    <div className="text-center py-12 px-4">
      {type === 'polarization' ? (
        <ArrowLeftRight className="h-12 w-12 mx-auto text-dynamics-polarization/40 mb-4" />
      ) : (
        <Users className="h-12 w-12 mx-auto text-dynamics-alliance/40 mb-4" />
      )}
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {type === 'polarization'
          ? "No polarizations mapped yet. A polarization is when two parts are locked in opposition — each one's intensity driving the other's."
          : 'No alliances mapped yet. An alliance is when two or more parts coordinate toward the same protective goal, often without awareness of each other.'}
      </p>
    </div>
  );
}
