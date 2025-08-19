import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Wind,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Trophy,
  RotateCw,
  Play,
  Award,
  HelpCircle,
  Volume2,
  VolumeX,
  Star,
  Sparkles,
  Hand,
  Move,
  X,
  Info,
  Zap,
  CloudRain,
  Sun,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const KiteBuilderWorkshop = () => {
  const canvasRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [placedParts, setPlacedParts] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [snapZones, setSnapZones] = useState([]);
  const [score, setScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [selectedKiteType, setSelectedKiteType] = useState('diamond');
  const [showKiteSelection, setShowKiteSelection] = useState(true);
  const [showFlyingMode, setShowFlyingMode] = useState(false);
  const [kitePosition, setKitePosition] = useState({ x: 300, y: 400 });
  const [windStrength, setWindStrength] = useState(15);
  const [flyingScore, setFlyingScore] = useState(0);
  
  // New states for enhanced flying
  const [kiteRotation, setKiteRotation] = useState(0);
  const [kiteString, setKiteString] = useState({ length: 100, tension: 0.5 });
  const [weather, setWeather] = useState('sunny'); // sunny, cloudy, rainy
  const [tricks, setTricks] = useState([]);
  const [altitude, setAltitude] = useState(50);
  const [controlMode, setControlMode] = useState('mouse'); // mouse or keyboard

  // Different kite types - expanded selection
  const kiteTypes = {
    diamond: {
      name: 'Diamond Kite',
      difficulty: 'Beginner',
      description: 'The classic and easiest kite to build and fly',
      parts: ['spineStick', 'crossStick', 'fabric', 'bowString', 'string', 'tail'],
      color: '#FF6B6B',
      flyingDifficulty: 1,
      stability: 0.8,
      windRange: { min: 5, max: 25 }
    },
    delta: {
      name: 'Delta Kite',
      difficulty: 'Intermediate',
      description: 'Triangle shaped, very stable in flight',
      parts: ['spineStick', 'spreadStick1', 'spreadStick2', 'deltaFabric', 'string', 'keel'],
      color: '#3B82F6',
      flyingDifficulty: 0.8,
      stability: 0.9,
      windRange: { min: 3, max: 30 }
    },
    box: {
      name: 'Box Kite',
      difficulty: 'Advanced',
      description: 'Complex 3D structure, flies in light winds',
      parts: ['stick1', 'stick2', 'stick3', 'stick4', 'boxFabric1', 'boxFabric2', 'connector', 'string'],
      color: '#8B5CF6',
      flyingDifficulty: 1.5,
      stability: 0.7,
      windRange: { min: 2, max: 20 }
    },
    sled: {
      name: 'Sled Kite',
      difficulty: 'Beginner',
      description: 'No sticks needed! Inflates with wind',
      parts: ['sledFabric', 'reinforcement1', 'reinforcement2', 'string', 'vent1', 'vent2'],
      color: '#10B981',
      flyingDifficulty: 0.7,
      stability: 0.85,
      windRange: { min: 8, max: 35 }
    },
    dragon: {
      name: 'Dragon Kite',
      difficulty: 'Expert',
      description: 'Long colorful kite with a dramatic tail',
      parts: ['dragonHead', 'bodySection1', 'bodySection2', 'bodySection3', 'spineRod', 'string', 'longTail'],
      color: '#F59E0B',
      flyingDifficulty: 2,
      stability: 0.6,
      windRange: { min: 10, max: 30 }
    },
    bird: {
      name: 'Bird Kite',
      difficulty: 'Intermediate',
      description: 'Realistic bird shape that soars beautifully',
      parts: ['wingFrame1', 'wingFrame2', 'bodyFrame', 'wingFabric', 'tailFeathers', 'string'],
      color: '#6366F1',
      flyingDifficulty: 1.2,
      stability: 0.75,
      windRange: { min: 5, max: 25 }
    },
    stunt: {
      name: 'Stunt Kite',
      difficulty: 'Expert',
      description: 'Dual-line kite for tricks and aerobatics',
      parts: ['spineRod', 'topSpreader', 'bottomSpreader', 'stuntFabric', 'leftString', 'rightString', 'bridle'],
      color: '#EC4899',
      flyingDifficulty: 2.5,
      stability: 0.5,
      windRange: { min: 8, max: 30 }
    },
    parafoil: {
      name: 'Parafoil Kite',
      difficulty: 'Advanced',
      description: 'Soft kite with no rigid frame, great lift',
      parts: ['topFabric', 'bottomFabric', 'cell1', 'cell2', 'cell3', 'bridle', 'string'],
      color: '#14B8A6',
      flyingDifficulty: 1.8,
      stability: 0.8,
      windRange: { min: 5, max: 40 }
    }
  };

  // Complete parts inventory with all kite types
  const getKiteParts = () => {
    const baseColors = {
      diamond: '#FF6B6B',
      delta: '#3B82F6',
      box: '#8B5CF6',
      sled: '#10B981',
      dragon: '#F59E0B',
      bird: '#6366F1',
      stunt: '#EC4899',
      parafoil: '#14B8A6'
    };
    
    const kiteColor = baseColors[selectedKiteType] || '#FF6B6B';
    
    // Define parts for each kite type
    const partsByType = {
      diamond: {
        crossStick: {
          id: 'crossStick',
          name: 'Cross Stick',
          width: 200,
          height: 10,
          color: '#8B4513',
          shape: 'rectangle',
          instruction: 'This is the horizontal support'
        },
        spineStick: {
          id: 'spineStick',
          name: 'Spine Stick',
          width: 10,
          height: 250,
          color: '#8B4513',
          shape: 'rectangle',
          instruction: 'This is the vertical support'
        },
        fabric: {
          id: 'fabric',
          name: 'Kite Fabric',
          width: 180,
          height: 220,
          color: kiteColor,
          shape: 'diamond',
          instruction: 'The sail that catches the wind'
        },
        string: {
          id: 'string',
          name: 'Flying String',
          width: 100,
          height: 3,
          color: '#4B5563',
          shape: 'line',
          instruction: 'Connect this to fly your kite'
        },
        tail: {
          id: 'tail',
          name: 'Kite Tail',
          width: 20,
          height: 150,
          color: '#F59E0B',
          shape: 'ribbon',
          instruction: 'Helps stabilize the kite'
        },
        bowString: {
          id: 'bowString',
          name: 'Bow String',
          width: 150,
          height: 3,
          color: '#6B7280',
          shape: 'curve',
          instruction: 'Creates the bow shape'
        }
      },
      delta: {
        spineStick: {
          id: 'spineStick',
          name: 'Center Spine',
          width: 10,
          height: 300,
          color: '#8B4513',
          shape: 'rectangle',
          instruction: 'Main support beam'
        },
        spreadStick1: {
          id: 'spreadStick1',
          name: 'Left Spreader',
          width: 150,
          height: 10,
          color: '#8B4513',
          shape: 'rectangle',
          instruction: 'Left wing support'
        },
        spreadStick2: {
          id: 'spreadStick2',
          name: 'Right Spreader',
          width: 150,
          height: 10,
          color: '#8B4513',
          shape: 'rectangle',
          instruction: 'Right wing support'
        },
        deltaFabric: {
          id: 'deltaFabric',
          name: 'Delta Sail',
          width: 200,
          height: 180,
          color: kiteColor,
          shape: 'triangle',
          instruction: 'Triangle shaped sail'
        },
        string: {
          id: 'string',
          name: 'Flying Line',
          width: 100,
          height: 3,
          color: '#4B5563',
          shape: 'line',
          instruction: 'Your control line'
        },
        keel: {
          id: 'keel',
          name: 'Keel',
          width: 60,
          height: 80,
          color: '#6B7280',
          shape: 'triangle',
          instruction: 'Stabilizes the kite'
        }
      },
      sled: {
        sledFabric: {
          id: 'sledFabric',
          name: 'Sled Body',
          width: 160,
          height: 200,
          color: kiteColor,
          shape: 'rectangle',
          instruction: 'Main body - no sticks needed!'
        },
        reinforcement1: {
          id: 'reinforcement1',
          name: 'Left Edge Tape',
          width: 10,
          height: 200,
          color: '#374151',
          shape: 'rectangle',
          instruction: 'Strengthens the edge'
        },
        reinforcement2: {
          id: 'reinforcement2',
          name: 'Right Edge Tape',
          width: 10,
          height: 200,
          color: '#374151',
          shape: 'rectangle',
          instruction: 'Strengthens the edge'
        },
        string: {
          id: 'string',
          name: 'Flying String',
          width: 100,
          height: 3,
          color: '#4B5563',
          shape: 'line',
          instruction: 'Connect to fly'
        },
        vent1: {
          id: 'vent1',
          name: 'Air Vent 1',
          width: 40,
          height: 40,
          color: '#E5E7EB',
          shape: 'circle',
          instruction: 'Lets air flow through'
        },
        vent2: {
          id: 'vent2',
          name: 'Air Vent 2',
          width: 40,
          height: 40,
          color: '#E5E7EB',
          shape: 'circle',
          instruction: 'Lets air flow through'
        }
      },
      box: {
        stick1: {
          id: 'stick1',
          name: 'Vertical Stick 1',
          width: 10,
          height: 200,
          color: '#8B4513',
          shape: 'rectangle',
          instruction: 'First vertical support'
        },
        stick2: {
          id: 'stick2',
          name: 'Vertical Stick 2',
          width: 10,
          height: 200,
          color: '#8B4513',
          shape: 'rectangle',
          instruction: 'Second vertical support'
        },
        stick3: {
          id: 'stick3',
          name: 'Vertical Stick 3',
          width: 10,
          height: 200,
          color: '#8B4513',
          shape: 'rectangle',
          instruction: 'Third vertical support'
        },
        stick4: {
          id: 'stick4',
          name: 'Vertical Stick 4',
          width: 10,
          height: 200,
          color: '#8B4513',
          shape: 'rectangle',
          instruction: 'Fourth vertical support'
        },
        boxFabric1: {
          id: 'boxFabric1',
          name: 'Top Box Section',
          width: 150,
          height: 80,
          color: kiteColor,
          shape: 'rectangle',
          instruction: 'Upper box covering'
        },
        boxFabric2: {
          id: 'boxFabric2',
          name: 'Bottom Box Section',
          width: 150,
          height: 80,
          color: kiteColor,
          shape: 'rectangle',
          instruction: 'Lower box covering'
        },
        connector: {
          id: 'connector',
          name: 'Cross Connectors',
          width: 120,
          height: 5,
          color: '#6B7280',
          shape: 'rectangle',
          instruction: 'Connects the vertical sticks'
        },
        string: {
          id: 'string',
          name: 'Flying String',
          width: 100,
          height: 3,
          color: '#4B5563',
          shape: 'line',
          instruction: 'Attach to fly'
        }
      },
      dragon: {
        dragonHead: {
          id: 'dragonHead',
          name: 'Dragon Head',
          width: 80,
          height: 80,
          color: kiteColor,
          shape: 'circle',
          instruction: 'The fierce dragon head'
        },
        bodySection1: {
          id: 'bodySection1',
          name: 'Body Section 1',
          width: 70,
          height: 70,
          color: kiteColor,
          shape: 'circle',
          instruction: 'First body segment'
        },
        bodySection2: {
          id: 'bodySection2',
          name: 'Body Section 2',
          width: 60,
          height: 60,
          color: kiteColor,
          shape: 'circle',
          instruction: 'Second body segment'
        },
        bodySection3: {
          id: 'bodySection3',
          name: 'Body Section 3',
          width: 50,
          height: 50,
          color: kiteColor,
          shape: 'circle',
          instruction: 'Third body segment'
        },
        spineRod: {
          id: 'spineRod',
          name: 'Flexible Spine',
          width: 5,
          height: 300,
          color: '#8B4513',
          shape: 'rectangle',
          instruction: 'Connects all sections'
        },
        string: {
          id: 'string',
          name: 'Flying String',
          width: 100,
          height: 3,
          color: '#4B5563',
          shape: 'line',
          instruction: 'Control line'
        },
        longTail: {
          id: 'longTail',
          name: 'Dragon Tail',
          width: 30,
          height: 200,
          color: '#DC2626',
          shape: 'ribbon',
          instruction: 'Dramatic flowing tail'
        }
      },
      bird: {
        wingFrame1: {
          id: 'wingFrame1',
          name: 'Left Wing Frame',
          width: 120,
          height: 10,
          color: '#8B4513',
          shape: 'rectangle',
          instruction: 'Left wing structure'
        },
        wingFrame2: {
          id: 'wingFrame2',
          name: 'Right Wing Frame',
          width: 120,
          height: 10,
          color: '#8B4513',
          shape: 'rectangle',
          instruction: 'Right wing structure'
        },
        bodyFrame: {
          id: 'bodyFrame',
          name: 'Body Frame',
          width: 10,
          height: 150,
          color: '#8B4513',
          shape: 'rectangle',
          instruction: 'Central body support'
        },
        wingFabric: {
          id: 'wingFabric',
          name: 'Wing Fabric',
          width: 200,
          height: 120,
          color: kiteColor,
          shape: 'bird',
          instruction: 'Wing covering'
        },
        tailFeathers: {
          id: 'tailFeathers',
          name: 'Tail Feathers',
          width: 60,
          height: 80,
          color: '#9333EA',
          shape: 'triangle',
          instruction: 'Decorative tail'
        },
        string: {
          id: 'string',
          name: 'Flying String',
          width: 100,
          height: 3,
          color: '#4B5563',
          shape: 'line',
          instruction: 'Control line'
        }
      },
      stunt: {
        spineRod: {
          id: 'spineRod',
          name: 'Center Spine',
          width: 8,
          height: 250,
          color: '#1F2937',
          shape: 'rectangle',
          instruction: 'Strong central spine'
        },
        topSpreader: {
          id: 'topSpreader',
          name: 'Top Spreader',
          width: 180,
          height: 8,
          color: '#1F2937',
          shape: 'rectangle',
          instruction: 'Upper wing spreader'
        },
        bottomSpreader: {
          id: 'bottomSpreader',
          name: 'Bottom Spreader',
          width: 140,
          height: 8,
          color: '#1F2937',
          shape: 'rectangle',
          instruction: 'Lower wing spreader'
        },
        stuntFabric: {
          id: 'stuntFabric',
          name: 'Stunt Sail',
          width: 180,
          height: 200,
          color: kiteColor,
          shape: 'delta',
          instruction: 'High-performance fabric'
        },
        leftString: {
          id: 'leftString',
          name: 'Left Control Line',
          width: 80,
          height: 3,
          color: '#DC2626',
          shape: 'line',
          instruction: 'Left hand control'
        },
        rightString: {
          id: 'rightString',
          name: 'Right Control Line',
          width: 80,
          height: 3,
          color: '#2563EB',
          shape: 'line',
          instruction: 'Right hand control'
        },
        bridle: {
          id: 'bridle',
          name: 'Bridle System',
          width: 60,
          height: 40,
          color: '#6B7280',
          shape: 'triangle',
          instruction: 'Connects strings to kite'
        }
      },
      parafoil: {
        topFabric: {
          id: 'topFabric',
          name: 'Top Surface',
          width: 200,
          height: 100,
          color: kiteColor,
          shape: 'rectangle',
          instruction: 'Upper airfoil surface'
        },
        bottomFabric: {
          id: 'bottomFabric',
          name: 'Bottom Surface',
          width: 200,
          height: 100,
          color: '#1F2937',
          shape: 'rectangle',
          instruction: 'Lower airfoil surface'
        },
        cell1: {
          id: 'cell1',
          name: 'Air Cell 1',
          width: 60,
          height: 80,
          color: '#9CA3AF',
          shape: 'rectangle',
          instruction: 'First inflation cell'
        },
        cell2: {
          id: 'cell2',
          name: 'Air Cell 2',
          width: 60,
          height: 80,
          color: '#9CA3AF',
          shape: 'rectangle',
          instruction: 'Middle inflation cell'
        },
        cell3: {
          id: 'cell3',
          name: 'Air Cell 3',
          width: 60,
          height: 80,
          color: '#9CA3AF',
          shape: 'rectangle',
          instruction: 'Last inflation cell'
        },
        bridle: {
          id: 'bridle',
          name: 'Bridle Lines',
          width: 120,
          height: 60,
          color: '#4B5563',
          shape: 'lines',
          instruction: 'Complex bridle system'
        },
        string: {
          id: 'string',
          name: 'Flying Lines',
          width: 100,
          height: 3,
          color: '#4B5563',
          shape: 'line',
          instruction: 'Control lines'
        }
      }
    };
    
    // Return parts for selected kite type, or diamond as default
    return partsByType[selectedKiteType] || partsByType.diamond;
  };

  const kiteParts = getKiteParts();

  // Assembly steps - dynamic based on kite type
  const getAssemblySteps = () => {
    const stepsByType = {
      diamond: [
        {
          title: "Welcome to Kite Building!",
          instruction: "Today we'll build a diamond kite step by step. Click Next to begin!",
          requiredParts: [],
          snapZones: [],
          hint: "Get ready to learn how kites fly!",
          canSkip: true
        },
        {
          title: "Step 1: Place the Spine",
          instruction: "Drag the vertical spine stick to the center of the work area",
          requiredParts: ['spineStick'],
          snapZones: [{ x: 300, y: 200, width: 20, height: 250, partId: 'spineStick' }],
          hint: "The spine is the backbone of your kite!"
        },
        {
          title: "Step 2: Add the Cross Stick",
          instruction: "Drag the horizontal cross stick and place it across the spine",
          requiredParts: ['crossStick'],
          snapZones: [{ x: 205, y: 270, width: 200, height: 20, partId: 'crossStick' }],
          hint: "The cross stick should be perpendicular to the spine"
        },
        {
          title: "Step 3: Attach the Fabric",
          instruction: "Place the colorful fabric over the frame you've built",
          requiredParts: ['fabric'],
          snapZones: [{ x: 215, y: 185, width: 180, height: 220, partId: 'fabric' }],
          hint: "The fabric is what catches the wind!"
        },
        {
          title: "Step 4: Add the Bow String",
          instruction: "Attach the bow string to create a slight curve",
          requiredParts: ['bowString'],
          snapZones: [{ x: 230, y: 270, width: 150, height: 20, partId: 'bowString' }],
          hint: "The bow helps the kite catch wind better"
        },
        {
          title: "Step 5: Attach Flying String",
          instruction: "Connect the flying string to the center point",
          requiredParts: ['string'],
          snapZones: [{ x: 255, y: 280, width: 100, height: 20, partId: 'string' }],
          hint: "This is what you'll hold to fly the kite"
        },
        {
          title: "Step 6: Add the Tail",
          instruction: "Finally, attach the tail at the bottom for stability",
          requiredParts: ['tail'],
          snapZones: [{ x: 295, y: 400, width: 30, height: 150, partId: 'tail' }],
          hint: "The tail keeps your kite flying steady!"
        },
        {
          title: "Congratulations!",
          instruction: "You've built a complete diamond kite! Click the fly button to test it!",
          requiredParts: [],
          snapZones: [],
          hint: "Great job! You're now a kite builder!"
        }
      ],
      delta: [
        {
          title: "Welcome to Delta Kite Building!",
          instruction: "Let's build a triangular delta kite. Click Next to begin!",
          requiredParts: [],
          snapZones: [],
          hint: "Delta kites are very stable flyers!",
          canSkip: true
        },
        {
          title: "Step 1: Place the Spine",
          instruction: "Start with the center spine stick",
          requiredParts: ['spineStick'],
          snapZones: [{ x: 300, y: 150, width: 20, height: 300, partId: 'spineStick' }],
          hint: "This will be the center of your triangle"
        },
        {
          title: "Step 2: Add Left Spreader",
          instruction: "Attach the left wing spreader",
          requiredParts: ['spreadStick1'],
          snapZones: [{ x: 150, y: 250, width: 150, height: 20, partId: 'spreadStick1' }],
          hint: "This creates the left side of the triangle"
        },
        {
          title: "Step 3: Add Right Spreader",
          instruction: "Attach the right wing spreader",
          requiredParts: ['spreadStick2'],
          snapZones: [{ x: 300, y: 250, width: 150, height: 20, partId: 'spreadStick2' }],
          hint: "This completes the triangle frame"
        },
        {
          title: "Step 4: Attach the Sail",
          instruction: "Place the triangular fabric over the frame",
          requiredParts: ['deltaFabric'],
          snapZones: [{ x: 205, y: 150, width: 200, height: 180, partId: 'deltaFabric' }],
          hint: "The triangle shape is great for stability"
        },
        {
          title: "Step 5: Add the Keel",
          instruction: "Attach the keel for extra stability",
          requiredParts: ['keel'],
          snapZones: [{ x: 275, y: 300, width: 60, height: 80, partId: 'keel' }],
          hint: "The keel helps the kite fly straight"
        },
        {
          title: "Step 6: Attach Flying String",
          instruction: "Connect the flying string to the keel",
          requiredParts: ['string'],
          snapZones: [{ x: 255, y: 350, width: 100, height: 20, partId: 'string' }],
          hint: "You're ready to fly!"
        },
        {
          title: "Delta Kite Complete!",
          instruction: "Your delta kite is ready to soar! Click fly to test it!",
          requiredParts: [],
          snapZones: [],
          hint: "Delta kites fly great in light winds!"
        }
      ],
      sled: [
        {
          title: "Welcome to Sled Kite Building!",
          instruction: "Sled kites are unique - they need no sticks! Click Next to begin!",
          requiredParts: [],
          snapZones: [],
          hint: "These kites inflate with wind!",
          canSkip: true
        },
        {
          title: "Step 1: Lay Out the Body",
          instruction: "Place the main sled fabric in the center",
          requiredParts: ['sledFabric'],
          snapZones: [{ x: 220, y: 200, width: 160, height: 200, partId: 'sledFabric' }],
          hint: "This will inflate like a parachute"
        },
        {
          title: "Step 2: Add Left Reinforcement",
          instruction: "Add tape to strengthen the left edge",
          requiredParts: ['reinforcement1'],
          snapZones: [{ x: 215, y: 200, width: 10, height: 200, partId: 'reinforcement1' }],
          hint: "This keeps the edges strong"
        },
        {
          title: "Step 3: Add Right Reinforcement",
          instruction: "Add tape to strengthen the right edge",
          requiredParts: ['reinforcement2'],
          snapZones: [{ x: 375, y: 200, width: 10, height: 200, partId: 'reinforcement2' }],
          hint: "Both edges need reinforcement"
        },
        {
          title: "Step 4: Create Air Vent 1",
          instruction: "Add the first air vent for stability",
          requiredParts: ['vent1'],
          snapZones: [{ x: 260, y: 250, width: 40, height: 40, partId: 'vent1' }],
          hint: "Vents let air flow through"
        },
        {
          title: "Step 5: Create Air Vent 2",
          instruction: "Add the second air vent",
          requiredParts: ['vent2'],
          snapZones: [{ x: 300, y: 250, width: 40, height: 40, partId: 'vent2' }],
          hint: "Two vents keep it balanced"
        },
        {
          title: "Step 6: Attach Flying String",
          instruction: "Connect the flying string to the top",
          requiredParts: ['string'],
          snapZones: [{ x: 255, y: 200, width: 100, height: 20, partId: 'string' }],
          hint: "No frame needed - just fabric!"
        },
        {
          title: "Sled Kite Complete!",
          instruction: "Your frameless sled kite is ready! It will inflate when flying!",
          requiredParts: [],
          snapZones: [],
          hint: "Watch it puff up in the wind!"
        }
      ],
      box: [
        {
          title: "Welcome to Box Kite Building!",
          instruction: "Box kites are 3D structures that fly in light winds. Let's begin!",
          requiredParts: [],
          snapZones: [],
          hint: "Box kites were used in early weather experiments!",
          canSkip: true
        },
        {
          title: "Step 1: Place First Vertical Stick",
          instruction: "Start with the first vertical support",
          requiredParts: ['stick1'],
          snapZones: [{ x: 200, y: 200, width: 10, height: 200, partId: 'stick1' }],
          hint: "This forms one corner of the box"
        },
        {
          title: "Step 2: Add Second Vertical",
          instruction: "Place the second vertical stick",
          requiredParts: ['stick2'],
          snapZones: [{ x: 300, y: 200, width: 10, height: 200, partId: 'stick2' }],
          hint: "Keep it parallel to the first"
        },
        {
          title: "Step 3: Add Third Vertical",
          instruction: "Place the third vertical stick",
          requiredParts: ['stick3'],
          snapZones: [{ x: 400, y: 200, width: 10, height: 200, partId: 'stick3' }],
          hint: "Three corners done!"
        },
        {
          title: "Step 4: Complete the Frame",
          instruction: "Add the fourth vertical stick",
          requiredParts: ['stick4'],
          snapZones: [{ x: 300, y: 300, width: 10, height: 200, partId: 'stick4' }],
          hint: "The frame is taking shape!"
        },
        {
          title: "Step 5: Add Top Box Section",
          instruction: "Attach the top fabric section",
          requiredParts: ['boxFabric1'],
          snapZones: [{ x: 225, y: 200, width: 150, height: 80, partId: 'boxFabric1' }],
          hint: "This creates the upper box"
        },
        {
          title: "Step 6: Add Bottom Box Section",
          instruction: "Attach the bottom fabric section",
          requiredParts: ['boxFabric2'],
          snapZones: [{ x: 225, y: 320, width: 150, height: 80, partId: 'boxFabric2' }],
          hint: "Two boxes for stability"
        },
        {
          title: "Step 7: Add Connectors",
          instruction: "Connect the frame with cross pieces",
          requiredParts: ['connector'],
          snapZones: [{ x: 240, y: 290, width: 120, height: 5, partId: 'connector' }],
          hint: "This holds everything together"
        },
        {
          title: "Step 8: Attach String",
          instruction: "Add the flying string to the center",
          requiredParts: ['string'],
          snapZones: [{ x: 250, y: 300, width: 100, height: 20, partId: 'string' }],
          hint: "Ready for flight!"
        },
        {
          title: "Box Kite Complete!",
          instruction: "Your box kite is ready! It flies great in light winds!",
          requiredParts: [],
          snapZones: [],
          hint: "Box kites are very stable flyers!"
        }
      ],
      dragon: [
        {
          title: "Dragon Kite Adventure!",
          instruction: "Let's build a majestic dragon kite! Click Next to begin!",
          requiredParts: [],
          snapZones: [],
          hint: "Dragon kites are spectacular in the sky!",
          canSkip: true
        },
        {
          title: "Step 1: Place the Spine",
          instruction: "Start with the flexible spine rod",
          requiredParts: ['spineRod'],
          snapZones: [{ x: 300, y: 150, width: 5, height: 300, partId: 'spineRod' }],
          hint: "This connects all dragon sections"
        },
        {
          title: "Step 2: Attach Dragon Head",
          instruction: "Place the fierce dragon head at the top",
          requiredParts: ['dragonHead'],
          snapZones: [{ x: 260, y: 140, width: 80, height: 80, partId: 'dragonHead' }],
          hint: "The head leads the way!"
        },
        {
          title: "Step 3: Add First Body Section",
          instruction: "Attach the first body segment",
          requiredParts: ['bodySection1'],
          snapZones: [{ x: 265, y: 230, width: 70, height: 70, partId: 'bodySection1' }],
          hint: "Building the dragon's body"
        },
        {
          title: "Step 4: Add Second Body Section",
          instruction: "Continue with the second segment",
          requiredParts: ['bodySection2'],
          snapZones: [{ x: 270, y: 310, width: 60, height: 60, partId: 'bodySection2' }],
          hint: "The dragon grows longer!"
        },
        {
          title: "Step 5: Add Third Body Section",
          instruction: "Place the final body segment",
          requiredParts: ['bodySection3'],
          snapZones: [{ x: 275, y: 380, width: 50, height: 50, partId: 'bodySection3' }],
          hint: "Almost complete!"
        },
        {
          title: "Step 6: Attach the String",
          instruction: "Connect the flying string to the head",
          requiredParts: ['string'],
          snapZones: [{ x: 250, y: 160, width: 100, height: 20, partId: 'string' }],
          hint: "Control your dragon from here"
        },
        {
          title: "Step 7: Add the Flowing Tail",
          instruction: "Finally, add the dramatic dragon tail",
          requiredParts: ['longTail'],
          snapZones: [{ x: 285, y: 440, width: 30, height: 200, partId: 'longTail' }],
          hint: "The tail adds drama and stability!"
        },
        {
          title: "Dragon Kite Complete!",
          instruction: "Your dragon is ready to soar! Watch it dance in the wind!",
          requiredParts: [],
          snapZones: [],
          hint: "Dragons look amazing in flight!"
        }
      ],
      bird: [
        {
          title: "Bird Kite Workshop!",
          instruction: "Let's create a beautiful bird kite! Click Next to begin!",
          requiredParts: [],
          snapZones: [],
          hint: "Bird kites soar gracefully!",
          canSkip: true
        },
        {
          title: "Step 1: Place Body Frame",
          instruction: "Start with the central body support",
          requiredParts: ['bodyFrame'],
          snapZones: [{ x: 295, y: 225, width: 10, height: 150, partId: 'bodyFrame' }],
          hint: "This is the bird's spine"
        },
        {
          title: "Step 2: Add Left Wing",
          instruction: "Attach the left wing frame",
          requiredParts: ['wingFrame1'],
          snapZones: [{ x: 180, y: 270, width: 120, height: 10, partId: 'wingFrame1' }],
          hint: "Wings give it flight!"
        },
        {
          title: "Step 3: Add Right Wing",
          instruction: "Attach the right wing frame",
          requiredParts: ['wingFrame2'],
          snapZones: [{ x: 300, y: 270, width: 120, height: 10, partId: 'wingFrame2' }],
          hint: "Both wings for balance"
        },
        {
          title: "Step 4: Cover with Wing Fabric",
          instruction: "Place the wing fabric over the frame",
          requiredParts: ['wingFabric'],
          snapZones: [{ x: 200, y: 210, width: 200, height: 120, partId: 'wingFabric' }],
          hint: "Beautiful wing covering!"
        },
        {
          title: "Step 5: Add Tail Feathers",
          instruction: "Attach decorative tail feathers",
          requiredParts: ['tailFeathers'],
          snapZones: [{ x: 270, y: 350, width: 60, height: 80, partId: 'tailFeathers' }],
          hint: "For style and stability"
        },
        {
          title: "Step 6: Connect Flying String",
          instruction: "Attach the control string",
          requiredParts: ['string'],
          snapZones: [{ x: 250, y: 270, width: 100, height: 20, partId: 'string' }],
          hint: "Ready to soar!"
        },
        {
          title: "Bird Kite Complete!",
          instruction: "Your bird kite is ready to take flight!",
          requiredParts: [],
          snapZones: [],
          hint: "Watch it soar like a real bird!"
        }
      ],
      stunt: [
        {
          title: "Stunt Kite Challenge!",
          instruction: "Build a dual-line stunt kite for tricks! This is advanced - are you ready?",
          requiredParts: [],
          snapZones: [],
          hint: "Stunt kites can do loops and dives!",
          canSkip: true
        },
        {
          title: "Step 1: Center Spine",
          instruction: "Place the strong center spine",
          requiredParts: ['spineRod'],
          snapZones: [{ x: 296, y: 175, width: 8, height: 250, partId: 'spineRod' }],
          hint: "Needs to be strong for stunts"
        },
        {
          title: "Step 2: Top Spreader",
          instruction: "Add the upper wing spreader",
          requiredParts: ['topSpreader'],
          snapZones: [{ x: 210, y: 220, width: 180, height: 8, partId: 'topSpreader' }],
          hint: "Wide wings for control"
        },
        {
          title: "Step 3: Bottom Spreader",
          instruction: "Add the lower spreader",
          requiredParts: ['bottomSpreader'],
          snapZones: [{ x: 230, y: 340, width: 140, height: 8, partId: 'bottomSpreader' }],
          hint: "Creates the delta shape"
        },
        {
          title: "Step 4: High-Performance Sail",
          instruction: "Attach the stunt fabric",
          requiredParts: ['stuntFabric'],
          snapZones: [{ x: 210, y: 175, width: 180, height: 200, partId: 'stuntFabric' }],
          hint: "Ripstop nylon for durability"
        },
        {
          title: "Step 5: Bridle System",
          instruction: "Add the complex bridle",
          requiredParts: ['bridle'],
          snapZones: [{ x: 270, y: 300, width: 60, height: 40, partId: 'bridle' }],
          hint: "Precise control point"
        },
        {
          title: "Step 6: Left Control Line",
          instruction: "Attach the left control string",
          requiredParts: ['leftString'],
          snapZones: [{ x: 230, y: 320, width: 80, height: 3, partId: 'leftString' }],
          hint: "Pull to turn left"
        },
        {
          title: "Step 7: Right Control Line",
          instruction: "Attach the right control string",
          requiredParts: ['rightString'],
          snapZones: [{ x: 290, y: 320, width: 80, height: 3, partId: 'rightString' }],
          hint: "Pull to turn right"
        },
        {
          title: "Stunt Kite Complete!",
          instruction: "Your stunt kite is ready for aerobatics! Practice makes perfect!",
          requiredParts: [],
          snapZones: [],
          hint: "Try loops, dives, and figure-8s!"
        }
      ],
      parafoil: [
        {
          title: "Parafoil Kite Engineering!",
          instruction: "Build a frameless parafoil kite - advanced soft kite technology!",
          requiredParts: [],
          snapZones: [],
          hint: "Parafoils have amazing lift!",
          canSkip: true
        },
        {
          title: "Step 1: Top Surface",
          instruction: "Lay out the top airfoil surface",
          requiredParts: ['topFabric'],
          snapZones: [{ x: 200, y: 200, width: 200, height: 100, partId: 'topFabric' }],
          hint: "Curved for lift generation"
        },
        {
          title: "Step 2: Bottom Surface",
          instruction: "Add the bottom surface",
          requiredParts: ['bottomFabric'],
          snapZones: [{ x: 200, y: 310, width: 200, height: 100, partId: 'bottomFabric' }],
          hint: "Creates the airfoil shape"
        },
        {
          title: "Step 3: First Air Cell",
          instruction: "Insert the first inflation cell",
          requiredParts: ['cell1'],
          snapZones: [{ x: 210, y: 260, width: 60, height: 80, partId: 'cell1' }],
          hint: "Cells trap air for shape"
        },
        {
          title: "Step 4: Middle Air Cell",
          instruction: "Add the center cell",
          requiredParts: ['cell2'],
          snapZones: [{ x: 270, y: 260, width: 60, height: 80, partId: 'cell2' }],
          hint: "Multiple cells for stability"
        },
        {
          title: "Step 5: Last Air Cell",
          instruction: "Insert the final cell",
          requiredParts: ['cell3'],
          snapZones: [{ x: 330, y: 260, width: 60, height: 80, partId: 'cell3' }],
          hint: "Complete airfoil structure"
        },
        {
          title: "Step 6: Bridle Lines",
          instruction: "Attach the complex bridle system",
          requiredParts: ['bridle'],
          snapZones: [{ x: 240, y: 350, width: 120, height: 60, partId: 'bridle' }],
          hint: "Many lines for perfect balance"
        },
        {
          title: "Step 7: Flying Lines",
          instruction: "Connect the main control lines",
          requiredParts: ['string'],
          snapZones: [{ x: 250, y: 380, width: 100, height: 20, partId: 'string' }],
          hint: "Strong lines for high pull"
        },
        {
          title: "Parafoil Complete!",
          instruction: "Your high-tech parafoil is ready! It generates serious lift!",
          requiredParts: [],
          snapZones: [],
          hint: "Great for strong steady winds!"
        }
      ]
    };
    
    return stepsByType[selectedKiteType] || stepsByType.diamond;
  };

  const assemblySteps = getAssemblySteps();

  useEffect(() => {
    // Set snap zones for current step
    if (currentStep < assemblySteps.length) {
      setSnapZones(assemblySteps[currentStep].snapZones || []);
    }
  }, [currentStep, assemblySteps]);

  // Handle drag start
  const handleDragStart = (e, partId) => {
    const part = kiteParts[partId];
    setDraggedItem({ ...part, id: partId });
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedItem) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if dropped in a snap zone
    const currentSnapZones = assemblySteps[currentStep].snapZones || [];
    let snapped = false;
    
    for (const zone of currentSnapZones) {
      if (zone.partId === draggedItem.id &&
          x >= zone.x - 50 && x <= zone.x + zone.width + 50 &&
          y >= zone.y - 50 && y <= zone.y + zone.height + 50) {
        
        // Snap to zone
        const newPart = {
          ...draggedItem,
          x: zone.x,
          y: zone.y,
          placed: true
        };
        
        setPlacedParts([...placedParts, newPart]);
        snapped = true;
        
        // Check if step is complete
        checkStepCompletion(draggedItem.id);
        
        // Add score
        setScore(score + 100);
        
        // Play success sound
        if (soundEnabled) {
          playSound('success');
        }
        
        break;
      }
    }
    
    if (!snapped && soundEnabled) {
      playSound('error');
    }
    
    setDraggedItem(null);
  };

  // Check if current step is completed
  const checkStepCompletion = (placedPartId) => {
    const requiredParts = assemblySteps[currentStep].requiredParts;
    const placedPartIds = [...placedParts.map(p => p.id), placedPartId];
    
    const allPartsPlaced = requiredParts.every(partId => 
      placedPartIds.includes(partId)
    );
    
    if (allPartsPlaced) {
      setCompletedSteps([...completedSteps, currentStep]);
      
      // Check if this is the last step with required parts
      const isLastBuildStep = currentStep === assemblySteps.length - 2;
      
      // Auto advance after a delay
      setTimeout(() => {
        if (currentStep < assemblySteps.length - 1) {
          setCurrentStep(currentStep + 1);
          // If we just completed the last building step, mark as complete
          if (isLastBuildStep) {
            setIsComplete(true);
            setShowCelebration(true);
          }
        }
      }, 1000);
    }
  };

  // Play sound effects (placeholder)
  const playSound = (type) => {
    // In a real app, you'd play actual sound files
    console.log(`Playing ${type} sound`);
  };

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw work area
    ctx.fillStyle = '#F3F4F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw snap zones for current step
    snapZones.forEach(zone => {
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
      ctx.setLineDash([]);
      
      // Draw label
      ctx.fillStyle = '#3B82F6';
      ctx.font = '12px sans-serif';
      ctx.fillText('Drop here', zone.x + 5, zone.y - 5);
    });
    
    // Draw placed parts
    placedParts.forEach(part => {
      ctx.save();
      ctx.fillStyle = part.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      
      if (part.shape === 'rectangle') {
        ctx.fillRect(part.x, part.y, part.width, part.height);
        ctx.strokeRect(part.x, part.y, part.width, part.height);
      } else if (part.shape === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(part.x + part.width/2, part.y);
        ctx.lineTo(part.x + part.width, part.y + part.height/2);
        ctx.lineTo(part.x + part.width/2, part.y + part.height);
        ctx.lineTo(part.x, part.y + part.height/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (part.shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(part.x + part.width/2, part.y);
        ctx.lineTo(part.x + part.width, part.y + part.height);
        ctx.lineTo(part.x, part.y + part.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (part.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(part.x + part.width/2, part.y + part.height/2, Math.min(part.width, part.height)/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (part.shape === 'line' || part.shape === 'curve') {
        ctx.strokeStyle = part.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(part.x, part.y);
        if (part.shape === 'curve') {
          ctx.quadraticCurveTo(
            part.x + part.width/2, part.y - 20,
            part.x + part.width, part.y
          );
        } else {
          ctx.lineTo(part.x + part.width, part.y);
        }
        ctx.stroke();
      } else if (part.shape === 'ribbon') {
        // Draw ribbon tail with wavy effect
        ctx.fillStyle = part.color;
        for (let i = 0; i < 5; i++) {
          const waveOffset = Math.sin(Date.now() / 200 + i) * 10;
          ctx.fillRect(
            part.x + waveOffset,
            part.y + i * 30,
            part.width,
            25
          );
          // Add pattern
          ctx.fillStyle = i % 2 === 0 ? '#FFA500' : '#FFD700';
        }
      } else if (part.shape === 'bird') {
        // Simple bird shape
        ctx.beginPath();
        ctx.moveTo(part.x + part.width/2, part.y);
        ctx.quadraticCurveTo(part.x, part.y + part.height/2, part.x + 30, part.y + part.height);
        ctx.lineTo(part.x + part.width - 30, part.y + part.height);
        ctx.quadraticCurveTo(part.x + part.width, part.y + part.height/2, part.x + part.width/2, part.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (part.shape === 'delta') {
        // Delta wing shape
        ctx.beginPath();
        ctx.moveTo(part.x + part.width/2, part.y);
        ctx.lineTo(part.x + part.width, part.y + part.height * 0.7);
        ctx.lineTo(part.x + part.width/2, part.y + part.height);
        ctx.lineTo(part.x, part.y + part.height * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (part.shape === 'lines') {
        // Multiple lines (for bridle)
        ctx.strokeStyle = part.color;
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(part.x + i * 30, part.y);
          ctx.lineTo(part.x + part.width/2, part.y + part.height);
          ctx.stroke();
        }
      }
      
      // Add part name label
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(part.name, part.x + part.width/2, part.y - 5);
      
      ctx.restore();
    });
    
    // Draw dragged item preview
    if (draggedItem && mousePos.x && mousePos.y) {
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = draggedItem.color;
      
      const x = mousePos.x - draggedItem.width / 2;
      const y = mousePos.y - draggedItem.height / 2;
      
      if (draggedItem.shape === 'rectangle') {
        ctx.fillRect(x, y, draggedItem.width, draggedItem.height);
      } else if (draggedItem.shape === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(x + draggedItem.width/2, y);
        ctx.lineTo(x + draggedItem.width, y + draggedItem.height/2);
        ctx.lineTo(x + draggedItem.width/2, y + draggedItem.height);
        ctx.lineTo(x, y + draggedItem.height/2);
        ctx.closePath();
        ctx.fill();
      } else if (draggedItem.shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(x + draggedItem.width/2, y);
        ctx.lineTo(x + draggedItem.width, y + draggedItem.height);
        ctx.lineTo(x, y + draggedItem.height);
        ctx.closePath();
        ctx.fill();
      } else if (draggedItem.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x + draggedItem.width/2, y + draggedItem.height/2, Math.min(draggedItem.width, draggedItem.height)/2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
    }
    
    // Draw celebration
    if (showCelebration) {
      // Draw confetti
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * canvas.width;
        const y = (Math.random() * canvas.height + Date.now() / 10) % canvas.height;
        const size = Math.random() * 10 + 5;
        
        ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
        ctx.fillRect(x, y, size, size * 0.6);
      }
      
      // Draw "Complete!" text
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#059669';
      ctx.shadowBlur = 10;
      ctx.fillText('KITE COMPLETE!', canvas.width / 2, canvas.height / 2);
      ctx.shadowBlur = 0;
    }
  }, [placedParts, snapZones, draggedItem, mousePos, showCelebration]);

  // Enhanced Flying mode with physics
  useEffect(() => {
    if (!showFlyingMode) return;
    
    const kiteType = kiteTypes[selectedKiteType];
    let targetX = 300;
    let targetY = 200;
    let currentX = kitePosition.x;
    let currentY = kitePosition.y;
    let velocityX = 0;
    let velocityY = 0;
    let stringAngle = 0;
    
    const handleMouseMove = (e) => {
      if (controlMode === 'mouse') {
        targetX = Math.max(50, Math.min(window.innerWidth - 150, e.clientX - 50));
        targetY = Math.max(50, Math.min(400, e.clientY - 100));
      }
    };
    
    const handleKeyPress = (e) => {
      if (controlMode === 'keyboard') {
        const speed = 10;
        switch(e.key) {
          case 'ArrowUp':
            targetY = Math.max(50, targetY - speed);
            break;
          case 'ArrowDown':
            targetY = Math.min(400, targetY + speed);
            break;
          case 'ArrowLeft':
            targetX = Math.max(50, targetX - speed);
            break;
          case 'ArrowRight':
            targetX = Math.min(window.innerWidth - 150, targetX + speed);
            break;
          case ' ':
            // Space for tricks
            performTrick();
            break;
        }
      }
    };
    
    const performTrick = () => {
      const trickTypes = ['Loop', 'Barrel Roll', 'Dive', 'Figure-8'];
      const trick = trickTypes[Math.floor(Math.random() * trickTypes.length)];
      setTricks(prev => [...prev, { name: trick, time: Date.now() }]);
      setFlyingScore(prev => prev + 500);
      
      // Add trick animation
      setKiteRotation(prev => prev + 360);
    };
    
    // Physics simulation
    const animate = () => {
      if (!showFlyingMode) return;
      
      // Calculate wind effect based on kite properties
      const windEffect = (windStrength / 10) * Math.sin(Date.now() / 500) * 20;
      const turbulence = weather === 'rainy' ? 15 : weather === 'cloudy' ? 8 : 3;
      const randomWind = (Math.random() - 0.5) * turbulence;
      
      // String physics
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      stringAngle = Math.atan2(dy, dx);
      const stringTension = Math.sqrt(dx * dx + dy * dy) / 100;
      
      // Apply forces
      const windForce = windStrength / 20 * kiteType.stability;
      velocityX += (dx * 0.02 + windEffect * 0.01 + randomWind * 0.05) * windForce;
      velocityY += (dy * 0.02 + Math.sin(Date.now() / 1000) * 5 * 0.01) * windForce;
      
      // Apply drag
      velocityX *= 0.95;
      velocityY *= 0.95;
      
      // Update position
      currentX += velocityX;
      currentY += velocityY;
      
      // Calculate altitude based on position
      const newAltitude = Math.max(10, 500 - currentY);
      setAltitude(newAltitude);
      
      // Update kite position with smooth movement
      setKitePosition({
        x: currentX,
        y: currentY
      });
      
      // Update rotation based on movement
      const movementAngle = Math.atan2(velocityY, velocityX) * 180 / Math.PI;
      setKiteRotation(movementAngle + Math.sin(Date.now() / 1000) * 10);
      
      // Update string physics
      setKiteString({
        length: Math.sqrt(dx * dx + dy * dy),
        tension: stringTension
      });
      
      // Add to score while flying
      if (Math.random() > 0.95) {
        const points = Math.floor(windStrength / 5) * kiteType.flyingDifficulty;
        setFlyingScore(prev => prev + points);
      }
      
      requestAnimationFrame(animate);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyPress);
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyPress);
      cancelAnimationFrame(animationId);
    };
  }, [showFlyingMode, windStrength, selectedKiteType, controlMode, weather]);

  const resetWorkspace = () => {
    setPlacedParts([]);
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsComplete(false);
    setShowCelebration(false);
    setScore(0);
    setFlyingScore(0);
    setShowFlyingMode(false);
    setTricks([]);
  };

  const nextStep = () => {
    if (currentStep < assemblySteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Remove references to Circuit Playground variables
  // These functions were accidentally included from another component

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Kite Selection Screen */}
      {showKiteSelection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Choose Your Kite Type</h2>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {Object.entries(kiteTypes).map(([key, kite]) => (
                <div
                  key={key}
                  onClick={() => setSelectedKiteType(key)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedKiteType === key
                      ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <h3 className="text-lg font-bold mb-1">{kite.name}</h3>
                  <div className={`text-xs font-medium mb-2 ${
                    kite.difficulty === 'Beginner' ? 'text-green-600' :
                    kite.difficulty === 'Intermediate' ? 'text-yellow-600' :
                    kite.difficulty === 'Advanced' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {kite.difficulty}
                  </div>
                  <p className="text-gray-600 text-xs mb-3">{kite.description}</p>
                  
                  {/* Kite stats */}
                  <div className="text-xs space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Stability:</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full mx-0.5 ${
                              i < Math.round(kite.stability * 5) ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Wind Range:</span>
                      <span className="font-medium">{kite.windRange.min}-{kite.windRange.max} mph</span>
                    </div>
                  </div>
                  
                  {/* Simple visual representation */}
                  <div className="flex justify-center">
                    {key === 'diamond' && (
                      <div className="w-16 h-16 bg-red-400 transform rotate-45"></div>
                    )}
                    {key === 'delta' && (
                      <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[60px] border-b-blue-400"></div>
                    )}
                    {key === 'box' && (
                      <div className="w-16 h-16 border-4 border-purple-400 relative">
                        <div className="absolute inset-2 border-2 border-purple-300"></div>
                      </div>
                    )}
                    {key === 'sled' && (
                      <div className="w-16 h-12 bg-green-400 rounded-t-full"></div>
                    )}
                    {key === 'dragon' && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
                        <div className="w-4 h-4 bg-orange-300 rounded-full -ml-2"></div>
                        <div className="w-3 h-3 bg-orange-200 rounded-full -ml-1"></div>
                      </div>
                    )}
                    {key === 'bird' && (
                      <div className="relative">
                        <div className="w-0 h-0 border-l-[20px] border-l-indigo-400 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent"></div>
                        <div className="w-0 h-0 border-r-[20px] border-r-indigo-400 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent absolute -right-5"></div>
                      </div>
                    )}
                    {key === 'stunt' && (
                      <div className="w-16 h-16 relative">
                        <div className="absolute inset-0 bg-pink-400 transform rotate-45 scale-75"></div>
                        <div className="absolute inset-0 bg-pink-300 transform rotate-45 scale-50"></div>
                      </div>
                    )}
                    {key === 'parafoil' && (
                      <div className="w-16 h-8 bg-teal-400 rounded-t-3xl border-b-4 border-teal-600"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setShowKiteSelection(false)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Start Building {kiteTypes[selectedKiteType].name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wind className="w-8 h-8 text-blue-600" />
            Kite Builder Workshop
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-700">{score} Points</span>
            </div>
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => {
                setShowKiteSelection(true);
                resetWorkspace();
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Wind className="w-5 h-5" />
              Change Kite
            </button>
            
            <button
              onClick={resetWorkspace}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <RotateCw className="w-5 h-5" />
              Start Over
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Panel - Parts Inventory */}
          <div className="col-span-3 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                {kiteTypes[selectedKiteType].name} Parts
              </h3>
              
              <div className="space-y-3">
                {Object.entries(kiteParts).map(([key, part]) => {
                  const isRequired = assemblySteps[currentStep]?.requiredParts?.includes(key);
                  const isPlaced = placedParts.some(p => p.id === key);
                  
                  return (
                    <div
                      key={key}
                      draggable={!isPlaced && isRequired}
                      onDragStart={(e) => handleDragStart(e, key)}
                      className={`p-3 rounded-lg border-2 transition-all cursor-move ${
                        isPlaced ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed' :
                        isRequired ? 'bg-blue-50 border-blue-400 hover:shadow-md' :
                        'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{part.name}</h4>
                        {isPlaced && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      
                      {/* Visual representation */}
                      <div className="h-12 bg-gray-100 rounded flex items-center justify-center">
                        <div 
                          className={`${
                            part.shape === 'rectangle' ? 'rounded' : ''
                          }`}
                          style={{
                            width: `${Math.min(part.width / 3, 60)}px`,
                            height: `${Math.min(part.height / 3, 30)}px`,
                            backgroundColor: part.color,
                            transform: part.shape === 'diamond' ? 'rotate(45deg) scale(0.7)' : 'none'
                          }}
                        />
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-2">{part.instruction}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Instructions Panel */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-green-600" />
                How to Build
              </h3>
              
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600">1.</span>
                  <span>Drag parts from the inventory</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600">2.</span>
                  <span>Drop them in the highlighted areas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600">3.</span>
                  <span>Follow the step-by-step guide</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600">4.</span>
                  <span>Complete all steps to finish!</span>
                </li>
              </ol>
              
              <button
                onClick={() => setShowHint(!showHint)}
                className="mt-4 w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                {showHint ? 'Hide Hint' : 'Need a Hint?'}
              </button>
            </div>
          </div>

          {/* Center - Work Area */}
          <div className="col-span-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              {/* Step Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{assemblySteps[currentStep].title}</h3>
                  <span className="text-sm text-gray-500">
                    Step {currentStep + 1} of {assemblySteps.length}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / assemblySteps.length) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-blue-800 font-medium flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  {assemblySteps[currentStep].instruction}
                </p>
              </div>
              
              {/* Skip button for introduction */}
              {currentStep === 0 && (
                <div className="text-center mb-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Skip introduction and start building
                  </button>
                </div>
              )}
              
              {/* Show hint if requested */}
              {showHint && (
                <div className="bg-purple-50 rounded-lg p-3 mb-4">
                  <p className="text-purple-800 text-sm">
                    💡 Hint: {assemblySteps[currentStep].hint}
                  </p>
                </div>
              )}
              
              {/* Canvas */}
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="border-2 border-gray-300 rounded-lg w-full cursor-crosshair"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ maxHeight: '600px' }}
              />
              
              {/* Navigation */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    currentStep === 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
                
                {/* Show Fly button when kite is complete OR on the final congratulations step */}
                {(isComplete || (currentStep === assemblySteps.length - 1 && assemblySteps[currentStep].title.includes('Complete'))) ? (
                  <button
                    onClick={() => setShowFlyingMode(true)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 animate-pulse"
                  >
                    <Play className="w-5 h-5" />
                    Fly Your Kite!
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={
                      currentStep === assemblySteps.length - 1 || 
                      (!assemblySteps[currentStep].canSkip && !completedSteps.includes(currentStep))
                    }
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      currentStep === assemblySteps.length - 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : assemblySteps[currentStep].canSkip || completedSteps.includes(currentStep)
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Progress & Achievements */}
          <div className="col-span-3 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Your Progress
              </h3>
              
              <div className="space-y-3">
                {assemblySteps.map((step, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      completedSteps.includes(index) ? 'bg-green-50' :
                      index === currentStep ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      completedSteps.includes(index) ? 'bg-green-500 text-white' :
                      index === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {completedSteps.includes(index) ? '✓' : index + 1}
                    </div>
                    <span className={`text-sm ${
                      completedSteps.includes(index) ? 'font-medium text-green-700' :
                      index === currentStep ? 'font-medium text-blue-700' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-600" />
                Achievements
              </h3>
              
              <div className="space-y-3">
                <div className={`p-3 rounded-lg border-2 ${
                  completedSteps.length >= 1 ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <Star className={`w-5 h-5 ${completedSteps.length >= 1 ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className="font-medium">First Part Placed</span>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg border-2 ${
                  completedSteps.length >= 3 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <Star className={`w-5 h-5 ${completedSteps.length >= 3 ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-medium">Frame Builder</span>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg border-2 ${
                  isComplete ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <Star className={`w-5 h-5 ${isComplete ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="font-medium">Master Kite Builder!</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Kite Info */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                {kiteTypes[selectedKiteType].name} Facts
              </h4>
              <ul className="text-sm space-y-2 text-blue-700">
                <li>• Difficulty: {kiteTypes[selectedKiteType].difficulty}</li>
                <li>• Wind Range: {kiteTypes[selectedKiteType].windRange.min}-{kiteTypes[selectedKiteType].windRange.max} mph</li>
                <li>• Stability: {'★'.repeat(Math.round(kiteTypes[selectedKiteType].stability * 5))}</li>
                <li>• {kiteTypes[selectedKiteType].description}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
            <p className="text-lg mb-6">
              You've successfully built your {kiteTypes[selectedKiteType].name}! 
              You earned {score} points!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowCelebration(false)}
                className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={resetWorkspace}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Build Another!
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Flying Mode */}
      {showFlyingMode && (
        <div className="fixed inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200 z-50 overflow-hidden">
          {/* Weather Effects */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Clouds */}
            {weather !== 'sunny' && (
              <>
                <div className="absolute top-20 left-10 w-40 h-24 bg-gray-300 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute top-40 right-20 w-48 h-28 bg-gray-400 rounded-full opacity-50 animate-pulse"></div>
              </>
            )}
            
            {/* Rain */}
            {weather === 'rainy' && (
              <div className="absolute inset-0 opacity-30">
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-8 bg-blue-600"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animation: `fall ${1 + Math.random()}s linear infinite`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Sun */}
            {weather === 'sunny' && (
              <div className="absolute top-10 right-10 w-24 h-24 bg-yellow-400 rounded-full shadow-lg">
                <div className="absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
              </div>
            )}
            
            {/* Flying Kite with Physics */}
            <div 
              className="absolute transition-all duration-200"
              style={{
                left: `${kitePosition.x}px`,
                top: `${kitePosition.y}px`,
                transform: `rotate(${kiteRotation}deg) scale(${1 + Math.sin(Date.now() / 1000) * 0.05})`,
                transition: 'left 0.2s ease-out, top 0.2s ease-out, transform 0.3s ease-out'
              }}
            >
              {/* Different kite shapes based on type */}
              {selectedKiteType === 'diamond' && (
                <div 
                  className="w-24 h-24 transform rotate-45 shadow-lg relative"
                  style={{ backgroundColor: kiteTypes[selectedKiteType].color }}
                >
                  {/* Bow effect */}
                  <div className="absolute inset-2 border-2 border-white/50 rounded-sm"></div>
                </div>
              )}
              
              {selectedKiteType === 'delta' && (
                <div className="relative">
                  <div className="w-0 h-0 border-l-[48px] border-l-transparent border-r-[48px] border-r-transparent border-b-[96px] shadow-lg"
                    style={{ borderBottomColor: kiteTypes[selectedKiteType].color }}
                  />
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-gray-600"></div>
                </div>
              )}
              
              {selectedKiteType === 'box' && (
                <div className="relative">
                  <div className="w-20 h-20 border-4 shadow-lg"
                    style={{ borderColor: kiteTypes[selectedKiteType].color }}
                  >
                    <div className="absolute inset-2 border-2"
                      style={{ borderColor: kiteTypes[selectedKiteType].color }}
                    ></div>
                  </div>
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-20 h-10 border-4 border-t-0"
                    style={{ borderColor: kiteTypes[selectedKiteType].color }}
                  ></div>
                </div>
              )}
              
              {selectedKiteType === 'sled' && (
                <div 
                  className="w-24 h-16 rounded-t-full shadow-lg"
                  style={{ backgroundColor: kiteTypes[selectedKiteType].color }}
                >
                  <div className="absolute inset-x-4 top-2 flex justify-between">
                    <div className="w-3 h-3 bg-white/70 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/70 rounded-full"></div>
                  </div>
                </div>
              )}
              
              {selectedKiteType === 'dragon' && (
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full shadow-lg"
                    style={{ backgroundColor: kiteTypes[selectedKiteType].color }}
                  >
                    <div className="absolute inset-2 bg-white/30 rounded-full"></div>
                  </div>
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-full shadow-lg -ml-2"
                      style={{ 
                        backgroundColor: kiteTypes[selectedKiteType].color,
                        opacity: 1 - i * 0.2,
                        transform: `scale(${1 - i * 0.1})`
                      }}
                    />
                  ))}
                </div>
              )}
              
              {selectedKiteType === 'bird' && (
                <div className="relative">
                  <div className="w-0 h-0 border-l-[30px] border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent"
                    style={{ borderLeftColor: kiteTypes[selectedKiteType].color }}
                  ></div>
                  <div className="w-0 h-0 border-r-[30px] border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent absolute -right-8"
                    style={{ borderRightColor: kiteTypes[selectedKiteType].color }}
                  ></div>
                </div>
              )}
              
              {selectedKiteType === 'stunt' && (
                <div className="relative">
                  <div className="w-20 h-20 transform rotate-45 shadow-lg"
                    style={{ backgroundColor: kiteTypes[selectedKiteType].color }}
                  >
                    <div className="absolute inset-2 transform -rotate-45">
                      <div className="w-full h-0.5 bg-black/30 absolute top-1/2"></div>
                      <div className="h-full w-0.5 bg-black/30 absolute left-1/2"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedKiteType === 'parafoil' && (
                <div 
                  className="w-28 h-10 rounded-t-full shadow-lg border-b-4"
                  style={{ 
                    backgroundColor: kiteTypes[selectedKiteType].color,
                    borderBottomColor: '#1F2937'
                  }}
                >
                  <div className="absolute inset-x-2 top-1 flex justify-between">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-6 h-6 bg-black/10 rounded"></div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Kite string with realistic curve */}
              <svg className="absolute top-full left-1/2 transform -translate-x-1/2 pointer-events-none" 
                width="4" 
                height={`${window.innerHeight}px`}
                style={{ zIndex: -1 }}
              >
                <path
                  d={`M 2 0 Q ${2 + kiteString.tension * 20} ${window.innerHeight / 2} 2 ${window.innerHeight - 200}`}
                  stroke="#666"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
              
              {/* Tail */}
              {(selectedKiteType === 'diamond' || selectedKiteType === 'dragon') && (
                <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-4 h-4 bg-yellow-500 mb-1"
                      style={{
                        transform: `translateX(${Math.sin((Date.now() / 200) + i) * 10}px)`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Ground with more detail */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-green-500 to-green-400">
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-green-600"></div>
              {/* Trees */}
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute bottom-16"
                  style={{ left: `${i * 25}%` }}
                >
                  <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[40px] border-b-green-700"></div>
                  <div className="w-2 h-8 bg-amber-800 mx-auto -mt-2"></div>
                </div>
              ))}
            </div>
            
            {/* Person holding string at bottom */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
              <div className="w-8 h-8 bg-yellow-300 rounded-full"></div>
              <div className="w-10 h-16 bg-blue-600 rounded-t-lg mt-1"></div>
              <div className="flex">
                <div className="w-4 h-12 bg-blue-800 rounded-b"></div>
                <div className="w-2"></div>
                <div className="w-4 h-12 bg-blue-800 rounded-b"></div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Controls */}
          <div className="relative z-10 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Wind className="w-6 h-6 text-blue-600" />
                  Flying Your {kiteTypes[selectedKiteType].name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">{flyingScore}</span>
                  <span className="text-sm text-gray-500">points</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Controls */}
                <div className="space-y-4">
                  {/* Wind Control */}
                  <div>
                    <label className="text-sm font-medium flex items-center justify-between">
                      <span>Wind Speed: {windStrength} mph</span>
                      {windStrength < kiteTypes[selectedKiteType].windRange.min && (
                        <span className="text-xs text-orange-500">Too light!</span>
                      )}
                      {windStrength > kiteTypes[selectedKiteType].windRange.max && (
                        <span className="text-xs text-red-500">Too strong!</span>
                      )}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={windStrength}
                      onChange={(e) => setWindStrength(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Weather Control */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Weather</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setWeather('sunny')}
                        className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
                          weather === 'sunny' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
                        }`}
                      >
                        <Sun className="w-5 h-5 mx-auto" />
                      </button>
                      <button
                        onClick={() => setWeather('cloudy')}
                        className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
                          weather === 'cloudy' ? 'border-gray-500 bg-gray-50' : 'border-gray-200'
                        }`}
                      >
                        <Wind className="w-5 h-5 mx-auto" />
                      </button>
                      <button
                        onClick={() => setWeather('rainy')}
                        className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
                          weather === 'rainy' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <CloudRain className="w-5 h-5 mx-auto" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Control Mode */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Control Mode</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setControlMode('mouse')}
                        className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
                          controlMode === 'mouse' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        Mouse
                      </button>
                      <button
                        onClick={() => setControlMode('keyboard')}
                        className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
                          controlMode === 'keyboard' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        Keyboard
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Altitude</span>
                    <span className="font-bold">{Math.round(altitude)} ft</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">String Length</span>
                    <span className="font-bold">{Math.round(kiteString.length)} ft</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">String Tension</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                          style={{ width: `${kiteString.tension * 100}%` }}
                        />
                      </div>
                      <span className="text-xs">{Math.round(kiteString.tension * 100)}%</span>
                    </div>
                  </div>
                  
                  {/* Tricks performed */}
                  {tricks.length > 0 && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-700 mb-1">Tricks Performed:</p>
                      <div className="flex flex-wrap gap-1">
                        {tricks.slice(-3).map((trick, i) => (
                          <span key={i} className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                            {trick.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Instructions */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  {controlMode === 'mouse' ? 
                    "Move your mouse to control the kite! The kite follows your cursor." :
                    "Use arrow keys to fly! Press SPACE for tricks!"
                  }
                </p>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowFlyingMode(false);
                    setShowCelebration(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Back to Building
                </button>
                <button
                  onClick={() => {
                    setShowFlyingMode(false);
                    setShowKiteSelection(true);
                    resetWorkspace();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Build New Kite
                </button>
              </div>
            </div>
          </div>
          
          {/* Flying Tips */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-white/90 rounded-lg px-6 py-3 shadow-lg">
              <p className="text-center text-sm font-medium">
                {windStrength < kiteTypes[selectedKiteType].windRange.min ? 
                  "⚠️ Wind too light - kite may not fly well!" :
                  windStrength > kiteTypes[selectedKiteType].windRange.max ?
                  "⚠️ Wind too strong - careful not to lose control!" :
                  weather === 'rainy' ?
                  "🌧️ Flying in rain is challenging!" :
                  "Perfect conditions for flying!"}
              </p>
            </div>
          </div>
          
          {/* Keyboard control hint */}
          {controlMode === 'keyboard' && (
            <div className="absolute top-20 right-4 bg-white rounded-lg p-4 shadow-lg">
              <h4 className="font-bold mb-2">Controls</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-200 rounded">↑</kbd>
                  <span>Fly Up</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-200 rounded">↓</kbd>
                  <span>Fly Down</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-200 rounded">←→</kbd>
                  <span>Move Left/Right</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-200 rounded">Space</kbd>
                  <span>Do Trick!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Add CSS for rain animation */}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </div>
  );
};

export default KiteBuilderWorkshop;