import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Play, 
  Cpu, 
  Trophy, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  User,
  Zap,
  TrendingUp,
  Clock,
  Star,
  Home,
  BookOpen,
  Users
} from 'lucide-react';

// Make sure this import path is correct based on your file structure
import MyProjects from './MyProjects';
import CircuitPlayground from './CircuitPlayground';

console.log('MyProjects imported:', MyProjects);
console.log('Type of MyProjects:', typeof MyProjects);

const Dashboard = ({ user, onLogout, onNavigateToMain }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sample data - will be replaced with API calls
  const stats = {
    xp: 2450,
    level: 7,
    projects: 12,
    flightHours: 24.5,
    circuits: 8,
    achievements: 15
  };

  const recentActivity = [
    { id: 1, type: 'project', action: 'uploaded', item: 'Hexacopter Frame v2', time: '2 hours ago' },
    { id: 2, type: 'achievement', action: 'unlocked', item: 'Circuit Master Badge', time: '5 hours ago' },
    { id: 3, type: 'flight', action: 'analyzed', item: 'Mountain Course Flight', time: '1 day ago' },
    { id: 4, type: 'circuit', action: 'completed', item: 'LED Controller Challenge', time: '2 days ago' }
  ];

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: Layers },
    { id: 'flights', label: 'Flight Videos', icon: Play },
    { id: 'circuits', label: 'Circuits', icon: Cpu },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Add a way to go back to main site
  const handleBackToMain = () => {
    if (onNavigateToMain) {
      onNavigateToMain();
    }
  };

  // Close mobile sidebar when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderSidebar = () => (
    <div className={`bg-white h-full flex flex-col shadow-xl ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="3D Prints and Drones" 
                className="h-12 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <h2 
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                style={{ display: 'none' }}
              >
                Dashboard
              </h2>
            </div>
          )}

          {sidebarCollapsed && (
            <img 
              src="/logo.png" 
              alt="3D Prints and Drones" 
              className="h-14 w-8 mx-auto object-contain"
            />
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden lg:block"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className={`p-4 border-b border-gray-200 ${sidebarCollapsed ? 'px-2' : ''}`}>
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <img 
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=007AFF&color=fff`}
            alt={user?.name}
            className={`rounded-full ${sidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`}
          />
          {!sidebarCollapsed && (
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">Level {stats.level}</p>
            </div>
          )}
        </div>
        {!sidebarCollapsed && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-cyan-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total XP</span>
              <span className="text-sm font-bold text-green-600">{stats.xp}</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: '68%' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className={`p-4 border-t border-gray-200 space-y-2 ${sidebarCollapsed ? 'px-2' : ''}`}>
        <button
          onClick={handleBackToMain}
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors`}
        >
          <Home className="w-5 h-5" />
          {!sidebarCollapsed && <span className="font-medium">Main Site</span>}
        </button>
        <button
          onClick={onLogout}
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors`}
        >
          <LogOut className="w-5 h-5" />
          {!sidebarCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="opacity-90">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            <span className="text-sm text-green-600 font-medium">+125</span>
          </div>
          <p className="text-2xl font-bold">{stats.xp}</p>
          <p className="text-sm text-gray-500">Total XP</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-400">Level</span>
          </div>
          <p className="text-2xl font-bold">{stats.level}</p>
          <p className="text-sm text-gray-500">Current Level</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Layers className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{stats.projects}</p>
          <p className="text-sm text-gray-500">Projects</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Play className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-2xl font-bold">{stats.flightHours}h</p>
          <p className="text-sm text-gray-500">Flight Time</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Cpu className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-2xl font-bold">{stats.circuits}</p>
          <p className="text-sm text-gray-500">Circuits</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 text-pink-500" />
          </div>
          <p className="text-2xl font-bold">{stats.achievements}</p>
          <p className="text-sm text-gray-500">Achievements</p>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activity.type === 'project' ? 'bg-blue-100' :
                    activity.type === 'achievement' ? 'bg-yellow-100' :
                    activity.type === 'flight' ? 'bg-orange-100' :
                    'bg-purple-100'
                  }`}>
                    {activity.type === 'project' && <Layers className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'achievement' && <Trophy className="w-5 h-5 text-yellow-600" />}
                    {activity.type === 'flight' && <Play className="w-5 h-5 text-orange-600" />}
                    {activity.type === 'circuit' && <Cpu className="w-5 h-5 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.action}</span>{' '}
                      <span className="text-gray-900">{activity.item}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-gray-500" />
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-colors text-left">
                <Layers className="w-8 h-8 text-blue-600 mb-2" />
                <p className="font-medium">New Project</p>
                <p className="text-sm text-gray-500">Start creating</p>
              </button>
              <button className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 transition-colors text-left">
                <Play className="w-8 h-8 text-orange-600 mb-2" />
                <p className="font-medium">Upload Flight</p>
                <p className="text-sm text-gray-500">Share video</p>
              </button>
              <button className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors text-left">
                <Cpu className="w-8 h-8 text-purple-600 mb-2" />
                <p className="font-medium">New Circuit</p>
                <p className="text-sm text-gray-500">Design now</p>
              </button>
              <button className="p-4 bg-gradient-to-r from-green-50 to-cyan-50 rounded-lg hover:from-green-100 hover:to-cyan-100 transition-colors text-left">
                <Trophy className="w-8 h-8 text-green-600 mb-2" />
                <p className="font-medium">Challenges</p>
                <p className="text-sm text-gray-500">Earn XP</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    console.log('activeSection:', activeSection);
    console.log('MyProjects type:', typeof MyProjects);
    console.log('MyProjects:', MyProjects);
    
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'projects':
        // Add a safety check
        if (typeof MyProjects !== 'function') {
          console.error('MyProjects is not a valid component:', MyProjects);
          return <div>Error loading Projects component</div>;
        }
        return <MyProjects user={user} />;
      case 'flights':
        return <div className="bg-white rounded-xl p-8 shadow-sm"><h2 className="text-2xl font-bold mb-4">Flight Videos</h2><p>Flight videos section coming soon...</p></div>;
      case 'circuits':
        return <CircuitPlayground user={user} />;
      case 'achievements':
        return <div className="bg-white rounded-xl p-8 shadow-sm"><h2 className="text-2xl font-bold mb-4">Achievements</h2><p>Achievements section coming soon...</p></div>;
      case 'learning':
        return <div className="bg-white rounded-xl p-8 shadow-sm"><h2 className="text-2xl font-bold mb-4">Learning Progress</h2><p>Learning section coming soon...</p></div>;
      case 'settings':
        return <div className="bg-white rounded-xl p-8 shadow-sm"><h2 className="text-2xl font-bold mb-4">Settings</h2><p>Settings section coming soon...</p></div>;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {renderSidebar()}
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-50">
            {renderSidebar()}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 hidden sm:block"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                  <Bell className="w-6 h-6 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-cyan-50 rounded-full">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">{stats.xp} XP</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;