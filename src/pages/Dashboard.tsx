import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, Map, Zap, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Slider } from "@/components/ui/slider";

export default function Dashboard() {
  const parts = useStore((state) => state.parts);
  const dialogues = useStore((state) => state.dialogues);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your internal system overview.</p>
        </div>
      </div>

      {/* Self-Energy Check-In */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-ifs-self" />
            Daily Self-Energy Check-In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Blended (0)</span>
              <span className="font-medium text-foreground">Self-Led (8)</span>
              <span>Fully Present (10)</span>
            </div>
            <Slider defaultValue={[8]} max={10} step={1} className="w-full" />
            <p className="text-sm text-muted-foreground pt-2">
              You're feeling relatively grounded and centered today.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Parts</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-bold text-primary">{parts.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Identified in system</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dialogues</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dialogues.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Recorded conversations</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium italic">"Which part has been most active in protecting you today?"</p>
            <Button variant="link" className="px-0 mt-2 h-auto text-primary" asChild>
              <Link to="/update">Log a reflection &rarr;</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-24 flex-col gap-2 bg-card hover:bg-secondary border-dashed" asChild>
          <Link to="/inventory">
            <Plus className="h-6 w-6 text-primary" />
            <span>Add New Part</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2 bg-card hover:bg-secondary border-dashed" asChild>
          <Link to="/dialogue">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span>New Dialogue</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2 bg-card hover:bg-secondary border-dashed" asChild>
          <Link to="/update">
            <Zap className="h-6 w-6 text-primary" />
            <span>Quick Update</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2 bg-card hover:bg-secondary border-dashed" asChild>
          <Link to="/map">
            <Map className="h-6 w-6 text-primary" />
            <span>View Map</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}