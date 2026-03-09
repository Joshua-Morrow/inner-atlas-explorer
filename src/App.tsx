import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PartsInventory from "./pages/PartsInventory";
import PartsMap from "./pages/PartsMap";
import InnerDialogue from "./pages/InnerDialogue";
import DataLinks from "./pages/DataLinks";
import Update from "./pages/Update";
import Assessment from "./pages/Assessment";
import Elaboration from "./pages/Elaboration";
import Trailhead from "./pages/Trailhead";
import SelfEnergy from "./pages/SelfEnergy";
import Refine from "./pages/Refine";
import NotFound from "./pages/NotFound";
import { useAssessmentStore } from "./lib/assessmentStore";

const queryClient = new QueryClient();

function AssessmentGuard({ children }: { children: React.ReactNode }) {
  const { hasCompletedAssessment, currentStage } = useAssessmentStore();
  if (!hasCompletedAssessment && currentStage === 'not-started') {
    return <Navigate to="/assessment" replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/assessment" element={<Layout />}>
            <Route index element={<Assessment />} />
          </Route>
          <Route path="/" element={<AssessmentGuard><Layout /></AssessmentGuard>}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<PartsInventory />} />
            <Route path="map" element={<PartsMap />} />
            <Route path="dialogue" element={<InnerDialogue />} />
            <Route path="datalinks" element={<DataLinks />} />
            <Route path="update" element={<Update />} />
            <Route path="elaborate/:partId" element={<Elaboration />} />
            <Route path="trailhead" element={<Trailhead />} />
            <Route path="self-energy" element={<SelfEnergy />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
