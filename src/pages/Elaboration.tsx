import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore, PartType } from '@/lib/store';
import {
  useElaborationStore,
  elaborationTabs,
} from '@/lib/elaborationStore';
import {
  ChevronLeft, ChevronRight, Save, Wind, CheckCircle2,
  Sparkles, ArrowLeft, Clock,
} from 'lucide-react';

const typeColors: Record<PartType, string> = {
  Manager: 'bg-ifs-manager/15 text-ifs-manager border-ifs-manager/30',
  Firefighter: 'bg-ifs-firefighter/15 text-ifs-firefighter border-ifs-firefighter/30',
  Exile: 'bg-ifs-exile/15 text-ifs-exile border-ifs-exile/30',
  Self: 'bg-ifs-self/15 text-ifs-self border-ifs-self/30',
};

type Phase = 'intro' | 'breath' | 'session' | 'complete';

export default function Elaboration() {
  const { partId } = useParams<{ partId: string }>();
  const navigate = useNavigate();
  const parts = useStore((s) => s.parts);
  const part = parts.find((p) => p.id === partId);

  const {
    startSession, activeSessionId, activeTabIndex, activeQuestionIndex,
    setActiveTab, setActiveQuestion, saveResponse, completeSession,
    sessions, setActiveSession, isPartElaborated,
  } = useElaborationStore();

  const [phase, setPhase] = useState<Phase>('intro');
  const [localAnswer, setLocalAnswer] = useState('');

  const currentSession = sessions.find((s) => s.id === activeSessionId);
  const currentTab = elaborationTabs[activeTabIndex];
  const currentQuestion = currentTab?.questions[activeQuestionIndex] || '';

  // Load existing answer when navigating
  useEffect(() => {
    if (!currentSession || !currentTab) return;
    const existing = currentSession.responses.find(
      (r) => r.tabId === currentTab.id && r.questionIndex === activeQuestionIndex
    );
    setLocalAnswer(existing?.answer || '');
  }, [activeSessionId, activeTabIndex, activeQuestionIndex, currentSession, currentTab]);

  if (!part) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-muted-foreground">Part not found.</p>
        <Button variant="link" onClick={() => navigate('/inventory')}>
          Back to Inventory
        </Button>
      </div>
    );
  }

  // Past sessions for this part
  const partSessions = sessions.filter((s) => s.partId === partId);

  // Tab completion for current session
  const getTabCompletion = (tabId: string) => {
    if (!currentSession) return 0;
    const tab = elaborationTabs.find((t) => t.id === tabId);
    if (!tab) return 0;
    const answered = currentSession.responses.filter(
      (r) => r.tabId === tabId && r.answer.trim()
    ).length;
    return Math.round((answered / tab.questions.length) * 100);
  };

  const handleSaveAnswer = () => {
    if (!activeSessionId || !currentTab) return;
    saveResponse(activeSessionId, currentTab.id, activeQuestionIndex, localAnswer);
  };

  const handleNext = () => {
    handleSaveAnswer();
    if (activeQuestionIndex < currentTab.questions.length - 1) {
      setActiveQuestion(activeQuestionIndex + 1);
    } else if (activeTabIndex < elaborationTabs.length - 1) {
      setActiveTab(activeTabIndex + 1);
    } else {
      // All done
      setPhase('complete');
    }
  };

  const handlePrev = () => {
    handleSaveAnswer();
    if (activeQuestionIndex > 0) {
      setActiveQuestion(activeQuestionIndex - 1);
    } else if (activeTabIndex > 0) {
      const prevTab = elaborationTabs[activeTabIndex - 1];
      setActiveTab(activeTabIndex - 1);
      // We need to set question after tab change, but setActiveTab resets to 0
      // So set to last question of prev tab after a tick
      setTimeout(() => setActiveQuestion(prevTab.questions.length - 1), 0);
    }
  };

  const handleSaveExit = () => {
    handleSaveAnswer();
    navigate('/inventory');
  };

  const handleComplete = () => {
    if (activeSessionId) completeSession(activeSessionId);
    navigate('/inventory');
  };

  // ─── INTRO ───
  if (phase === 'intro') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center px-6"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: part.accentColor + '20', color: part.accentColor }}
          >
            <span className="text-2xl font-bold">{part.name.charAt(0)}</span>
          </div>

          <h1 className="text-2xl font-bold mb-3">Elaborate on {part.name}</h1>
          <p className="text-muted-foreground mb-2">
            We're going to spend some time getting to know <strong>{part.name}</strong> more deeply.
            There are no right answers — just your honest inner experience.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            You can save your progress and return anytime.
          </p>

          {partSessions.length > 0 && (
            <div className="mb-6 border rounded-lg p-3 text-left">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Previous Sessions
              </h3>
              <div className="space-y-1">
                {partSessions.map((s) => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span>{new Date(s.date).toLocaleDateString()}</span>
                    <span className="text-muted-foreground">
                      {s.responses.filter((r) => r.answer.trim()).length} responses
                      {s.completed && <CheckCircle2 className="inline h-3 w-3 ml-1 text-primary" />}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={() => setPhase('breath')} size="lg" className="px-8">
            Begin Elaboration
          </Button>
        </motion.div>
      </div>
    );
  }

  // ─── BREATH PROMPT ───
  if (phase === 'breath') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8"
          >
            <Wind className="w-10 h-10 text-primary" />
          </motion.div>
          <h2 className="text-xl font-semibold mb-2">Take a moment to settle</h2>
          <p className="text-muted-foreground mb-8 text-sm">
            Notice {part.name} in your system. Approach with curiosity and openness.
          </p>
          <Button
            onClick={() => {
              const sid = startSession(part.id);
              setPhase('session');
            }}
            size="lg"
          >
            I'm ready
          </Button>
        </motion.div>
      </div>
    );
  }

  // ─── COMPLETE ───
  if (phase === 'complete') {
    const answeredCount = currentSession?.responses.filter((r) => r.answer.trim()).length || 0;
    const tabsAnswered = new Set(currentSession?.responses.filter((r) => r.answer.trim()).map((r) => r.tabId) || []);

    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>

          <h1 className="text-2xl font-bold mb-2">Elaboration Complete</h1>
          <p className="text-muted-foreground mb-6">
            You provided <strong>{answeredCount}</strong> responses across{' '}
            <strong>{tabsAnswered.size}</strong> categories for {part.name}.
          </p>

          <div className="space-y-3">
            <Button onClick={handleComplete} size="lg" className="w-full">
              Save & Return to Inventory
            </Button>
            <Button variant="outline" onClick={() => navigate(`/map`)} className="w-full">
              View Parts Map
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── SESSION ───
  const totalQuestions = elaborationTabs.reduce((s, t) => s + t.questions.length, 0);
  const globalIndex = elaborationTabs.slice(0, activeTabIndex).reduce((s, t) => s + t.questions.length, 0) + activeQuestionIndex;
  const globalProgress = ((globalIndex + 1) / totalQuestions) * 100;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleSaveExit}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{part.name}</h2>
            <Badge variant="outline" className={typeColors[part.type]}>{part.type}</Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleSaveExit} className="gap-1.5">
          <Save className="h-3.5 w-3.5" /> Save & Exit
        </Button>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{currentTab.label}</span>
          <span>Question {globalIndex + 1} of {totalQuestions}</span>
        </div>
        <Progress value={globalProgress} className="h-1.5" />
      </div>

      {/* Tab pills */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {elaborationTabs.map((tab, i) => {
          const completion = getTabCompletion(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => {
                handleSaveAnswer();
                setActiveTab(i);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all
                ${i === activeTabIndex
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-accent text-muted-foreground'
                }`}
            >
              {tab.label}
              {completion > 0 && (
                <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center
                  ${completion === 100
                    ? 'bg-primary-foreground text-primary'
                    : i === activeTabIndex
                      ? 'bg-primary-foreground/30 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                  {completion === 100 ? '✓' : Math.round(completion / (100 / currentTab.questions.length))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTabIndex}-${activeQuestionIndex}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 md:p-8">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                {currentTab.label} · Question {activeQuestionIndex + 1} of {currentTab.questions.length}
              </p>
              <h3 className="text-lg font-medium mb-4 leading-relaxed">{currentQuestion}</h3>

              {/* Emotion word options for relationship tab first question */}
              {currentTab.id === 'relationship' && activeQuestionIndex === 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Gratitude', 'Frustration', 'Fear', 'Compassion', 'Confusion', 'Protectiveness', 'Curiosity', 'Resentment'].map((emotion) => {
                    const isSelected = localAnswer.toLowerCase().includes(emotion.toLowerCase());
                    return (
                      <button
                        key={emotion}
                        onClick={() => {
                          if (isSelected) {
                            setLocalAnswer(localAnswer.replace(new RegExp(emotion + ',?\\s*', 'i'), '').trim());
                          } else {
                            setLocalAnswer((localAnswer ? localAnswer + ', ' : '') + emotion);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                          ${isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:bg-accent text-muted-foreground'
                          }`}
                      >
                        {emotion}
                      </button>
                    );
                  })}
                </div>
              )}

              <Textarea
                value={localAnswer}
                onChange={(e) => setLocalAnswer(e.target.value)}
                placeholder="Take your time... write whatever comes to mind"
                rows={5}
                className="text-base"
              />

              <p className="text-xs text-muted-foreground mt-2">You can skip any question and come back later.</p>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={activeTabIndex === 0 && activeQuestionIndex === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <Button onClick={handleNext}>
          {activeTabIndex === elaborationTabs.length - 1 &&
          activeQuestionIndex === currentTab.questions.length - 1
            ? 'Finish'
            : 'Next'}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
