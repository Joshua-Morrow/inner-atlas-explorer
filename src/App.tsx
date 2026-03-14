import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PartsInventory from "./pages/PartsInventory";
import PartsMap from "./pages/PartsMap";
import Dynamics from "./pages/Dynamics";
import InnerDialogue from "./pages/InnerDialogue";
import DataLinks from "./pages/DataLinks";
import Update from "./pages/Update";
import Assessment from "./pages/Assessment";
import FirstMapping from "./pages/FirstMapping";
import Elaboration from "./pages/Elaboration";
import Trailhead from "./pages/Trailhead";
import SelfEnergy from "./pages/SelfEnergy";
import Refine from "./pages/Refine";
import CouplesConnection from "./pages/CouplesConnection";
import Clarity from "./pages/Clarity";
import BodyMap from "./pages/BodyMap";
import Practices from "./pages/Practices";
import Journey from "./pages/Journey";
import Snapshot from "./pages/Snapshot";
import SnapshotHistory from "./pages/SnapshotHistory";
import PartProfile from "./pages/PartProfile";
import NotFound from "./pages/NotFound";
import { useAssessmentStore } from "./lib/assessmentStore";
import { seedDemoData } from "./lib/seedData";

const queryClient = new QueryClient();

function AssessmentGuard({ children }: { children: React.ReactNode }) {
  const { hasCompletedAssessment, currentStage } = useAssessmentStore();
  if (!hasCompletedAssessment && currentStage === 'not-started') {
    return <Navigate to="/assessment" replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  useEffect(() => { seedDemoData(); }, []);
  return (
    <Routes>
      <Route path="/assessment" element={<Layout />}>
        <Route index element={<Assessment />} />
      </Route>
      <Route path="/first-mapping" element={<FirstMapping />} />
      <Route path="/" element={<AssessmentGuard><Layout /></AssessmentGuard>}>
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<PartsInventory />} />
        <Route path="part/:partId" element={<PartProfile />} />
        <Route path="map" element={<PartsMap />} />
        <Route path="dynamics" element={<Dynamics />} />
        <Route path="dialogue" element={<InnerDialogue />} />
        <Route path="datalinks" element={<DataLinks />} />
        <Route path="update" element={<Update />} />
        <Route path="elaborate/:partId" element={<Elaboration />} />
        <Route path="refine/:partId" element={<Refine />} />
        <Route path="trailhead" element={<Trailhead />} />
        <Route path="self-energy" element={<SelfEnergy />} />
        <Route path="couples" element={<CouplesConnection />} />
        <Route path="clarity" element={<Clarity />} />
        <Route path="body-map" element={<BodyMap />} />
        <Route path="practices" element={<Practices />} />
        <Route path="journey" element={<Journey />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
