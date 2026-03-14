import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnapshotStore } from '@/lib/snapshotStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import Snapshot from './Snapshot';

export default function SnapshotHistory() {
  const navigate = useNavigate();
  const snapshots = useSnapshotStore((s) => s.snapshots);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const sorted = [...snapshots].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const viewing = viewingId ? sorted.find((s) => s.id === viewingId) : null;

  if (viewing) {
    return (
      <div>
        <div className="max-w-3xl mx-auto mb-4">
          <Button variant="ghost" size="sm" onClick={() => setViewingId(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to History
          </Button>
        </div>
        <Snapshot readOnlySnapshot={viewing} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Snapshot History</h1>
          <p className="text-sm text-muted-foreground">{sorted.length} snapshot{sorted.length !== 1 ? 's' : ''} saved</p>
        </div>
        <Button onClick={() => navigate('/snapshot')} className="gap-2">
          <Plus className="h-4 w-4" /> New Snapshot
        </Button>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Camera className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No snapshots saved yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Generate your first snapshot to capture your system's current state.</p>
            <Button className="mt-4" onClick={() => navigate('/snapshot')}>Generate Snapshot</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((snap) => (
            <Card key={snap.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setViewingId(snap.id)}>
              <CardContent className="py-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{format(new Date(snap.createdAt), 'MMMM d, yyyy')}</div>
                  <div className="text-sm text-muted-foreground">{format(new Date(snap.createdAt), 'h:mm a')}</div>
                </div>
                <div className="flex gap-2 text-xs">
                  <Badge variant="secondary">{snap.totalParts} parts</Badge>
                  <Badge variant="secondary">{snap.totalDialogues} dialogues</Badge>
                  {snap.totalPracticeSessions > 0 && <Badge variant="secondary">{snap.totalPracticeSessions} practices</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
