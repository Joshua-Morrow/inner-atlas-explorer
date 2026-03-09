import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAssessmentStore } from '@/lib/assessmentStore';
import { useStore, Part } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { Map, Grid, Sparkles } from 'lucide-react';

export default function AssessmentComplete() {
  const { identifiedParts, stage2Answers, stage3Answers } = useAssessmentStore();
  const { addPart, parts } = useStore();
  const navigate = useNavigate();

  const managers = identifiedParts.filter(p => p.partDef.type === 'Manager');
  const firefighters = identifiedParts.filter(p => p.partDef.type === 'Firefighter');
  const exiles = identifiedParts.filter(p => p.partDef.type === 'Exile');
  const top3 = [...identifiedParts].sort((a, b) => b.averageScore - a.averageScore).slice(0, 3);

  const populateInventory = () => {
    // Only add parts not already in inventory
    const existingIds = new Set(parts.map(p => p.id));
    for (const ip of identifiedParts) {
      if (existingIds.has(ip.partDef.id)) continue;
      const s2 = stage2Answers[ip.partDef.id];
      const manifestMode = s2?.manifestations
        ? Object.entries(s2.manifestations).sort(([,a],[,b]) => b - a)[0]?.[0] || ip.partDef.defaultManifestationMode
        : ip.partDef.defaultManifestationMode;

      const part: Omit<Part, 'id'> & { id?: string } = {
        id: ip.partDef.id,
        name: ip.partDef.name,
        type: ip.partDef.type,
        manifestationMode: manifestMode.charAt(0).toUpperCase() + manifestMode.slice(1),
        description: ip.partDef.description,
        intensity: s2?.intensity || (ip.status === 'highly-active' ? 'High' : 'Medium'),
        avatar: ip.partDef.defaultAvatar,
        accentColor: ip.partDef.defaultAccentColor,
      };
      // Use store's addPart but override ID
      useStore.setState((state) => ({
        parts: [...state.parts, { ...part, id: ip.partDef.id } as Part],
      }));
    }
  };

  const handleViewMap = () => {
    populateInventory();
    navigate('/map');
  };

  const handleViewParts = () => {
    populateInventory();
    navigate('/inventory');
  };

  const typeBadgeClass = (type: string) => {
    if (type === 'Manager') return 'bg-ifs-manager/15 text-ifs-manager border-ifs-manager/30';
    if (type === 'Firefighter') return 'bg-ifs-firefighter/15 text-ifs-firefighter border-ifs-firefighter/30';
    return 'bg-ifs-exile/15 text-ifs-exile border-ifs-exile/30';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg mx-auto px-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
        >
          <Sparkles className="w-10 h-10 text-primary" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-2">Your System is Ready</h1>
        <p className="text-muted-foreground mb-6">
          We've mapped your internal system based on your responses.
        </p>

        {/* Counts */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-ifs-manager">{managers.length}</div>
            <div className="text-xs text-muted-foreground">Managers</div>
          </div>
          <div className="text-muted-foreground">·</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-ifs-firefighter">{firefighters.length}</div>
            <div className="text-xs text-muted-foreground">Firefighters</div>
          </div>
          <div className="text-muted-foreground">·</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-ifs-exile">{exiles.length}</div>
            <div className="text-xs text-muted-foreground">Exiles</div>
          </div>
        </div>

        {/* Top 3 */}
        <Card className="mb-6 text-left">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Most Active Parts</h3>
            <div className="space-y-2">
              {top3.map((ip, i) => (
                <div key={ip.partDef.id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary/60 w-6">{i + 1}</span>
                  <Badge variant="outline" className={typeBadgeClass(ip.partDef.type)}>{ip.partDef.type}</Badge>
                  <span className="font-medium text-sm">{ip.partDef.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{ip.averageScore.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mini map preview */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {identifiedParts.map((ip) => (
                <div
                  key={ip.partDef.id}
                  className="px-2 py-1 rounded-full text-xs font-medium border"
                  style={{
                    borderColor: ip.partDef.defaultAccentColor,
                    backgroundColor: ip.partDef.defaultAccentColor + '15',
                  }}
                >
                  {ip.partDef.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleViewMap} size="lg" className="flex-1 gap-2">
            <Map className="h-4 w-4" /> View My Parts Map
          </Button>
          <Button onClick={handleViewParts} variant="outline" size="lg" className="flex-1 gap-2">
            <Grid className="h-4 w-4" /> Explore My Parts
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
