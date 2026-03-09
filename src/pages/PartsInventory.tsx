import { useStore, PartType } from "@/lib/store";
import { useElaborationStore } from "@/lib/elaborationStore";
import { useRefineStore } from "@/lib/refineStore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, ArrowUpDown, Sparkles, PenLine, Diamond } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const typeColors: Record<PartType, string> = {
  Manager: "border-ifs-manager text-ifs-manager bg-ifs-manager/10",
  Firefighter: "border-ifs-firefighter text-ifs-firefighter bg-ifs-firefighter/10",
  Exile: "border-ifs-exile text-ifs-exile bg-ifs-exile/10",
  Self: "border-ifs-self text-ifs-self bg-ifs-self/10",
};

export default function PartsInventory() {
  const parts = useStore((state) => state.parts);
  const { getPartElaborationProgress, isPartElaborated } = useElaborationStore();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Parts Inventory</h1>
          <p className="text-muted-foreground">The master list of your internal system.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowUpDown className="h-4 w-4" /> Sort
          </Button>
          <Button size="sm" className="gap-2 bg-primary">
            <Plus className="h-4 w-4" /> Add Part
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parts.map((part) => {
          const progress = getPartElaborationProgress(part.id);
          const elaborated = isPartElaborated(part.id);
          return (
            <Card
              key={part.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-l-4 relative group"
              style={{ borderLeftColor: part.accentColor }}
            >
              {elaborated && (
                <div className="absolute top-2 right-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              )}
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{part.name}</h3>
                  <Badge variant="outline" className={`mt-1 ${typeColors[part.type]}`}>
                    {part.type}
                  </Badge>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center opacity-80"
                  style={{ backgroundColor: `${part.accentColor}20`, color: part.accentColor }}
                >
                  <span className="font-bold text-lg">{part.name.charAt(0)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {part.description}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-normal">
                    {part.manifestationMode}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-normal">
                    Intensity: {part.intensity}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
                    <Link to={`/elaborate/${part.id}`}>
                      <Sparkles className="h-3 w-3" />
                      {progress > 0 ? `Elaborate (${progress}%)` : 'Elaborate'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
