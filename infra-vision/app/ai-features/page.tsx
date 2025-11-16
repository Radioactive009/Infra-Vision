'use client';

import { useState } from 'react';
import { SmartCityFeatures } from '@/components/ai-features/components/SmartCityFeatures';
import { CityInfrastructureAnalyzer } from '@/components/ai-features/components/CityInfrastructureAnalyzer';
import { SmartRoadHousingPlanning } from '@/components/ai-features/components/SmartRoadHousingPlanning';
import { AdvancedDataVisualization } from '@/components/ai-features/components/AdvancedDataVisualization';
import { UrbanGrowthPatterns } from '@/components/ai-features/components/UrbanGrowthPatterns';
import { UrbanGrowthDashboard } from '@/components/ai-features/components/UrbanGrowthDashboard';
import { UrbanGrowthExplorer } from '@/components/ai-features/components/UrbanGrowthExplorer';
import { SustainabilityGreenPlanning } from '@/components/ai-features/components/SustainabilityGreenPlanning';
import { SchoolCoverageDetails } from '@/components/ai-features/SchoolCoverageDetails';
import { HospitalCoverageDetails } from '@/components/ai-features/HospitalCoverageDetails';
import { ParkCoverageDetails } from '@/components/ai-features/ParkCoverageDetails';
import AiPlanningImpact from '@/components/ai-features/AiPlanningImpact';

export default function AIFeaturesPage() {
  const [currentView, setCurrentView] = useState<'features' | 'infrastructure' | 'roadhousing' | 'datavisualization' | 'urbangrowth' | 'urbangrowth-dashboard' | 'urbangrowth-explorer' | 'sustainability' | 'school-coverage' | 'hospital-coverage' | 'park-coverage'>('features');

  const handleInfrastructureAnalyze = () => {
    setCurrentView('infrastructure');
  };

  const handleRoadHousingPlanning = () => {
    setCurrentView('roadhousing');
  };

  const handleDataVisualization = () => {
    setCurrentView('datavisualization');
  };

  const handleUrbanGrowthPatterns = () => {
    setCurrentView('urbangrowth-explorer');
  };

  const handleSustainabilityGreenPlanning = () => {
    setCurrentView('sustainability');
  };

  const handleBack = () => {
    setCurrentView('features');
  };

  const handleSchoolCoverageDetails = () => {
    setCurrentView('school-coverage');
  };

  const handleHospitalCoverageDetails = () => {
    setCurrentView('hospital-coverage');
  };

  const handleParkCoverageDetails = () => {
    setCurrentView('park-coverage');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main Content */}
      <div>
        {currentView === 'features' && (
          <SmartCityFeatures 
            onInfrastructureAnalyze={handleInfrastructureAnalyze}
            onRoadHousingPlanning={handleRoadHousingPlanning}
            onDataVisualization={handleDataVisualization}
            onUrbanGrowthPatterns={handleUrbanGrowthPatterns}
            onSustainabilityGreenPlanning={handleSustainabilityGreenPlanning}
          />
        )}
        {currentView === 'infrastructure' && (
          <>
            <CityInfrastructureAnalyzer 
              onBack={handleBack} 
              onSchoolCoverageDetails={handleSchoolCoverageDetails}
              onHospitalCoverageDetails={handleHospitalCoverageDetails}
              onParkCoverageDetails={handleParkCoverageDetails}
            />
            <section className="mt-20">
              <AiPlanningImpact />
            </section>
          </>
        )}
        {currentView === 'school-coverage' && (
          <SchoolCoverageDetails onBack={() => setCurrentView('infrastructure')} />
        )}
        {currentView === 'hospital-coverage' && (
          <HospitalCoverageDetails onBack={() => setCurrentView('infrastructure')} />
        )}
        {currentView === 'park-coverage' && (
          <ParkCoverageDetails onBack={() => setCurrentView('infrastructure')} />
        )}
        {currentView === 'roadhousing' && (
          <SmartRoadHousingPlanning onBack={handleBack} />
        )}
        {currentView === 'datavisualization' && (
          <AdvancedDataVisualization onBack={handleBack} />
        )}
        {currentView === 'urbangrowth' && (
          <UrbanGrowthPatterns onBack={handleBack} />
        )}
        {currentView === 'urbangrowth-dashboard' && (
          <UrbanGrowthDashboard onBack={handleBack} />
        )}
        {currentView === 'urbangrowth-explorer' && (
          <UrbanGrowthExplorer onBack={handleBack} />
        )}
        {currentView === 'sustainability' && (
          <SustainabilityGreenPlanning onBack={handleBack} />
        )}
      </div>
    </div>
  );
}

