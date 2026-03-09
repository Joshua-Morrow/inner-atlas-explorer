import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Shield, Heart, Lightbulb } from "lucide-react";

export default function DataLinks() {
  const topics = [
    {
      category: "Foundations",
      icon: <BookOpen className="h-5 w-5 text-primary" />,
      articles: [
        { title: "What is IFS?", desc: "An overview of Internal Family Systems therapy." },
        { title: "The Self", desc: "Understanding the core, undamaged essence of who you are." },
        { title: "The 8 C's of Self", desc: "Calm, Curious, Compassionate, Confident, etc." },
      ]
    },
    {
      category: "Part Types",
      icon: <Shield className="h-5 w-5 text-ifs-manager" />,
      articles: [
        { title: "Managers", desc: "Proactive protectors trying to keep you safe and in control." },
        { title: "Firefighters", desc: "Reactive protectors that jump in when pain is triggered." },
        { title: "Exiles", desc: "Vulnerable parts carrying pain, trauma, or burdens." },
      ]
    },
    {
      category: "Core Concepts",
      icon: <Lightbulb className="h-5 w-5 text-ifs-firefighter" />,
      articles: [
        { title: "Blending & Unblending", desc: "Creating space between Self and your parts." },
        { title: "Polarizations", desc: "When two parts are fighting for control." },
        { title: "Trailheads", desc: "Using everyday reactions as entry points for exploration." },
      ]
    },
    {
      category: "Practice",
      icon: <Heart className="h-5 w-5 text-ifs-self" />,
      articles: [
        { title: "Working with Protectors", desc: "How to safely approach and befriend protective parts." },
        { title: "Self-Energy Practices", desc: "Exercises to cultivate and access more Self-energy." },
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">DataLinks</h1>
        <p className="text-muted-foreground">Your IFS knowledge base and reference library.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {topics.map((topic, idx) => (
          <Card key={idx} className="border-t-4" style={{ borderTopColor: 'hsl(var(--primary))' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {topic.icon}
                {topic.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topic.articles.map((article, aIdx) => (
                <div key={aIdx} className="group cursor-pointer p-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors">
                  <h4 className="font-semibold text-primary group-hover:underline">{article.title}</h4>
                  <p className="text-sm text-muted-foreground">{article.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}