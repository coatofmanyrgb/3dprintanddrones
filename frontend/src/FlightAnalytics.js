import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  Gauge, 
  Wind, 
  Battery, 
  Clock,
  MapPin,
  Activity,
  AlertTriangle,
  Award,
  Navigation,
  Thermometer,
  Cloud,
  Target,
  Zap
} from 'lucide-react';

const FlightAnalytics = ({ analysis, video }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('altitude');

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl p-6">
        <p className="text-gray-500 text-center">No analysis data available</p>
      </div>
    );
  }

  // Calculate additional metrics
  const efficiency = analysis.battery_used ? 
    ((analysis.total_distance / analysis.battery_used) * 100).toFixed(1) : 0;
  
  const avgClimbRate = analysis.flight_data ? 
    analysis.flight_data.reduce((acc, point, idx, arr) => {
      if (idx === 0) return acc;
      const timeDiff = point.timestamp - arr[idx - 1].timestamp;
      const altDiff = point.altitude - arr[idx - 1].altitude;
      return acc + (altDiff / timeDiff);
    }, 0) / analysis.flight_data.length : 0;

  // Format flight path data for charts
  const chartData = analysis.flight_data || [];

  // Performance radar data
  const performanceData = [
    { metric: 'Speed', value: Math.min((analysis.max_speed / 60) * 100, 100) },
    { metric: 'Altitude', value: Math.min((analysis.max_altitude / 300) * 100, 100) },
    { metric: 'Distance', value: Math.min((analysis.total_distance / 10) * 100, 100) },
    { metric: 'Efficiency', value: parseFloat(efficiency) },
    { metric: 'Stability', value: 85 }, // Mock value
    { metric: 'Control', value: 90 }, // Mock value
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'altitude', label: 'Altitude', icon: TrendingUp },
    { id: 'speed', label: 'Speed', icon: Gauge },
    { id: 'battery', label: 'Battery', icon: Battery },
    { id: 'performance', label: 'Performance', icon: Award }
  ];

  const StatCard = ({ icon: Icon, label, value, unit, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600',
      yellow: 'bg-yellow-100 text-yellow-600'
    };

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">{label}</span>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-sm text-gray-500">{unit}</span>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Key metrics grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={TrendingUp}
                label="Max Altitude"
                value={analysis.max_altitude || 0}
                unit="m"
                color="blue"
              />
              <StatCard
                icon={Gauge}
                label="Max Speed"
                value={analysis.max_speed || 0}
                unit="km/h"
                color="orange"
              />
              <StatCard
                icon={Navigation}
                label="Distance"
                value={analysis.total_distance || 0}
                unit="km"
                color="green"
              />
              <StatCard
                icon={Clock}
                label="Flight Time"
                value={Math.floor((analysis.flight_time || 0) / 60)}
                unit="min"
                color="purple"
              />
            </div>

            {/* Performance Score */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Performance Score</h3>
                <Award className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-2">
                {analysis.performance_score || 85}/100
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>Efficiency: {efficiency}%</span>
                <span>•</span>
                <span>Stability: 90%</span>
              </div>
            </div>

            {/* Flight summary chart */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold mb-4">Flight Profile</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => `Time: ${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="altitude" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.3}
                    name="Altitude (m)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'altitude':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold mb-4">Altitude Profile</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => `${Math.floor(value / 60)}m`}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="altitude" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={false}
                    name="Altitude (m)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={TrendingUp}
                label="Max Altitude"
                value={analysis.max_altitude || 0}
                unit="m"
                color="blue"
              />
              <StatCard
                icon={Activity}
                label="Avg Climb Rate"
                value={avgClimbRate.toFixed(1)}
                unit="m/s"
                color="green"
              />
            </div>
          </div>
        );

      case 'speed':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold mb-4">Speed Analysis</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => `${Math.floor(value / 60)}m`}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="speed" 
                    stroke="#F97316" 
                    strokeWidth={2}
                    dot={false}
                    name="Speed (km/h)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={Gauge}
                label="Max Speed"
                value={analysis.max_speed || 0}
                unit="km/h"
                color="orange"
              />
              <StatCard
                icon={Activity}
                label="Avg Speed"
                value={analysis.avg_speed || 0}
                unit="km/h"
                color="blue"
              />
            </div>
          </div>
        );

      case 'battery':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold mb-4">Battery Usage</h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => `${Math.floor(value / 60)}m`}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="battery" 
                    stroke="#10B981" 
                    fill="#10B981"
                    fillOpacity={0.3}
                    name="Battery (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={Battery}
                label="Battery Used"
                value={analysis.battery_used || 0}
                unit="%"
                color="green"
              />
              <StatCard
                icon={Zap}
                label="Efficiency"
                value={efficiency}
                unit="%"
                color="yellow"
              />
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold mb-4">Performance Metrics</h4>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={performanceData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar 
                    name="Performance" 
                    dataKey="value" 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.6} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Warnings and alerts */}
            {analysis.warnings && analysis.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  Flight Warnings
                </h4>
                <ul className="space-y-1 text-sm text-yellow-700">
                  {analysis.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-6">Flight Analytics</h3>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {renderContent()}

      {/* Weather conditions */}
      {analysis.weather_conditions && (
        <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-gray-600" />
            Weather Conditions
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Wind Speed:</span>
              <span className="font-medium">{analysis.wind_speed || 0} km/h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Temperature:</span>
              <span className="font-medium">{analysis.temperature || 20}°C</span>
            </div>
          </div>
        </div>
      )}

      {/* Location info */}
      {(analysis.takeoff_location || analysis.landing_location) && (
        <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            Flight Locations
          </h4>
          <div className="space-y-2 text-sm">
            {analysis.takeoff_location && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Takeoff:</span>
                <span className="font-medium">{analysis.takeoff_location.address || 'Unknown'}</span>
              </div>
            )}
            {analysis.landing_location && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Landing:</span>
                <span className="font-medium">{analysis.landing_location.address || 'Unknown'}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightAnalytics;