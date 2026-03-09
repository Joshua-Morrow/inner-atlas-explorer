import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import QuickCheckIn from '@/components/self-energy/QuickCheckIn';
import FullSelfAssessment from '@/components/self-energy/FullAssessment';
import TrackingDashboard from '@/components/self-energy/TrackingDashboard';
import PracticesLibrary from '@/components/self-energy/PracticesLibrary';

export default function SelfEnergy() {
  return (
    <div className="max-w-5xl mx-auto py-2 px-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Self Energy</h1>
        <p className="text-muted-foreground">Measure, track, and develop your access to Self-energy.</p>
      </div>

      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="quick">Quick Check-In</TabsTrigger>
          <TabsTrigger value="full">Full Assessment</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="practices">Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="quick">
          <QuickCheckIn />
        </TabsContent>
        <TabsContent value="full">
          <FullSelfAssessment />
        </TabsContent>
        <TabsContent value="dashboard">
          <TrackingDashboard />
        </TabsContent>
        <TabsContent value="practices">
          <PracticesLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
