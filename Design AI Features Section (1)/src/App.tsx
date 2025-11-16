import { useState } from 'react';
import { SmartCityFeatures } from './components/SmartCityFeatures';
import { CityInfrastructureAnalyzer } from './components/CityInfrastructureAnalyzer';
import { SmartRoadHousingPlanning } from './components/SmartRoadHousingPlanning';
import { AdvancedDataVisualization } from './components/AdvancedDataVisualization';
import { UrbanGrowthPatterns } from './components/UrbanGrowthPatterns';
import { UrbanGrowthDashboard } from './components/UrbanGrowthDashboard';
import { UrbanGrowthExplorer } from './components/UrbanGrowthExplorer';
import { SustainabilityGreenPlanning } from './components/SustainabilityGreenPlanning';

export default function App() {
  const [currentView, setCurrentView] = useState<'features' | 'infrastructure' | 'roadhousing' | 'datavisualization' | 'urbangrowth' | 'urbangrowth-dashboard' | 'urbangrowth-explorer' | 'sustainability'>('features');

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

  const handleUrbanGrowthDashboard = () => {
    setCurrentView('urbangrowth-dashboard');
  };

  const handleSustainabilityGreenPlanning = () => {
    setCurrentView('sustainability');
  };

  const handleBack = () => {
    setCurrentView('features');
  };

  return (
    <div className="min-h-screen">
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
        <CityInfrastructureAnalyzer onBack={handleBack} />
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
  );
}