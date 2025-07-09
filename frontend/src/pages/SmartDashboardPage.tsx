import React, { useState } from 'react';
import { Brain, TrendingUp, Bot, BarChart3 } from 'lucide-react';
import { 
  SmartDashboard, 
  PredictiveAnalytics, 
  AutomationCenter, 
  PerformanceOptimizer 
} from '../components/advanced';
import UniversalCard from '../components/common/UniversalCard';
import UniversalHeader from '../components/common/UniversalHeader';
import { useCrossData } from '../hooks/useCrossData';

const SmartDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'predictions' | 'automation' | 'optimizer'>('insights');
  const { stats } = useCrossData();

  const tabs = [
    { id: 'insights', label: 'Smart Insights', icon: Brain, component: SmartDashboard },
    { id: 'predictions', label: 'Predictive Analytics', icon: TrendingUp, component: PredictiveAnalytics },
    { id: 'automation', label: 'Automation Center', icon: Bot, component: AutomationCenter },
    { id: 'optimizer', label: 'Performance Optimizer', icon: BarChart3, component: PerformanceOptimizer }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || SmartDashboard;

  return (
    <div className="space-y-8">
      <UniversalHeader
        title="Smart Dashboard"
        subtitle="Advanced AI-powered property management tools"
        icon={BarChart3}
        stats={[
          { label: 'Properties', value: stats?.totalProperties || 0, color: 'blue' },
          { label: 'AI Insights', value: '12', color: 'green' },
          { label: 'Automations', value: '8', color: 'purple' },
          { label: 'Efficiency', value: '+35%', color: 'orange' }
        ]}
      />

      {/* Tab Navigation */}
      <UniversalCard gradient="blue" className="phase4-container">
        <div className="phase4-tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </UniversalCard>

      {/* Active Component */}
      <ActiveComponent />
    </div>
  );
};

export default SmartDashboardPage;