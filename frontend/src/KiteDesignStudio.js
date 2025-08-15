import React, { useState, useEffect, useRef } from 'react';
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
  Move
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

  // Different kite types - expanded selection
  const kiteTypes = {
    diamond: {
      name: 'Diamond Kite',
      difficulty: 'Beginner',
      description: 'The classic and easiest kite to build and fly',
      parts: ['spineStick', 'crossStick', 'fabric', 'bowString', 'string', 'tail'],
      color: '#FF6B6B',
      flyingDifficulty: 1
    },
    delta: {
      name: 'Delta Kite',
      difficulty: 'Intermediate',
      description: 'Triangle shaped, very stable in flight',
      parts: ['spineStick', 'spreadStick1', 'spreadStick2', 'deltaFabric', 'string', 'keel'],
      color: '#3B82F6',
      flyingDifficulty: 0.8
    },
    box: {
      name: 'Box Kite',
      difficulty: 'Advanced',
      description: 'Complex 3D structure, flies in light winds',
      parts: ['stick1', 'stick2', 'stick3', 'stick4', 'boxFabric1', 'boxFabric2', 'connector', 'string'],
      color: '#8B5CF6',
      flyingDifficulty: 1.5
    },
    sled: {
      name: 'Sled Kite',
      difficulty: 'Beginner',
      description: 'No sticks needed! Inflates with wind',
      parts: ['sledFabric', 'reinforcement1', 'reinforcement2', 'string', 'vent1', 'vent2'],
      color: '#10B981',
      flyingDifficulty: 0.7
    },
    dragon: {
      name: 'Dragon Kite',
      difficulty: 'Expert',
      description: 'Long colorful kite with a dramatic tail',
      parts: ['dragonHead', 'bodySection1', 'bodySection2', 'bodySection3', 'spineRod', 'string', 'longTail'],
      color: '#F59E0B',
      flyingDifficulty: 2
    },
    bird: {
      name: 'Bird Kite',
      difficulty: 'Intermediate',
      description: 'Realistic bird shape that soars beautifully',
      parts: ['wingFrame1', 'wingFrame2', 'bodyFrame', 'wingFabric', 'tailFeathers', 'string'],
      color: '#6366F1',
      flyingDifficulty: 1.2
    }
  };

  // Kite parts inventory - now dynamic based on selected kite type
  const getKiteParts = () => {
    const baseColors = {
      diamond: '#FF6B6B',
      delta: '#3B82F6',
      box: '#8B5CF6',
      sled: '#10B981',
      dragon: '#F59E0B',
      bird: '#6366F1'
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
      }
      // Add more kite types as needed
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
  }, [currentStep]);

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
      
      // Auto advance after a delay
      setTimeout(() => {
        if (currentStep < assemblySteps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          setIsComplete(true);
          setShowCelebration(true);
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
      ctx.fillStyle = part.color;
      
      if (part.shape === 'rectangle') {
        ctx.fillRect(part.x, part.y, part.width, part.height);
      } else if (part.shape === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(part.x + part.width/2, part.y);
        ctx.lineTo(part.x + part.width, part.y + part.height/2);
        ctx.lineTo(part.x + part.width/2, part.y + part.height);
        ctx.lineTo(part.x, part.y + part.height/2);
        ctx.closePath();
        ctx.fill();
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
        // Draw ribbon tail
        ctx.fillStyle = part.color;
        for (let i = 0; i < 5; i++) {
          ctx.fillRect(
            part.x + Math.sin(i) * 10,
            part.y + i * 30,
            part.width,
            25
          );
        }
      }
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
      }
      
      ctx.globalAlpha = 1;
    }
    
    // Draw celebration
    if (showCelebration) {
      // Draw stars
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 20 + 10;
        
        ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          const angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
          const r = j % 2 === 0 ? size : size / 2;
          ctx.lineTo(
            x + Math.cos(angle) * r,
            y + Math.sin(angle) * r
          );
        }
        ctx.closePath();
        ctx.fill();
      }
    }
  }, [placedParts, snapZones, draggedItem, mousePos, showCelebration]);

  // Flying mode mouse control
  useEffect(() => {
    if (!showFlyingMode) return;
    
    let targetX = 300;
    let targetY = 200;
    let currentX = 300;
    let currentY = 200;
    
    const handleMouseMove = (e) => {
      // Set target position based on mouse
      targetX = Math.max(50, Math.min(window.innerWidth - 150, e.clientX - 50));
      targetY = Math.max(50, Math.min(400, e.clientY - 100)); // Limit vertical movement
    };
    
    // Smooth animation loop
    const animate = () => {
      if (!showFlyingMode) return;
      
      // Smooth movement towards target
      const speed = 0.05; // Adjust for smoother/faster movement
      currentX += (targetX - currentX) * speed;
      currentY += (targetY - currentY) * speed;
      
      // Add wind effect
      const windEffect = (windStrength / 10) * Math.sin(Date.now() / 500) * 20;
      const bobbing = Math.sin(Date.now() / 1000) * 10;
      
      setKitePosition({
        x: currentX + windEffect,
        y: currentY + bobbing
      });
      
      // Add to score while flying
      if (Math.random() > 0.95) { // Don't update every frame
        setFlyingScore(prev => prev + Math.floor(windStrength / 5));
      }
      
      requestAnimationFrame(animate);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [showFlyingMode, windStrength]);

  const resetWorkspace = () => {
    setPlacedParts([]);
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsComplete(false);
    setShowCelebration(false);
    setScore(0);
    setFlyingScore(0);
    setShowFlyingMode(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Kite Selection Screen */}
      {showKiteSelection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Choose Your Kite Type</h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
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
                Kite Parts
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
                
                {isComplete ? (
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
                    disabled={currentStep === assemblySteps.length - 1}
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
            
            {/* Fun Facts */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Did You Know?</h4>
              <p className="text-sm text-yellow-700">
                {currentStep === 0 && "Kites were invented in China over 2,000 years ago!"}
                {currentStep === 1 && "The spine is the most important part - it holds everything together!"}
                {currentStep === 2 && "The cross stick creates the diamond shape that catches wind!"}
                {currentStep === 3 && "Kite fabric needs to be light but strong to fly well!"}
                {currentStep === 4 && "A bow in the kite helps it stay stable in the wind!"}
                {currentStep === 5 && "The string angle affects how high your kite can fly!"}
                {currentStep === 6 && "Tails help kites fly straight and not spin around!"}
                {currentStep === 7 && "Now you know how to build a real kite! Try it at home!"}
              </p>
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
              You've successfully built your kite! You earned {score} points!
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
      
      {/* Flying Mode */}
      {showFlyingMode && (
        <div className="fixed inset-0 bg-gradient-to-b from-sky-400 to-sky-200 z-50">
          <div className="absolute inset-0">
            {/* Clouds */}
            <div className="absolute top-20 left-10 w-32 h-20 bg-white rounded-full opacity-80 animate-pulse"></div>
            <div className="absolute top-40 right-20 w-40 h-24 bg-white rounded-full opacity-70 animate-pulse"></div>
            <div className="absolute top-32 left-1/2 w-36 h-22 bg-white rounded-full opacity-75 animate-pulse"></div>
            
            {/* Sun */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-400 rounded-full shadow-lg">
              <div className="absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
            </div>
            
            {/* Flying Kite */}
            <div 
              className="absolute transition-all duration-200"
              style={{
                left: `${kitePosition.x}px`,
                top: `${kitePosition.y}px`,
                transform: `rotate(${Math.sin(Date.now() / 1000) * 10}deg)`
              }}
            >
              <div 
                className="w-24 h-24 transform rotate-45 shadow-lg"
                style={{ backgroundColor: kiteTypes[selectedKiteType].color }}
              >
                {/* Kite string */}
                <svg className="absolute -bottom-40 left-1/2 transform -translate-x-1/2" width="2" height="200">
                  <line x1="1" y1="0" x2="1" y2="200" stroke="#666" strokeWidth="2"/>
                </svg>
              </div>
              
              {/* Tail */}
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
            </div>
            
            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-green-400">
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-green-500"></div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="relative z-10 p-4">
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Wind className="w-6 h-6 text-blue-600" />
                Fly Your {kiteTypes[selectedKiteType].name}!
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Wind Speed: {windStrength} mph</label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={windStrength}
                    onChange={(e) => setWindStrength(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Flying Score:</span>
                  <span className="text-2xl font-bold text-green-600">{flyingScore}</span>
                </div>
                
                <p className="text-sm text-gray-600">
                  Use your mouse to control the kite! Move left and right to steer.
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
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-white/90 rounded-lg px-6 py-3 shadow-lg">
              <p className="text-center text-sm font-medium">
                Move your mouse to control the kite! 
                {windStrength < 10 && " (Low wind - kite flies slowly)"}
                {windStrength > 25 && " (Strong wind - hold on tight!)"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KiteBuilderWorkshop;