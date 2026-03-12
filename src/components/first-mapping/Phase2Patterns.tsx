import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirstMapStore } from '@/lib/firstMapStore';
import { clusters } from '@/lib/firstMapData';
import QuestionScreen from './QuestionScreen';
import NamingMoment from './NamingMoment';
import MiniMapPreview from './MiniMapPreview';

export default function Phase2Patterns() {
  const {
    clusterAnswers, setClusterAnswer, namedParts,
    namePart, addMicroCapture, setPhase,
  } = useFirstMapStore();

  const [clusterIdx, setClusterIdx] = useState(0);
  const [stepInCluster, setStepInCluster] = useState(0);
  // For cluster D, track if we show inner-voice naming, exile naming
  const [showSecondNaming, setShowSecondNaming] = useState(false);

  const cluster = clusters[clusterIdx];
  if (!cluster) return null;

  const totalQuestions = cluster.questions.length;

  // Steps: 0..N-1 = questions, N = naming, N+1 = second naming (D only)
  const isOnQuestion = stepInCluster < totalQuestions;
  const isOnNaming = stepInCluster === totalQuestions;
  const isOnSecondNaming = stepInCluster === totalQuestions + 1;

  const shouldShowSecondNaming = useMemo(() => {
    if (!cluster.secondNamingMoment) return false;
    const answers = clusterAnswers[cluster.id]?.[cluster.secondNamingMoment.conditionKey];
    if (Array.isArray(answers)) {
      // Don't count "I feel settled when things are quiet" as indicating exile
      const meaningful = answers.filter(a => a !== 'I feel settled when things are quiet');
      return meaningful.length >= cluster.secondNamingMoment.conditionMinSelections;
    }
    return false;
  }, [cluster, clusterAnswers]);

  // Check if inner voice is prominent for D-critic naming
  const shouldShowCriticNaming = useMemo(() => {
    if (cluster.id !== 'D') return true;
    const voiceAnswer = clusterAnswers['D']?.['D-q1'];
    if (typeof voiceAnswer === 'string') {
      return ['Constantly', 'Frequently', 'Occasionally'].includes(voiceAnswer);
    }
    return true;
  }, [cluster.id, clusterAnswers]);

  const advanceCluster = () => {
    if (clusterIdx < clusters.length - 1) {
      setClusterIdx(clusterIdx + 1);
      setStepInCluster(0);
    } else {
      setPhase('phase3-intro');
    }
  };

  // Total steps for progress
  const totalClusters = clusters.length;
  const overallProgress = ((clusterIdx + stepInCluster / (totalQuestions + 1)) / totalClusters) * 100;

  // Render question
  if (isOnQuestion) {
    const q = cluster.questions[stepInCluster];
    const answers = clusterAnswers[cluster.id] || {};
    const value = answers[q.id] || (q.type === 'multi-select' ? [] : '');
    const followUpKey = `${q.id}-followUp`;
    const followUpValue = answers[followUpKey] as string | undefined;

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
        <div className="fixed top-20 right-6 z-10 w-40 opacity-70">
          <MiniMapPreview parts={namedParts} />
        </div>

        {/* Cluster label + progress */}
        <div className="mb-2 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[hsl(40,15%,40%)] mb-1">
            Pattern {clusterIdx + 1} of {totalClusters}
          </p>
          <p className="text-xs text-[hsl(40,20%,55%)] font-serif italic">{cluster.title}</p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-[hsl(40,10%,15%)] rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-[hsl(45,90%,50%)] rounded-full"
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <QuestionScreen
            key={q.id}
            question={q}
            value={value}
            followUpValue={followUpValue}
            onAnswer={(v) => setClusterAnswer(cluster.id, q.id, v)}
            onFollowUp={(t) => setClusterAnswer(cluster.id, followUpKey, t)}
            onContinue={() => setStepInCluster(stepInCluster + 1)}
          />
        </AnimatePresence>

        {stepInCluster > 0 && (
          <button
            onClick={() => setStepInCluster(stepInCluster - 1)}
            className="mt-4 text-xs text-[hsl(40,15%,40%)] hover:text-[hsl(40,20%,60%)] transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    );
  }

  // Render naming moment
  if (isOnNaming) {
    // For cluster D, check if we should show critic naming
    if (cluster.id === 'D' && !shouldShowCriticNaming) {
      // Skip to second naming or advance
      if (shouldShowSecondNaming && cluster.secondNamingMoment) {
        return (
          <div className="min-h-[80vh] flex items-center justify-center px-6">
            <NamingMoment
              moment={cluster.secondNamingMoment}
              isShadowed
              onName={(name) => {
                namePart({
                  partId: `fm-${cluster.secondNamingMoment!.cluster}`,
                  userChosenName: name,
                  backendClassification: cluster.secondNamingMoment!.backendClassification,
                  type: cluster.secondNamingMoment!.partType,
                  cluster: cluster.secondNamingMoment!.cluster,
                  selfEnergyReadings: [],
                  status: 'shadowed',
                });
                advanceCluster();
              }}
              onMicroCapture={() => {}}
            />
          </div>
        );
      }
      advanceCluster();
      return null;
    }

    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <NamingMoment
          moment={cluster.namingMoment}
          onName={(name) => {
            namePart({
              partId: `fm-${cluster.namingMoment.cluster}`,
              userChosenName: name,
              backendClassification: cluster.namingMoment.backendClassification,
              type: cluster.namingMoment.partType,
              cluster: cluster.namingMoment.cluster,
              selfEnergyReadings: [],
              status: 'named',
            });

            // Check if second naming needed (Cluster D)
            if (shouldShowSecondNaming && cluster.secondNamingMoment) {
              setStepInCluster(totalQuestions + 1);
            } else {
              advanceCluster();
            }
          }}
          onMicroCapture={(feelings) => {
            addMicroCapture(`fm-${cluster.namingMoment.cluster}`, feelings);
          }}
        />
      </div>
    );
  }

  // Second naming (Cluster D exile gesture)
  if (isOnSecondNaming && cluster.secondNamingMoment) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <NamingMoment
          moment={cluster.secondNamingMoment}
          isShadowed
          onName={(name) => {
            namePart({
              partId: `fm-${cluster.secondNamingMoment!.cluster}`,
              userChosenName: name,
              backendClassification: cluster.secondNamingMoment!.backendClassification,
              type: cluster.secondNamingMoment!.partType,
              cluster: cluster.secondNamingMoment!.cluster,
              selfEnergyReadings: [],
              status: 'shadowed',
            });
            advanceCluster();
          }}
          onMicroCapture={() => {}}
        />
      </div>
    );
  }

  return null;
}
