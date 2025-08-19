import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  Gauge,
  Battery,
  Navigation,
  Clock,
  MapPin,
  Award,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCw,
  Maximize2,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { flightService } from './services/flightService';

const FlightComparison = ({ videos, onClose }) => {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [syncedTime, setSyncedTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('altitude');

  useEffect(() => {
    if (videos && videos.length >= 2) {
      fetchComparisonData();
    }
  }, [videos]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const videoIds = videos.map(v => v.id);
      const response = await flightService.compareFlights(videoIds);
      setComparisonData(response.data);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      // Use mock data for demonstration
      setComparisonData(generateMockComparisonData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockComparisonData = () => {
    return {
      videos: videos,
      metrics: {
        altitude: {
          max: 150,
          avg: 85,
          data: videos.map((v, i) => ({
            id: v.id,
            title: v.title,
            value: 120 + i * 15,
            data: Array.from({ length: 50 }, (_, idx) => ({
              time: idx * 4,
              value: 50 + Math.sin(idx / 10 + i) * 30 + Math.random() * 10
            }))
          }))
        },
        speed: {
          max: 65,
          avg: 45,
          data: videos.map((v, i) => ({
            id: v.id,
            title: v.title,
            max: 50 + i * 5,
            avg: 35 + i * 3,
            data: Array.from({ length: 50 }, (_, idx) => ({
              time: idx * 4,
              value: 30 + Math.cos(idx / 8 + i) * 15 + Math.random() * 5
            }))
          }))
        },
        distance: {
          total: videos.reduce((sum, v) => sum + (v.analysis?.total_distance || 2.5), 0),
          data: videos.map((v, i) => ({
            id: v.id,
            title: v.title,
            value: 2.5 + i * 0.5
          }))
        },
        battery: {
          efficiency: videos.map((v, i) => ({
            id: v.id,
            title: v.title,
            used: 25 + i * 5,
            efficiency: 85 - i * 5
          }))
        }
      },
      performance: videos.map((v, i) => ({
        id: v.id,
        title: v.title,
        score: 85 + i * 3,
        metrics: {
          altitude: 80 + i * 5,
          speed: 75 + i * 8,
          distance: 90 - i * 5,
          efficiency: 85 - i * 3,
          stability: 88 + i * 2,
          control: 92 - i * 4
        }
      }))
    };
  };

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'altitude', label: 'Altitude', icon: TrendingUp },
    { id: 'speed', label: 'Speed', icon: Gauge },
    { id: 'battery', label: 'Battery', icon: Battery },
    { id: 'performance', label: 'Performance', icon: Award }
  ];

  const renderOverview = () => {
    if (!comparisonData) return null;

    return (
      <div className="space-y-6">
        {/* Key Metrics Comparison */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Max Altitude</h4>
            <div className="space-y-2">
              {comparisonData.metrics.altitude.data.map((flight, index) => (
                <div key={flight.id} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1" style={{ color: colors[index] }}>
                    {flight.title}
                  </span>
                  <span className="font-bold">{flight.value}m</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Max Speed</h4>
            <div className="space-y-2">
              {comparisonData.metrics.speed.data.map((flight, index) => (
                <div key={flight.id} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1" style={{ color: colors[index] }}>
                    {flight.title}
                  </span>
                  <span className="font-bold">{flight.max} km/h</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Total Distance</h4>
            <div className="space-y-2">
              {comparisonData.metrics.distance.data.map((flight, index) => (
                <div key={flight.id} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1" style={{ color: colors[index] }}>
                    {flight.title}
                  </span>
                  <span className="font-bold">{flight.value.toFixed(1)} km</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Performance Score</h4>
            <div className="space-y-2">
              {comparisonData.performance.map((flight, index) => (
                <div key={flight.id} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1" style={{ color: colors[index] }}>
                    {flight.title}
                  </span>
                  <span className="font-bold">{flight.score}/100</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Radar Chart */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={[
              { metric: 'Altitude', ...comparisonData.performance.reduce((acc, p, i) => ({ ...acc, [`flight${i}`]: p.metrics.altitude }), {}) },
              { metric: 'Speed', ...comparisonData.performance.reduce((acc, p, i) => ({ ...acc, [`flight${i}`]: p.metrics.speed }), {}) },
              { metric: 'Distance', ...comparisonData.performance.reduce((acc, p, i) => ({ ...acc, [`flight${i}`]: p.metrics.distance }), {}) },
              { metric: 'Efficiency', ...comparisonData.performance.reduce((acc, p, i) => ({ ...acc, [`flight${i}`]: p.metrics.efficiency }), {}) },
              { metric: 'Stability', ...comparisonData.performance.reduce((acc, p, i) => ({ ...acc, [`flight${i}`]: p.metrics.stability }), {}) },
              { metric: 'Control', ...comparisonData.performance.reduce((acc, p, i) => ({ ...acc, [`flight${i}`]: p.metrics.control }), {}) }
            ]}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              {comparisonData.performance.map((_, index) => (
                <Radar
                  key={index}
                  name={videos[index].title}
                  dataKey={`flight${index}`}
                  stroke={colors[index]}
                  fill={colors[index]}
                  fillOpacity={0.3}
                />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Side by side video preview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map((video, index) => (
            <div key={video.id} className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <div className="aspect-video bg-gray-900 relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Play className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-medium text-sm truncate">{video.title}</h4>
                <p className="text-xs text-gray-500 mt-1">by {video.user.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMetricComparison = (metric) => {
    if (!comparisonData || !comparisonData.metrics[metric]) return null;

    const metricData = comparisonData.metrics[metric];
    const chartData = [];
    
    // Merge all flight data points
    const maxLength = Math.max(...metricData.data.map(f => f.data?.length || 0));
    for (let i = 0; i < maxLength; i++) {
      const point = { time: i * 4 };
      metricData.data.forEach((flight, index) => {
        if (flight.data && flight.data[i]) {
          point[`flight${index}`] = flight.data[i].value;
        }
      });
      chartData.push(point);
    }

    return (
      <div className="space-y-6">
        {/* Metric Chart */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 capitalize">{metric} Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(value) => `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => `Time: ${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`}
              />
              {videos.map((video, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={`flight${index}`}
                  name={video.title}
                  stroke={colors[index]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Maximum Values</h4>
            <div className="space-y-2">
              {metricData.data.map((flight, index) => (
                <div key={flight.id} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: colors[index] }}>
                    {flight.title}
                  </span>
                  <span className="font-bold">
                    {flight.value || flight.max} {metric === 'altitude' ? 'm' : 'km/h'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Average Values</h4>
            <div className="space-y-2">
              {metricData.data.map((flight, index) => (
                <div key={flight.id} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: colors[index] }}>
                    {flight.title}
                  </span>
                  <span className="font-bold">
                    {flight.avg || Math.round(flight.value * 0.7)} {metric === 'altitude' ? 'm' : 'km/h'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Difference from Best</h4>
            <div className="space-y-2">
              {metricData.data.map((flight, index) => {
                const maxValue = Math.max(...metricData.data.map(f => f.value || f.max || 0));
                const diff = maxValue - (flight.value || flight.max || 0);
                return (
                  <div key={flight.id} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: colors[index] }}>
                      {flight.title}
                    </span>
                    <span className={`font-bold ${diff === 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {diff === 0 ? 'Best' : `-${diff.toFixed(1)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBatteryComparison = () => {
    if (!comparisonData) return null;

    const batteryData = comparisonData.metrics.battery.efficiency;

    return (
      <div className="space-y-6">
        {/* Battery Usage Chart */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Battery Usage & Efficiency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={batteryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="used" name="Battery Used (%)" fill="#EF4444" />
              <Bar dataKey="efficiency" name="Efficiency Score" fill="#10B981" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency Metrics */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Distance per Battery %</h4>
            <div className="space-y-2">
              {videos.map((video, index) => {
                const distance = comparisonData.metrics.distance.data.find(d => d.id === video.id)?.value || 0;
                const batteryUsed = batteryData.find(b => b.id === video.id)?.used || 1;
                const efficiency = (distance / batteryUsed * 100).toFixed(2);
                
                return (
                  <div key={video.id} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: colors[index] }}>
                      {video.title}
                    </span>
                    <span className="font-bold">{efficiency} m/%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Flight Time Efficiency</h4>
            <div className="space-y-2">
              {videos.map((video, index) => {
                const duration = video.duration_seconds || 180;
                const batteryUsed = batteryData.find(b => b.id === video.id)?.used || 1;
                const timePerBattery = (duration / batteryUsed).toFixed(0);
                
                return (
                  <div key={video.id} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: colors[index] }}>
                      {video.title}
                    </span>
                    <span className="font-bold">{timePerBattery} s/%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceComparison = () => {
    if (!comparisonData) return null;

    return (
      <div className="space-y-6">
        {/* Overall Scores */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Overall Performance Scores</h3>
          <div className="space-y-4">
            {comparisonData.performance
              .sort((a, b) => b.score - a.score)
              .map((flight, index) => {
                const originalIndex = videos.findIndex(v => v.id === flight.id);
                return (
                  <div key={flight.id} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium" style={{ color: colors[originalIndex] }}>
                        {flight.title}
                      </span>
                      <span className="text-2xl font-bold">{flight.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${flight.score}%`,
                          backgroundColor: colors[originalIndex]
                        }}
                      />
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2">
                        <Award className="w-6 h-6 text-yellow-500" />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid md:grid-cols-2 gap-4">
          {Object.keys(comparisonData.performance[0].metrics).map(metric => (
            <div key={metric} className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-600 mb-3 capitalize">{metric}</h4>
              <div className="space-y-2">
                {comparisonData.performance.map((flight, index) => {
                  const value = flight.metrics[metric];
                  const maxValue = Math.max(...comparisonData.performance.map(f => f.metrics[metric]));
                  const isMax = value === maxValue;
                  
                  return (
                    <div key={flight.id} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: colors[index] }}>
                        {flight.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${value}%`,
                              backgroundColor: colors[index]
                            }}
                          />
                        </div>
                        <span className={`font-bold text-sm ${isMax ? 'text-green-600' : ''}`}>
                          {value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'altitude':
        return renderMetricComparison('altitude');
      case 'speed':
        return renderMetricComparison('speed');
      case 'battery':
        return renderBatteryComparison();
      case 'performance':
        return renderPerformanceComparison();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-gray-50 rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Flight Comparison</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Tab navigation */}
            <div className="flex gap-2 mt-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightComparison;