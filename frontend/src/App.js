import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { authService } from './services/api';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Zap, Cpu, Layers, Award, Check, Users, Calendar, TrendingUp, Play, Pause, RotateCw, Upload, Share2, Heart, MessageCircle, Star, Trophy, Target, Gauge, Wind, Activity, Code, Lightbulb, Rocket, Brain, Shield, ChevronRight, Menu, X, Sun, Moon, Github, Twitter, Youtube, Wifi, Battery, Search, ZoomIn, Maximize, Download, Eye, Signal, LogOut, Clock } from 'lucide-react';
import Dashboard from './Dashboard';
import CircuitPlayground from './CircuitPlayground';
import KiteDesignStudio from './KiteDesignStudio';
import FlightLab from './FlightLab';



// Replace the colors object with this new one
const colors = {
  // New colors
  primary: '#007AFF',
  secondary: '#5856D6',
  accent: '#FF2D55',
  success: '#34C759',
  warning: '#FF9500',
  dark: '#1C1C1E',
  
  // Keep old structure for compatibility
  neon: {
    green: '#34C759',
    cyan: '#00BFFF',
    pink: '#FF2D55',
    orange: '#FF9500',
    yellow: '#FFCC00'
  },
  
  bg: {
    dark: '#1C1C1E',
    darker: '#000000',
    card: '#FFFFFF',
    hover: '#F5F5F5'
  },
  
  gray: {
    50: '#F9FAFB',
    100: '#F2F2F7',
    200: '#E5E5EA',
    300: '#C7C7CC',
    400: '#8E8E93',
    500: '#636366',
    600: '#48484A',
    700: '#363638',
    800: '#2C2C2E',
    900: '#1C1C1E'
  },
  
  gradient: {
    blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    green: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  }
};

// Type definitions


