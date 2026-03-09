import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Shield, Heart, Lightbulb, ChevronLeft } from "lucide-react";

interface Article {
  title: string;
  desc: string;
  content: string;
}

const topics: { category: string; icon: React.ReactNode; articles: Article[] }[] = [
  {
    category: "Foundations",
    icon: <BookOpen className="h-5 w-5 text-primary" />,
    articles: [
      {
        title: "What is IFS?",
        desc: "An overview of Internal Family Systems therapy.",
        content:
          "Internal Family Systems (IFS) is a transformative, evidence-based model of psychotherapy developed by Dr. Richard Schwartz in the 1980s. IFS views the mind as naturally multiple — composed of distinct sub-personalities or 'parts,' each with its own feelings, beliefs, and motivations.\n\nRather than pathologizing these parts, IFS honors them as members of an internal family, each trying to help in its own way. At the center of this system is the Self — an undamaged core of calm, curiosity, compassion, and clarity that can lead and heal the system.\n\nIFS has been applied successfully to anxiety, depression, PTSD, eating disorders, and relationship issues. It is recognized by SAMHSA as an evidence-based practice.",
      },
      {
        title: "The Self",
        desc: "Understanding the core, undamaged essence of who you are.",
        content:
          "In IFS, the Self is not a part — it is the essence of who you are underneath all the protective layers. The Self is characterized by the 8 C's: Calm, Curiosity, Compassion, Clarity, Confidence, Creativity, Courage, and Connectedness.\n\nSelf-energy is always present, though it can be obscured when parts 'blend' with it — meaning they take over our awareness. The goal of IFS is not to eliminate parts but to help them trust Self enough to 'unblend,' allowing Self to lead.\n\nWhen Self is leading, you feel centered and responsive rather than reactive. You can hold space for difficult emotions without being overwhelmed by them.",
      },
      {
        title: "The 8 C's of Self",
        desc: "Calm, Curious, Compassionate, Confident, etc.",
        content:
          "The 8 C's are the qualities that naturally emerge when Self is present and parts have stepped back:\n\n• Calm — A settled, peaceful presence even amid chaos.\n• Curiosity — Genuine interest in understanding parts without judgment.\n• Compassion — Warm, caring regard for all parts and their pain.\n• Clarity — The ability to see the bigger picture without distortion.\n• Confidence — Trust in your own capacity to handle what arises.\n• Creativity — Resourceful, flexible responses to challenges.\n• Courage — Willingness to face difficult parts and feelings.\n• Connectedness — Feeling in touch with yourself, others, and something larger.\n\nThese qualities are not skills to develop but natural states that emerge when parts allow Self to lead.",
      },
    ],
  },
  {
    category: "Part Types",
    icon: <Shield className="h-5 w-5 text-ifs-manager" />,
    articles: [
      {
        title: "Managers",
        desc: "Proactive protectors trying to keep you safe and in control.",
        content:
          "Managers are proactive protector parts whose job is to keep the system functioning and prevent painful feelings from surfacing. They work preemptively — planning, organizing, controlling, criticizing, and people-pleasing before anything bad can happen.\n\nCommon Manager parts include: The Planner, The Perfectionist, The Inner Critic, The People Pleaser, The Controller, and The Rationalizer.\n\nManagers are often socially rewarded — they make us productive, reliable, and 'together.' But they can also be exhausting and controlling. In IFS, we approach Managers with appreciation for their hard work while helping them find less burdensome ways to protect.",
      },
      {
        title: "Firefighters",
        desc: "Reactive protectors that jump in when pain is triggered.",
        content:
          "Firefighters are reactive protector parts that activate when the system is overwhelmed or when an exile's pain breaks through the Manager's defenses. They aim to extinguish emotional pain quickly, often through impulsive or numbing behaviors.\n\nCommon Firefighter strategies include: distraction (phone scrolling, binge-watching), substance use, emotional eating, dissociation, rage outbursts, risk-taking, and excessive sleeping.\n\nFirefighters are often the parts we judge most harshly, but in IFS they are understood as desperate protectors doing whatever it takes to prevent the system from being flooded by unbearable pain.",
      },
      {
        title: "Exiles",
        desc: "Vulnerable parts carrying pain, trauma, or burdens.",
        content:
          "Exiles are the vulnerable, often younger parts that carry the raw emotions and memories that the system has deemed too painful or dangerous to feel. They hold burdens — beliefs like 'I'm not enough,' 'I'm unlovable,' or 'The world isn't safe.'\n\nExiles are typically 'exiled' by the protector parts (Managers and Firefighters) to prevent their pain from overwhelming the system. But exiles don't go away — they continue to carry their burdens in isolation, sometimes for decades.\n\nThe ultimate goal of IFS therapy is to help exiles unburden — to release the painful beliefs and emotions they carry — through a guided process of witnessing, compassion, and reparative experience from Self.",
      },
    ],
  },
  {
    category: "Core Concepts",
    icon: <Lightbulb className="h-5 w-5 text-ifs-firefighter" />,
    articles: [
      {
        title: "Blending & Unblending",
        desc: "Creating space between Self and your parts.",
        content:
          "Blending occurs when a part's feelings, beliefs, or impulses merge with your awareness so completely that you lose the separation between 'you' (Self) and the part. When blended, you don't just notice anxiety — you ARE anxious. You don't observe the critic — you ARE the critic.\n\nUnblending is the process of creating internal space so that Self can observe the part without being it. Techniques include:\n• Asking the part to 'step back' slightly\n• Noticing the part in your body and creating space around it\n• Using the phrase 'a part of me feels...' instead of 'I feel...'\n• Breathing and grounding to access Self-energy\n\nUnblending is not suppressing — it's creating enough space to relate TO the part rather than FROM it.",
      },
      {
        title: "Polarizations",
        desc: "When two parts are fighting for control.",
        content:
          "A polarization occurs when two parts hold opposing positions and escalate against each other. Classic examples:\n\n• The Perfectionist vs. The Procrastinator\n• The People Pleaser vs. The Rebel\n• The Controller vs. The Firefighter\n\nEach part believes the other is dangerous. The more one pushes, the harder the other pushes back. This creates an exhausting internal tug-of-war.\n\nIn IFS, the resolution isn't picking a side but helping both parts feel heard and understood. When each part knows Self sees it and appreciates its concern, the polarization often relaxes naturally.",
      },
      {
        title: "Trailheads",
        desc: "Using everyday reactions as entry points for exploration.",
        content:
          "A trailhead is any everyday experience — a strong reaction, a recurring thought, a physical sensation, an impulse — that can be used as an entry point for exploring the internal system.\n\nTrailheads are everywhere: the anxiety before a meeting, the urge to check your phone when sad, the sharp judgment when someone makes a mistake, the tightness in your chest during a difficult conversation.\n\nBy following a trailhead inward — asking 'what part is activated?' and 'what is it protecting?' — you can trace the activation chain from surface behavior through protector parts to the underlying exile and its burden. This is the core exploration process in IFS.",
      },
    ],
  },
  {
    category: "Practice",
    icon: <Heart className="h-5 w-5 text-ifs-self" />,
    articles: [
      {
        title: "Working with Protectors",
        desc: "How to safely approach and befriend protective parts.",
        content:
          "Working with protectors is a delicate process. These parts have been working hard — often for years or decades — to keep you safe. Approaching them with judgment or a desire to eliminate them will only increase their resistance.\n\nKey principles:\n1. Appreciate the protector's intention, even if you don't like its methods.\n2. Ask about its fears — 'What are you afraid would happen if you stopped?'\n3. Help it differentiate between past danger and present safety.\n4. Don't try to bypass protectors to reach exiles — they will escalate.\n5. Earn their trust gradually through consistent Self-led engagement.\n\nWhen protectors feel genuinely seen and appreciated, they often voluntarily relax and allow access to the parts they've been protecting.",
      },
      {
        title: "Self-Energy Practices",
        desc: "Exercises to cultivate and access more Self-energy.",
        content:
          "While Self-energy is innate and always present, certain practices help create conditions for it to emerge more readily:\n\n• Mindful breathing — Simple breath awareness helps parts settle and Self surface.\n• Body scan grounding — Bringing attention systematically through the body activates embodied Self-awareness.\n• Parts check-in — Asking 'What parts are active right now?' creates differentiation.\n• The Observer practice — Noticing thoughts and feelings without being them strengthens the Self-witness.\n• Nature immersion — Being in natural settings often naturally unblends parts.\n• Journaling from Self — Writing to parts from a place of curiosity and compassion.\n• The 8 C's inventory — Regularly checking which qualities of Self are accessible.\n\nConsistent practice builds 'Self-leadership muscles' over time.",
      },
    ],
  },
];

export default function DataLinks() {
  const [selectedArticle, setSelectedArticle] = useState<{ category: string; article: Article } | null>(null);

  if (selectedArticle) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedArticle(null)}>
          <ChevronLeft className="h-4 w-4" /> Back to DataLinks
        </Button>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{selectedArticle.category}</p>
          <h1 className="text-2xl font-bold text-primary mt-1">{selectedArticle.article.title}</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            {selectedArticle.article.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm leading-relaxed mb-4 last:mb-0 whitespace-pre-line">{para}</p>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <div
                  key={aIdx}
                  className="group cursor-pointer p-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedArticle({ category: topic.category, article })}
                >
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
