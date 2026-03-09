import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function InnerDialogue() {
  const parts = useStore((state) => state.parts);
  const dialogues = useStore((state) => state.dialogues);
  const addDialogue = useStore((state) => state.addDialogue);

  // Simplified for prototype: always viewing the first dialogue
  const currentDialogue = dialogues[0];
  const [newMessage, setNewMessage] = useState("");
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>("self");

  const availableSpeakers = [
    { id: "self", name: "Self", color: "hsl(45, 90%, 50%)" },
    ...parts.filter(p => currentDialogue?.participantIds.includes(p.id)).map(p => ({
      id: p.id,
      name: p.name,
      color: p.accentColor
    }))
  ];

  const handleSend = () => {
    if (!newMessage.trim()) return;
    // In a full app, we would dispatch this to the store.
    // For prototype, we just clear the input to simulate sending.
    console.log(`Sending as ${activeSpeakerId}: ${newMessage}`);
    setNewMessage("");
  };

  if (!currentDialogue) {
    return <div>No dialogues found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Inner Dialogue</h1>
          <p className="text-muted-foreground">{currentDialogue.title}</p>
        </div>
        <Button variant="outline">New Dialogue</Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {currentDialogue.messages.map((msg, idx) => {
              const speaker = msg.partId === 'self' 
                ? { name: 'Self', color: 'hsl(45, 90%, 50%)' }
                : parts.find(p => p.id === msg.partId) || { name: 'Unknown', color: '#ccc' };

              const isSelf = msg.partId === 'self';

              return (
                <div key={idx} className={`flex gap-3 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className={`w-10 h-10 border-2`} style={{ borderColor: speaker.color }}>
                    <AvatarFallback style={{ backgroundColor: `${speaker.color}20`, color: speaker.color }}>
                      {speaker.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div 
                    className={`max-w-[70%] rounded-2xl p-3 ${isSelf ? 'rounded-tr-none' : 'rounded-tl-none'}`}
                    style={{ 
                      backgroundColor: `${speaker.color}15`,
                      borderLeft: !isSelf ? `4px solid ${speaker.color}` : 'none',
                      borderRight: isSelf ? `4px solid ${speaker.color}` : 'none',
                    }}
                  >
                    <p className="text-xs font-semibold mb-1" style={{ color: speaker.color }}>
                      {speaker.name}
                    </p>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <CardFooter className="flex-col gap-3 border-t bg-muted/20 p-4">
          <div className="flex gap-2 w-full justify-center">
            {availableSpeakers.map(speaker => (
              <Button
                key={speaker.id}
                variant={activeSpeakerId === speaker.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSpeakerId(speaker.id)}
                style={activeSpeakerId === speaker.id ? { backgroundColor: speaker.color, color: 'white' } : {}}
              >
                {speaker.name}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 w-full">
            <Input 
              placeholder={`Speak as ${availableSpeakers.find(s => s.id === activeSpeakerId)?.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} className="bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}