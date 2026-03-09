import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useStore } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Update() {
  const parts = useStore((state) => state.parts);

  const contextTags = ["Work", "Family", "Relationship", "Health", "Alone", "Social", "Other"];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Quick Update</h1>
        <p className="text-muted-foreground">Log part activations, insights, and system changes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What's happening in your system?</CardTitle>
          <CardDescription>Keep your parts data current without a full re-assessment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-3">
            <Label>Update Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Button variant="default" className="bg-primary hover:bg-primary/90">Part Activation</Button>
              <Button variant="outline">New Insight</Button>
              <Button variant="outline">Relationship Change</Button>
              <Button variant="outline">System Observation</Button>
              <Button variant="outline" className="border-ifs-self text-ifs-self hover:bg-ifs-self/10 hover:text-ifs-self">Progress Moment</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="part">Which Part(s)?</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a part" />
              </SelectTrigger>
              <SelectContent>
                {parts.map(part => (
                  <SelectItem key={part.id} value={part.id}>{part.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">What happened?</Label>
            <Textarea 
              id="description" 
              placeholder="Briefly describe the activation or insight (3-5 sentences max)..." 
              className="resize-none h-24"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Intensity at time of activation</Label>
              <span className="text-sm text-muted-foreground">5 / 10</span>
            </div>
            <Slider defaultValue={[5]} max={10} step={1} />
          </div>

          <div className="space-y-2">
            <Label>Context Context</Label>
            <div className="flex flex-wrap gap-2">
              {contextTags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary/20">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4">
            Log Update
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}