// 3D Model Component with proper types
const Model3D = ({ modelData }) => {
  const meshRef = useRef(null);
  
  useEffect(() => {
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#007AFF" wireframe />
    </mesh>
  );
};




// Main App Component
export default function STEMLabPlatform() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [userXP, setUserXP] = useState(2450);
  const [selectedProject, setSelectedProject] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState('1'); // Changed to string
  const [circuitMode, setCircuitMode] = useState('build');
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  console.log('App Component Mounted');
  console.log('Token in localStorage:', localStorage.getItem('auth_token'));
  console.log('ShowDashboard in localStorage:', localStorage.getItem('showDashboard'));

  const flightData = [
    { time: 0, altitude: 0, speed: 0 },
    { time: 1, altitude: 12, speed: 15 },
    { time: 2, altitude: 25, speed: 22 },
    { time: 3, altitude: 35, speed: 25 },
    { time: 4, altitude: 42, speed: 20 },
    { time: 5, altitude: 38, speed: 18 }
  ];

  const projects = [
    { id: 1, title: "Hexacopter Drone", author: "Alex Chen", votes: 234, category: "flight" },
    { id: 2, title: "LED Matrix Display", author: "Sarah Kim", votes: 189, category: "electronics" },
    { id: 3, title: "Parametric Wing Design", author: "Marcus Rodriguez", votes: 156, category: "3d" }
  ];

  const achievements = [
    { id: 1, name: "First Flight", icon: Rocket, unlocked: true, xp: 100 },
    { id: 2, name: "Circuit Master", icon: Cpu, unlocked: true, xp: 250 },
    { id: 3, name: "3D Designer", icon: Layers, unlocked: false, xp: 500 }
  ];

  const Model3DViewer = ({ modelUrl }) => {
    const mesh = useRef();
    const [geometry, setGeometry] = useState(null);
    
    useEffect(() => {
      // In real app, you'd load actual STL files
      // For now, using a placeholder geometry
      const geo = new THREE.BoxGeometry(2, 2, 2);
      setGeometry(geo);
    }, [modelUrl]);
    
    if (!geometry) return null;
    
    return (
      <mesh ref={mesh} geometry={geometry}>
        <meshStandardMaterial color="#007AFF" />
      </mesh>
    );
  };


  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      });
    };
    
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);


  useEffect(() => {
    const initAuth = async () => {
      console.log('Starting auth check...');
      
      try {
        // Check if we have a token
        const token = localStorage.getItem('auth_token');
        console.log('Token found:', token);
        
        if (!token) {
          console.log('No token found, user is not authenticated');
          setAuthChecked(true);
          return;
        }

        // Try to get the current user
        console.log('Fetching user data...');
        const response = await authService.getUser();
        console.log('User data received:', response.data);
        
        setUser(response.data);
        
        // Check if we should show dashboard
        const shouldShowDashboard = localStorage.getItem('showDashboard') === 'true';
        console.log('Should show dashboard:', shouldShowDashboard);
        
        if (shouldShowDashboard) {
          setShowDashboard(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        console.error('Error response:', error.response);
        
        // Clear invalid token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('showDashboard');
      } finally {
        setAuthChecked(true);
      }
    };

    initAuth();
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login...');
      const response = await authService.login(email, password);
      console.log('Login response:', response.data);
      
      // Make sure we're getting the user data
      const userData = response.data.user || response.data;
      setUser(userData);
      setShowLoginModal(false);
      
      // Save dashboard preference
      localStorage.setItem('showDashboard', 'true');
      setShowDashboard(true);
      
      console.log('Login successful, token saved:', localStorage.getItem('auth_token'));
      
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.register(userData);
      setUser(response.data.user);
      setShowRegisterModal(false);
      
      // Redirect to dashboard after successful registration
      setShowDashboard(true);
      
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, we should clear local state
    } finally {
      setUser(null);
      setShowDashboard(false);
      setActiveSection('home');
    }
  };

  


  const handleNavigateToMain = () => {
    setShowDashboard(false);
    setActiveSection('home');
  };


    



  // Add this component after the Points component, before STEMLabPlatform
  const WavePlane = () => {
    const meshRef = useRef();
    
    useEffect(() => {
      const animate = () => {
        if (meshRef.current) {
          const time = Date.now() * 0.001;
          const geometry = meshRef.current.geometry;
          const position = geometry.attributes.position;
          
          for (let i = 0; i < position.count; i++) {
            const x = position.getX(i);
            const y = position.getY(i);
            const z = Math.sin(x * 0.5 + time) * 0.5 + Math.cos(y * 0.5 + time) * 0.5;
            position.setZ(i, z);
          }
          position.needsUpdate = true;
        }
        requestAnimationFrame(animate);
      };
      animate();
    }, []);

    return (
      <mesh ref={meshRef} position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50, 50, 50]} />
        <meshPhysicalMaterial 
          color="#007AFF"
          metalness={0.8}
          roughness={0.2}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    );
  };

  if (user && showDashboard) {
    return (
      <Dashboard 
        user={user} 
        onLogout={handleLogout}
        onNavigateToMain={handleNavigateToMain}
      />
    );
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is logged in and showDashboard is true, render the Dashboard
  if (user && showDashboard) {
    console.log('Rendering Dashboard');
    return (
      <Dashboard 
        user={user} 
        onLogout={handleLogout}
        onNavigateToMain={handleNavigateToMain}
      />
    );
  }

  console.log('Rendering Main App');

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-orbitron text-gray-900 transition-all duration-300 overflow-x-hidden`}>
      {/* Cyberpunk Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(${colors.neon.green}22 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Desktop Nav */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="3D Prints and Drones" 
                  className="h-14 w-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <h1 
                  className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  style={{ display: 'none' }}
                >
                  3D Prints and Drones
                </h1>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  {['Home', '3D Gallery', 'Flight Lab', 'Circuits', 'Kites', 'Community'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setActiveSection(item.toLowerCase().replace(' ', ''))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeSection === item.toLowerCase().replace(' ', '') 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right side items */}
            <div className="flex items-center gap-3">
              {/* XP Counter - Desktop only */}
              {user && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-full border border-green-500/30">
                  {/*<Zap className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-mono">{userXP} XP</span> */}
                </div>
              )}
              
              {/* Auth Buttons - Desktop */}
              <div className="hidden md:flex items-center gap-3">
                {!user ? (
                  <>
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    >
                      Get Started
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowDashboard(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      Dashboard
                    </button>
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=007AFF&color=fff`} 
                        alt={user.name}
                        className="w-10 h-10 rounded-full border-2 border-blue-400"
                      />
                      <span className="text-gray-700 font-medium">{user.username}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {mobileMenu ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          mobileMenu ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 pt-2 pb-4 bg-white border-t border-gray-100">
            {/* User Info for Mobile */}
            {user && (
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=007AFF&color=fff`} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-blue-400"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-full">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-mono text-sm">{userXP}</span>
                </div>
              </div>
            )}

            {/* Dashboard Button for Mobile (when logged in) */}
            {user && (
              <button
                onClick={() => {
                  setShowDashboard(true);
                  setMobileMenu(false);
                }}
                className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold"
              >
                Go to Dashboard
              </button>
            )}

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {['Home', 'Gallery', 'Flight Lab', 'Circuits', 'Achievements', 'Community'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveSection(item.toLowerCase().replace(' ', ''));
                    setMobileMenu(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 flex items-center justify-between ${
                    activeSection === item.toLowerCase().replace(' ', '') 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{item}</span>
                  {activeSection === item.toLowerCase().replace(' ', '') && (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile Auth Buttons */}
            {!user ? (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowRegisterModal(true);
                    setMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold"
                >
                  Get Started Free
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 text-red-600 bg-red-50 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'home' && (
          <div className="relative">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              {/* Floating Orbs */}
              <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
              <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
              {/* 3D Animated Background using Three.js */}
              <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 25], fov: 50 }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} intensity={1.5} color="#007AFF" />
                  <pointLight position={[-10, -10, -10]} intensity={1.5} color="#ff6600" />
                  
                  {/* Large Central Drone - positioned above text */}
                  
                  
                  {/* Left Side Drone - Smaller */}
                  <group position={[-18, 5, 0]} scale={[1.5, 1.5, 1.5]} rotation={[0, Date.now() * 0.001, 0]}>
                    <mesh>
                      <boxGeometry args={[1.5, 0.3, 1.5]} />
                      <meshPhysicalMaterial 
                        color="#1a1a1a"
                        metalness={0.9}
                        roughness={0.1}
                        emissive="#007AFF"
                        emissiveIntensity={0.2}
                      />
                    </mesh>
                    {/* Simplified propellers for side drones */}
                    {[[1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1]].map((pos, i) => (
                      <group key={i} position={pos}>
                        <group position={[0, 0.2, 0]} rotation={[0, Date.now() * 0.08, 0]}>
                          <mesh>
                            <boxGeometry args={[1.5, 0.02, 0.2]} />
                            <meshBasicMaterial color="#007AFF" />
                          </mesh>
                        </group>
                      </group>
                    ))}
                  </group>
                  
                  {/* Right Side Drone - Smaller */}
                  <group position={[18, 3, 0]} scale={[1.5, 1.5, 1.5]} rotation={[0, -Date.now() * 0.001, 0]}>
                    <mesh>
                      <boxGeometry args={[1.5, 0.3, 1.5]} />
                      <meshPhysicalMaterial 
                        color="#1a1a1a"
                        metalness={0.9}
                        roughness={0.1}
                        emissive="#FF2D55"
                        emissiveIntensity={0.2}
                      />
                    </mesh>
                    {/* Simplified propellers */}
                    {[[1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1]].map((pos, i) => (
                      <group key={i} position={pos}>
                        <group position={[0, 0.2, 0]} rotation={[0, Date.now() * 0.08, 0]}>
                          <mesh>
                            <boxGeometry args={[1.5, 0.02, 0.2]} />
                            <meshBasicMaterial color="#FF2D55" />
                          </mesh>
                        </group>
                      </group>
                    ))}
                  </group>
                  
                  {/* Floating particles around drones */}
                  {[...Array(30)].map((_, i) => (
                    <mesh
                      key={i}
                      position={[
                        (Math.random() - 0.5) * 40,
                        (Math.random() - 0.5) * 20 + 5,
                        (Math.random() - 0.5) * 20
                      ]}
                    >
                      <sphereGeometry args={[0.1, 8, 8]} />
                      <meshBasicMaterial 
                        color={i % 3 === 0 ? '#007AFF' : i % 3 === 1 ? '#FF2D55' : '#00FF00'} 
                        transparent
                        opacity={0.8}
                      />
                    </mesh>
                  ))}
                  
                  {/* ADD THE WAVE PLANE HERE */}
                  <WavePlane />
                </Canvas>
              </div>

              {/* Hero Content */}
              <div className="relative z-10 text-center max-w-6xl mx-auto">
                {/* Animated Title */}
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 relative">
                  <span className="block animate-slide-in-left">
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-shift">
                      3D PRINTS
                    </span>
                  </span>
                  <span className="block text-3xl md:text-4xl my-4 text-gray-400 animate-slide-in-right">
                    &
                  </span>
                  <span className="block animate-slide-in-left animation-delay-200">
                    <span className="bg-gradient-to-r from-orange-600 via-red-600 to-purple-600 bg-clip-text text-transparent animate-gradient-shift">
                      DRONES
                    </span>
                  </span>
                </h1>

                {/* Animated Subtitle */}
                <p className="text-2xl md:text-3xl text-gray-600 mb-12 font-light text-white animate-slide-in-up animation-delay-400">
                  Where Innovation Takes Flight
                </p>

                {/* Animated Feature Pills */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  {[
                    { icon: Layers, text: "3D Design", color: "blue", delay: "600" },
                    { icon: Cpu, text: "Electronics", color: "purple", delay: "700" },
                    { icon: Rocket, text: "Flight Tech", color: "pink", delay: "800" },
                    { icon: Users, text: "Community", color: "orange", delay: "900" }
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover-lift animate-slide-in-up animation-delay-${item.delay}`}
                      style={{ animationDelay: `${item.delay}ms` }}
                    >
                      <item.icon className={`w-5 h-5 text-${item.color}-600 animate-pulse-glow`} />
                      <span className="text-gray-700 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons with Animations */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="group relative px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-in-up animation-delay-1000 hover-lift"
                  >
                    <span className="relative z-10">Start Creating</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <button
                    onClick={() => setActiveSection('gallery')}
                    className="px-12 py-5 bg-white/80 backdrop-blur-sm text-gray-800 border-2 border-gray-200 rounded-full font-bold text-xl hover:bg-white hover:border-gray-300 hover:shadow-xl transition-all duration-300 animate-slide-in-up animation-delay-1100 hover-lift"
                  >
                    Explore Projects
                  </button>
                </div>

                {/* Animated Stats */}
                <div className="grid grid-cols-2  text-white md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                  {[
                    { label: "Active Makers", value: "2,847", icon: Users, gradient: "from-blue-400 to-blue-600" },
                    { label: "Projects", value: "12.5K", icon: Layers, gradient: "from-purple-400 to-purple-600" },
                    { label: "Drones Flying", value: "347", icon: Rocket, gradient: "from-pink-400 to-pink-600" },
                    { label: "Print Hours", value: "48.2K", icon: Clock, gradient: "from-orange-400 to-orange-600" }
                  ].map((stat, i) => (
                    <div key={i} className="text-center group animate-slide-in-up" style={{ animationDelay: `${1200 + i * 100}ms` }}>
                      <div className={`inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white group-hover:scale-110 transition-transform animate-float`} style={{ animationDelay: `${i * 200}ms` }}>
                        <stat.icon className="w-8 h-8" />
                      </div>
                      <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Animated Scroll Indicator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-gray-500 text-sm">Scroll to explore</span>
                  <ChevronRight className="w-6 h-6 text-gray-400 rotate-90" />
                </div>
              </div>
            </section>

            {/* Feature Cards Section with Animations */}
            <section className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-5xl md:text-6xl font-bold text-center mb-16 animate-slide-in-up">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Your Creative Playground
                  </span>
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      title: "3D Design Studio",
                      description: "Create, iterate, and bring your ideas to life with our advanced 3D printing lab.",
                      icon: Layers,
                      gradient: "from-blue-500 to-cyan-500",
                      delay: 0
                    },
                    {
                      title: "Drone Flight Lab",
                      description: "Build, program, and pilot drones. Master aerial photography and racing.",
                      icon: Rocket,
                      gradient: "from-purple-500 to-pink-500",
                      delay: 200
                    },
                    {
                      title: "Electronics Workshop",
                      description: "Design circuits for your creations. Add intelligence to your projects.",
                      icon: Cpu,
                      gradient: "from-orange-500 to-red-500",
                      delay: 400
                    }
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift animate-slide-in-up"
                      style={{ animationDelay: `${feature.delay}ms` }}
                    >
                      {/* Gradient Border Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      
                      {/* Icon with Animation */}
                      <div className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform animate-float`}>
                        <feature.icon className="w-10 h-10 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                      <p className="text-gray-600 mb-6">{feature.description}</p>
                      
                      <button className={`text-transparent bg-gradient-to-r ${feature.gradient} bg-clip-text font-semibold hover:underline`}>
                        Learn More →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Interactive CTA Section */}
            <section className="py-24 px-4 relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-shift"></div>
              
              <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
                <h2 className="text-5xl md:text-6xl font-bold mb-8 animate-slide-in-up">
                  Ready to Start Creating?
                </h2>
                <p className="text-xl mb-12 opacity-90 animate-slide-in-up animation-delay-200">
                  Join thousands of makers pushing the boundaries of technology.
                </p>
                
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-12 py-5 bg-white text-purple-600 rounded-full font-bold text-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-slide-in-up animation-delay-400"
                >
                  Join the Community
                </button>
              </div>
            </section>

            <section className="py-24 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12">Success Stories</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                      <img src="https://ui-avatars.com/api/?name=Alex" className="w-16 h-16 rounded-full" />
                      <div>
                        <h4 className="font-bold text-lg">Alex Rodriguez</h4>
                        <p className="text-gray-600">Built 15 drones, Started a business</p>
                      </div>
                    </div>
                    <p className="text-gray-700 italic">
                      "Started with zero experience. Now I run a drone photography business 
                      thanks to the skills I learned here. The community support was incredible!"
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <span className="text-sm text-gray-500">Projects: 47</span>
                      <span className="text-sm text-gray-500">Member since: 2023</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                      <img src="https://ui-avatars.com/api/?name=Alex" className="w-16 h-16 rounded-full" />
                      <div>
                        <h4 className="font-bold text-lg">Alex Rodriguez</h4>
                        <p className="text-gray-600">Built 15 drones, Started a business</p>
                      </div>
                    </div>
                    <p className="text-gray-700 italic">
                      "Started with zero experience. Now I run a drone photography business 
                      thanks to the skills I learned here. The community support was incredible!"
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <span className="text-sm text-gray-500">Projects: 47</span>
                      <span className="text-sm text-gray-500">Member since: 2023</span>
                    </div>
                  </div>
                  {/* More testimonials */}
                </div>
              </div>
            </section>

            <section className="py-24 px-4 bg-gray-50">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                  <details className="bg-white rounded-lg p-6 cursor-pointer">
                    <summary className="font-semibold text-lg">Do I need prior experience?</summary>
                    <p className="mt-4 text-gray-600">
                      Not at all! We welcome complete beginners. Our learning paths start 
                      from zero and guide you step-by-step.
                    </p>
                  </details>
                  
                  <details className="bg-white rounded-lg p-6 cursor-pointer">
                    <summary className="font-semibold text-lg">What equipment do I need?</summary>
                    <p className="mt-4 text-gray-600">
                      You can start with just a computer. As you progress, you might want 
                      to invest in a 3D printer or drone kit, but it's not required initially.
                    </p>
                  </details>
                  
                  {/* More FAQs */}
                </div>
              </div>
            </section>


            




          </div>
        )}


        {/* 3D Project Gallery */}

        {activeSection === '3dgallery' && (
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
            {/* Gallery Header */}
            <div className="max-w-7xl mx-auto px-4 mb-12">
              <h1 className="text-5xl font-bold text-center mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  3D Model Gallery
                </span>
              </h1>
              <p className="text-xl text-center text-gray-600 mb-8">
                Explore, share, and download amazing 3D designs from our community
              </p>
              
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    All Projects
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Drones
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Parts
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Accessories
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Art
                  </button>
                </div>
                
                {/* Search and Upload */}
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search models..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  {user && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Model
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Project */}
            <div className="max-w-7xl mx-auto px-4 mb-12">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl p-8 shadow-xl">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* 3D Viewer */}
                  <div className="h-96 bg-white rounded-2xl shadow-inner relative overflow-hidden">
                    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                      <ambientLight intensity={0.5} />
                      <pointLight position={[10, 10, 10]} />
                      <Suspense fallback={null}>
                        <Model3DViewer modelUrl="/path/to/model.stl" />
                      </Suspense>
                      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                      <gridHelper args={[10, 10]} />
                    </Canvas>
                    
                    {/* Model Controls */}
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <button className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <RotateCw className="w-5 h-5" />
                      </button>
                      <button className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <ZoomIn className="w-5 h-5" />
                      </button>
                      <button className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Project Info */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">Featured</span>
                        <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">Drone</span>
                      </div>
                      <h2 className="text-3xl font-bold mb-4">FPV Racing Drone Frame MK4</h2>
                      <p className="text-gray-600 mb-6">
                        Ultra-lightweight carbon fiber frame design optimized for competitive FPV racing. 
                        Features improved aerodynamics and crash resistance.
                      </p>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">2.4K</div>
                          <div className="text-sm text-gray-500">Downloads</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">847</div>
                          <div className="text-sm text-gray-500">Likes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">156</div>
                          <div className="text-sm text-gray-500">Makes</div>
                        </div>
                      </div>
                      
                      {/* Creator Info */}
                      <div className="flex items-center gap-4 p-4 bg-white rounded-xl mb-6">
                        <img 
                          src="https://ui-avatars.com/api/?name=Alex+Chen&background=007AFF" 
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <p className="font-semibold">Alex Chen</p>
                          <p className="text-sm text-gray-500">Level 12 Designer</p>
                        </div>
                        <button className="ml-auto px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                          Follow
                        </button>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        <Download className="w-5 h-5" />
                        Download STL
                      </button>
                      <button className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Grid */}
            <div className="max-w-7xl mx-auto px-4">
              <h3 className="text-2xl font-bold mb-6">Recent Uploads</h3>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    {/* 3D Preview */}
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl relative overflow-hidden">
                      <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} />
                        <mesh rotation={[Date.now() * 0.001, Date.now() * 0.001, 0]}>
                          <boxGeometry args={[1.5, 1.5, 1.5]} />
                          <meshStandardMaterial color={`hsl(${i * 30}, 70%, 50%)`} />
                        </mesh>
                        <OrbitControls enableZoom={false} enablePan={false} />
                      </Canvas>
                      
                      {/* Overlay Stats */}
                      <div className="absolute top-2 right-2 flex gap-2">
                        <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-lg backdrop-blur-sm">
                          <Eye className="w-3 h-3 inline mr-1" />
                          {Math.floor(Math.random() * 1000)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Project Info */}
                    <div className="p-4">
                      <h4 className="font-semibold mb-2">Project Name {i + 1}</h4>
                      <p className="text-sm text-gray-600 mb-3">Quick description of the 3D model...</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img 
                            src={`https://ui-avatars.com/api/?name=User${i}&background=random`} 
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-gray-500">User{i}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {Math.floor(Math.random() * 500)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {Math.floor(Math.random() * 200)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load More */}
              <div className="text-center mt-12">
                <button className="px-8 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  Load More Projects
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flight Lab Video Hub */}
        {activeSection === 'flightlab' && (
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
            {/* Flight Lab Header */}
            <div className="max-w-7xl mx-auto px-4 mb-12">
              <h1 className="text-5xl font-bold text-center mb-4">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Flight Lab
                </span>
              </h1>
              <p className="text-xl text-center text-gray-600">
                Analyze drone flights, compare performance, and master aerial techniques
              </p>
            </div>

            {/* Featured Flight Analysis */}
            <div className="max-w-7xl mx-auto px-4 mb-12">
              <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-3xl p-8 shadow-xl">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Video Player Section */}
                  <div>
                    <div className="aspect-video bg-black rounded-2xl relative overflow-hidden mb-4">
                      {/* Video Placeholder */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-20 h-20 text-white/50" />
                      </div>
                      
                      {/* Flight Stats Overlay */}
                      <div className="absolute top-4 left-4 space-y-2">
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-orange-400" />
                          <span className="text-orange-400 font-mono text-sm">Speed: 45.2 km/h</span>
                        </div>
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-mono text-sm">Alt: 125m</span>
                        </div>
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                          <Wind className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 font-mono text-sm">Distance: 2.3km</span>
                        </div>
                      </div>
                      
                      {/* Time Indicator */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex items-center justify-between text-white text-sm mb-2">
                            <span>00:45</span>
                            <span>03:20</span>
                          </div>
                          <div className="bg-gray-600 rounded-full h-2 relative">
                            <div className="bg-orange-500 h-2 rounded-full" style={{width: '23%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Playback Controls */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <button className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <RotateCw className="w-5 h-5" />
                      </button>
                      <button className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all">
                        <Play className="w-6 h-6" />
                      </button>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                        <span className="text-sm font-medium">Speed:</span>
                        <select className="bg-transparent font-mono text-sm">
                          <option>0.25x</option>
                          <option>0.5x</option>
                          <option selected>1x</option>
                          <option>2x</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div>
                      <h2 className="text-2xl font-bold mb-2">FPV Racing Practice - Mountain Course</h2>
                      <p className="text-gray-600 mb-4">
                        High-speed FPV drone racing through challenging mountain terrain. 
                        Testing new propeller configuration for improved efficiency.
                      </p>
                      <div className="flex items-center gap-4">
                        <img 
                          src="https://ui-avatars.com/api/?name=Mike+Wilson&background=FF6B6B" 
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-semibold">Mike Wilson</p>
                          <p className="text-sm text-gray-500">2 days ago • DJI FPV</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Analytics Section */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">Flight Analytics</h3>
                    
                    {/* Charts */}
                    <div className="space-y-6">
                      {/* Altitude Chart */}
                      <div className="bg-white rounded-xl p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          Altitude Over Time
                        </h4>
                        <ResponsiveContainer width="100%" height={150}>
                          <AreaChart data={[
                            { time: 0, altitude: 0 },
                            { time: 30, altitude: 50 },
                            { time: 60, altitude: 125 },
                            { time: 90, altitude: 110 },
                            { time: 120, altitude: 140 },
                            { time: 150, altitude: 125 },
                            { time: 180, altitude: 80 },
                            { time: 200, altitude: 20 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="time" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip />
                            <Area type="monotone" dataKey="altitude" stroke="#10b981" fill="#10b98133" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Speed Chart */}
                      <div className="bg-white rounded-xl p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Gauge className="w-5 h-5 text-orange-500" />
                          Speed Analysis
                        </h4>
                        <ResponsiveContainer width="100%" height={150}>
                          <LineChart data={[
                            { time: 0, speed: 0 },
                            { time: 30, speed: 25 },
                            { time: 60, speed: 45 },
                            { time: 90, speed: 38 },
                            { time: 120, speed: 52 },
                            { time: 150, speed: 45 },
                            { time: 180, speed: 30 },
                            { time: 200, speed: 10 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="time" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip />
                            <Line type="monotone" dataKey="speed" stroke="#f97316" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Flight Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-white rounded-xl p-4 text-center">
                        <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">3.2km</p>
                        <p className="text-sm text-gray-500">Total Distance</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">3:20</p>
                        <p className="text-sm text-gray-500">Flight Time</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <Gauge className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">52km/h</p>
                        <p className="text-sm text-gray-500">Max Speed</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <Battery className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">78%</p>
                        <p className="text-sm text-gray-500">Battery Used</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            {user && (
              <div className="max-w-7xl mx-auto px-4 mb-12">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
                  <Upload className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Upload Your Flight Video</h3>
                  <p className="mb-6 opacity-90">Share your flights and get detailed analytics</p>
                  <button className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Upload Flight Video
                  </button>
                </div>
              </div>
            )}

            {/* Video Comparison Tool */}
            <div className="max-w-7xl mx-auto px-4 mb-12">
              <h3 className="text-2xl font-bold mb-6">Compare Flights</h3>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Flight A */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="aspect-video bg-gray-100 rounded-xl mb-4 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Racing Drone MK3</h4>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <p className="font-bold text-lg">48km/h</p>
                      <p className="text-gray-500">Avg Speed</p>
                    </div>
                    <div>
                      <p className="font-bold text-lg">2:45</p>
                      <p className="text-gray-500">Duration</p>
                    </div>
                    <div>
                      <p className="font-bold text-lg">95m</p>
                      <p className="text-gray-500">Max Alt</p>
                    </div>
                  </div>
                </div>
                
                {/* Flight B */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="aspect-video bg-gray-100 rounded-xl mb-4 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Custom Build v2</h4>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <p className="font-bold text-lg">52km/h</p>
                      <p className="text-gray-500">Avg Speed</p>
                    </div>
                    <div>
                      <p className="font-bold text-lg">3:10</p>
                      <p className="text-gray-500">Duration</p>
                    </div>
                    <div>
                      <p className="font-bold text-lg">120m</p>
                      <p className="text-gray-500">Max Alt</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-6">
                <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Start Comparison
                </button>
              </div>
            </div>

            {/* Recent Flights Grid */}
            <div className="max-w-7xl mx-auto px-4">
              <h3 className="text-2xl font-bold mb-6">Recent Flight Videos</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="aspect-video bg-gray-200 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-12 h-12 text-gray-500" />
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {Math.floor(Math.random() * 10 + 1)}:
                        {Math.floor(Math.random() * 59).toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold mb-2">Flight Video {i + 1}</h4>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {Math.floor(Math.random() * 1000)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {Math.floor(Math.random() * 100)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {Math.floor(Math.random() * 50)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Circuit Playground */}
        {activeSection === 'circuits' && <CircuitPlayground />}

        {/* Interactive Kite Solution */}

        {activeSection === 'kites' && <KiteDesignStudio />}
        
        

        {/* Community */}
        {activeSection === 'community' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Community Hub
              </h2>
              <p className="text-gray-400 text-lg">Connect, collaborate, and learn together</p>
            </div>

            {/* Live Workshop Feed */}
            <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-2xl p-8 border border-green-500/30 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-6 text-green-400 flex items-center gap-2">
                <Signal className="w-6 h-6" />
                Live Now: Advanced Drone Assembly
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="aspect-video bg-black rounded-xl mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-gray-400">247 watching</span>
                      </div>
                      <span className="text-gray-500">Started 15 min ago</span>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300">
                      Join Workshop
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-cyan-400">Upcoming Sessions</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="font-medium text-sm">PCB Design Basics</p>
                      <p className="text-xs text-gray-400">Tomorrow, 3:00 PM</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="font-medium text-sm">3D Printing Workshop</p>
                      <p className="text-xs text-gray-400">Friday, 4:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Collaboration Board */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">Team Projects</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Solar Drone Project</h4>
                      <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded">3/5 Members</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">Building an autonomous solar-powered drone</p>
                    <button className="text-sm text-cyan-400 hover:text-cyan-300">Join Team →</button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold mb-4 text-green-400">Mentorship Matching</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <img src="https://via.placeholder.com/40" alt="Mentor" className="w-10 h-10 rounded-full border border-green-400" />
                      <div>
                        <h4 className="font-medium">Dr. Sarah Martinez</h4>
                        <p className="text-xs text-gray-400">Aerospace Engineering</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">15+ years experience in drone technology</p>
                    <button className="text-sm text-green-400 hover:text-green-300">Request Mentorship →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        


        

        




      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 border-t border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-4">3D PRINT AND DRONES</h3>
              <p className="text-gray-400 text-sm">Empowering the next generation of innovators</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-cyan-400">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Programs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-400">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Forum</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-orange-400">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 20}s`,
                  animationDuration: `${20 + Math.random() * 20}s`
                }}
              />
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>&copy; 2025 3D PRINT AND DRONES. All rights reserved. Built with 💚 for future innovators.</p>
          </div>
        </div>
      </footer>

      {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowLoginModal(false)}
            />
            
            <div className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleLogin(formData.get('email'), formData.get('password'));
              }}>
                <div className="space-y-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    required
                    disabled={loading}
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    required
                    disabled={loading}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
              
              <p className="mt-4 text-center text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                    setError('');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        )}

        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop - clicking this will close the modal */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowRegisterModal(false)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Close button - now more visible */}
              <button
                onClick={() => setShowRegisterModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Join the Makers
              </h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleRegister({
                  name: formData.get('name'),
                  username: formData.get('username'),
                  email: formData.get('email'),
                  password: formData.get('password'),
                  password_confirmation: formData.get('password_confirmation')
                });
              }}>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                    required
                  />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                    required
                  />
                  <input
                    type="password"
                    name="password_confirmation"
                    placeholder="Confirm Password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-orange-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Create Account
                </button>
              </form>
              
              <p className="mt-4 text-center text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                  }}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        )}


        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
            
            <div className="relative bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Upload 3D Model</h2>
              
              {/* Upload form */}
              <form>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Model File (STL, OBJ)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Drag and drop your 3D model here</p>
                    <p className="text-sm text-gray-500">or</p>
                    <button type="button" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
                      Browse Files
                    </button>
                  </div>
                </div>
                
                {/* More form fields... */}
              </form>
            </div>
          </div>
        )}









    </div>
  );
}