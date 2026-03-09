import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PartsInventory from "./pages/PartsInventory";
import PartsMap from "./pages/PartsMap";
import InnerDialogue from "./pages/InnerDialogue";
import DataLinks from "./pages/DataLinks";
import Update from "./pages/Update";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<PartsInventory />} />
            <Route path="map" element={<PartsMap />} />
            <Route path="dialogue" element={<InnerDialogue />} />
            <Route path="datalinks" element={<DataLinks />} />
            <Route path="update" element={<Update />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
