import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Cpu, 
  Zap, 
  Activity,
  Battery,
  Lightbulb,
  Settings,
  Play,
  Pause,
  RotateCw,
  Save,
  Download,
  Upload,
  Trash2,
  AlertCircle,
  ChevronRight,
  Minus,
  Plus,
  MousePointer,
  Power,
  CircuitBoard,
  Gauge,
  TrendingUp,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Hand,
  ZapOff,
  Volume2,
  Thermometer,
  Waves,
  Circle,
  Square,
  Undo,
  Redo,
  Trophy,
  Target,
  CheckCircle,
  Info
} from 'lucide-react';

const CircuitPlayground = () => {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('drag'); // 'drag', 'wire', 'delete'
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [wireStart, setWireStart] = useState(null);
  const [tempWire, setTempWire] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [simulation, setSimulation] = useState({
    running: false,
    time: 0,
    circuits: []
  });
  const [draggedComponent, setDraggedComponent] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showTutorial, setShowTutorial] = useState(true);
  
  // Undo/Redo state
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Challenge Mode state
  const [challengeMode, setChallengeMode] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  // Challenges
  const challenges = [
    {
      id: 1,
      name: "First Light",
      description: "Create a simple circuit to light up a bulb",
      difficulty: "Easy",
      requirements: {
        components: ['battery', 'switch', 'bulb'],
        mustLight: ['bulb'],
        maxComponents: 5
      },
      hints: [
        "You need a battery, switch, and bulb",
        "Connect battery + → switch → bulb → battery -",
        "Don't forget to turn the switch ON!"
      ],
      xp: 100
    },
    {
      id: 2,
      name: "LED Safety",
      description: "Light up an LED safely with a resistor",
      difficulty: "Easy",
      requirements: {
        components: ['battery', 'resistor', 'led'],
        mustLight: ['led'],
        mustHave: ['resistor'],
        maxComponents: 6
      },
      hints: [
        "LEDs need resistors to limit current",
        "Connect battery + → resistor → LED + → LED - → battery -",
        "Make sure LED polarity is correct (+ to +)"
      ],
      xp: 150
    },
    {
      id: 3,
      name: "Parallel Lights",
      description: "Light up both a bulb AND an LED at the same time",
      difficulty: "Medium",
      requirements: {
        components: ['battery', 'switch', 'bulb', 'led', 'resistor'],
        mustLight: ['bulb', 'led'],
        simultaneousLight: true
      },
      hints: [
        "Use parallel connections",
        "Each branch needs its own path",
        "LED still needs a resistor!"
      ],
      xp: 250
    },
    {
      id: 4,
      name: "Motor Controller",
      description: "Build a circuit to control a motor with a switch",
      difficulty: "Medium",
      requirements: {
        components: ['battery', 'switch', 'motor'],
        mustActivate: ['motor'],
        switchControl: true
      },
      hints: [
        "Motors need more current than LEDs",
        "Simple series circuit will work",
        "Switch must control the motor"
      ],
      xp: 200
    },
    {
      id: 5,
      name: "The Orchestra",
      description: "Activate a bulb, LED, buzzer, and motor in one circuit!",
      difficulty: "Hard",
      requirements: {
        components: ['battery', 'switch', 'bulb', 'led', 'buzzer', 'motor', 'resistor'],
        mustLight: ['bulb', 'led'],
        mustActivate: ['buzzer', 'motor'],
        simultaneousLight: true
      },
      hints: [
        "Use parallel branches for each component",
        "Each component may need different current",
        "This is a complex circuit - plan it out!"
      ],
      xp: 500
    }
  ];

  // Component Templates
  const componentTemplates = {
    battery: {
      type: 'battery',
      name: 'Battery 9V',
      width: 80,
      height: 60,
      pins: [
        { id: 'positive', x: 0, y: 30, type: 'output', voltage: 9, label: '+' },
        { id: 'negative', x: 80, y: 30, type: 'output', voltage: 0, label: '-' }
      ],
      color: '#dc2626',
      icon: Battery,
      properties: { voltage: 9, current: 0 }
    },
    resistor: {
      type: 'resistor',
      name: 'Resistor 1K',
      width: 80,
      height: 30,
      pins: [
        { id: 'left', x: 0, y: 15, type: 'passive' },
        { id: 'right', x: 80, y: 15, type: 'passive' }
      ],
      color: '#f59e0b',
      icon: Minus,
      properties: { resistance: 1000, tolerance: 5 }
    },
    bulb: {
      type: 'bulb',
      name: 'Light Bulb',
      width: 60,
      height: 60,
      pins: [
        { id: 'bottom1', x: 20, y: 60, type: 'input' },
        { id: 'bottom2', x: 40, y: 60, type: 'input' }
      ],
      color: '#9ca3af', // Gray when off
      icon: Lightbulb,
      properties: { lit: false, brightness: 0 }
    },
    led: {
      type: 'led',
      name: 'LED',
      width: 50,
      height: 50,
      pins: [
        { id: 'anode', x: 15, y: 50, type: 'input', label: '+' },
        { id: 'cathode', x: 35, y: 50, type: 'input', label: '-' }
      ],
      color: '#ef4444',
      icon: Lightbulb,
      properties: { forwardVoltage: 2, maxCurrent: 0.02, lit: false }
    },
    switch: {
      type: 'switch',
      name: 'Switch',
      width: 60,
      height: 30,
      pins: [
        { id: 'in', x: 0, y: 15, type: 'passive' },
        { id: 'out', x: 60, y: 15, type: 'passive' }
      ],
      color: '#6b7280',
      icon: Power,
      properties: { closed: false }
    },
    buzzer: {
      type: 'buzzer',
      name: 'Buzzer',
      width: 50,
      height: 50,
      pins: [
        { id: 'positive', x: 15, y: 50, type: 'input', label: '+' },
        { id: 'negative', x: 35, y: 50, type: 'input', label: '-' }
      ],
      color: '#7c3aed',
      icon: Volume2,
      properties: { frequency: 1000, active: false }
    },
    motor: {
      type: 'motor',
      name: 'DC Motor',
      width: 60,
      height: 60,
      pins: [
        { id: 'positive', x: 15, y: 60, type: 'input', label: '+' },
        { id: 'negative', x: 45, y: 60, type: 'input', label: '-' }
      ],
      color: '#059669',
      icon: Settings,
      properties: { rpm: 0, maxRpm: 3000 }
    }
  };

  // Undo/Redo Functions
  const saveToHistory = useCallback(() => {
    const currentState = {
      components: JSON.parse(JSON.stringify(components)),
      wires: JSON.parse(JSON.stringify(wires))
    };
    
    // Remove any states after current index
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    
    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
  }, [components, wires, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setComponents(previousState.components);
      setWires(previousState.wires);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setComponents(nextState.components);
      setWires(nextState.wires);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Check challenge completion
  const checkChallengeCompletion = useCallback(() => {
    if (!challengeMode || !currentChallenge || challengeCompleted) return;

    const req = currentChallenge.requirements;
    let passed = true;

    // Check component requirements
    if (req.components) {
      const componentTypes = components.map(c => c.type);
      const hasRequired = req.components.every(type => 
        componentTypes.includes(type)
      );
      if (!hasRequired) passed = false;
    }

    // Check max components
    if (req.maxComponents && components.length > req.maxComponents) {
      passed = false;
    }

    // Check if specific components must be lit
    if (req.mustLight && simulation.running) {
      const litComponents = components.filter(c => 
        (c.type === 'bulb' || c.type === 'led') && c.properties.lit
      );
      const litTypes = litComponents.map(c => c.type);
      const allLit = req.mustLight.every(type => litTypes.includes(type));
      if (!allLit) passed = false;
    }

    // Check if specific components must be active
    if (req.mustActivate && simulation.running) {
      const activeComponents = components.filter(c => 
        (c.type === 'motor' && c.properties.rpm > 0) ||
        (c.type === 'buzzer' && c.properties.active)
      );
      const activeTypes = activeComponents.map(c => c.type);
      const allActive = req.mustActivate.every(type => activeTypes.includes(type));
      if (!allActive) passed = false;
    }

    // Check if must have certain components
    if (req.mustHave) {
      const componentTypes = components.map(c => c.type);
      const hasRequired = req.mustHave.every(type => 
        componentTypes.includes(type)
      );
      if (!hasRequired) passed = false;
    }

    if (passed && simulation.running && !challengeCompleted) {
      setChallengeCompleted(true);
      // You could add celebration animation here
    }
  }, [challengeMode, currentChallenge, components, simulation.running, challengeCompleted]);

  useEffect(() => {
    checkChallengeCompletion();
  }, [checkChallengeCompletion, components, simulation.running]);

  // Add a component to the canvas
  const addComponent = (type, x, y) => {
    const template = componentTemplates[type];
    const newComponent = {
      id: Date.now(),
      ...template,
      x: x - template.width / 2,
      y: y - template.height / 2,
      rotation: 0
    };
    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    saveToHistory();
  };

  // Handle mouse events
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'drag') {
      // Check if clicking on a component
      const clickedComponent = components.find(comp => 
        x >= comp.x && x <= comp.x + comp.width &&
        y >= comp.y && y <= comp.y + comp.height
      );

      if (clickedComponent) {
        setDraggedComponent(clickedComponent);
        setOffset({ x: x - clickedComponent.x, y: y - clickedComponent.y });
        setSelectedComponent(clickedComponent);
      }
    } else if (mode === 'wire') {
      // Check if clicking on a pin
      const pin = findPinAtPosition(x, y);
      if (pin) {
        if (!wireStart) {
          setWireStart(pin);
        } else {
          // Complete the wire
          if (pin.componentId !== wireStart.componentId) {
            const newWire = {
              id: Date.now(),
              start: wireStart,
              end: pin
            };
            const newWires = [...wires, newWire];
            setWires(newWires);
            saveToHistory();
          }
          setWireStart(null);
          setTempWire(null);
        }
      } else {
        setWireStart(null);
        setTempWire(null);
      }
    } else if (mode === 'delete') {
      // Delete component or wire
      const clickedComponent = components.find(comp => 
        x >= comp.x && x <= comp.x + comp.width &&
        y >= comp.y && y <= comp.y + comp.height
      );
      
      if (clickedComponent) {
        deleteComponent(clickedComponent.id);
      } else {
        // Check for wire deletion
        const clickedWire = findWireAtPosition(x, y);
        if (clickedWire) {
          const newWires = wires.filter(w => w.id !== clickedWire.id);
          setWires(newWires);
          saveToHistory();
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (draggedComponent) {
      const updatedComponents = components.map(comp => 
        comp.id === draggedComponent.id 
          ? { ...comp, x: x - offset.x, y: y - offset.y }
          : comp
      );
      setComponents(updatedComponents);
    }

    if (wireStart) {
      setTempWire({ start: wireStart, end: { x, y } });
    }
  };

  const handleMouseUp = () => {
    if (draggedComponent) {
      saveToHistory();
      setDraggedComponent(null);
    }
  };

  const findPinAtPosition = (x, y) => {
    for (const comp of components) {
      for (const pin of comp.pins) {
        const pinX = comp.x + pin.x;
        const pinY = comp.y + pin.y;
        if (Math.abs(x - pinX) < 10 && Math.abs(y - pinY) < 10) {
          return { ...pin, componentId: comp.id, component: comp };
        }
      }
    }
    return null;
  };

  const findWireAtPosition = (x, y) => {
    for (const wire of wires) {
      const startComp = components.find(c => c.id === wire.start.componentId);
      const endComp = components.find(c => c.id === wire.end.componentId);
      if (startComp && endComp) {
        const x1 = startComp.x + wire.start.x;
        const y1 = startComp.y + wire.start.y;
        const x2 = endComp.x + wire.end.x;
        const y2 = endComp.y + wire.end.y;
        
        // Check if point is near the line
        const dist = pointToLineDistance(x, y, x1, y1, x2, y2);
        if (dist < 5) {
          return wire;
        }
      }
    }
    return null;
  };

  const pointToLineDistance = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;
    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const deleteComponent = (id) => {
    const newComponents = components.filter(c => c.id !== id);
    const newWires = wires.filter(w => w.start.componentId !== id && w.end.componentId !== id);
    setComponents(newComponents);
    setWires(newWires);
    saveToHistory();
  };

  const toggleSwitch = (comp) => {
    const updatedComponents = components.map(c => 
      c.id === comp.id 
        ? { ...c, properties: { ...c.properties, closed: !c.properties.closed } }
        : c
    );
    setComponents(updatedComponents);
    saveToHistory();
  };

  // Simple circuit simulation
  const simulateCircuit = useCallback(() => {
    if (!simulation.running) return;

    // Create a deep copy of components to update
    let updatedComponents = components.map(comp => ({
      ...comp,
      properties: { ...comp.properties }
    }));

    // Reset all component states
    updatedComponents = updatedComponents.map(comp => {
      if (comp.type === 'led') {
        comp.properties.lit = false;
      } else if (comp.type === 'bulb') {
        comp.properties.lit = false;
        comp.properties.brightness = 0;
      } else if (comp.type === 'buzzer') {
        comp.properties.active = false;
      } else if (comp.type === 'motor') {
        comp.properties.rpm = 0;
      }
      return comp;
    });

    // Find all complete circuits
    const batteries = updatedComponents.filter(c => c.type === 'battery');
    
    batteries.forEach(battery => {
      // Trace circuit from battery positive to negative
      const visited = new Set();
      const circuit = traceCircuit(battery, battery.pins[0], battery.pins[1], visited, updatedComponents);
      
      if (circuit.complete) {
        // Calculate total resistance
        const totalResistance = circuit.components
          .filter(c => c.type === 'resistor')
          .reduce((sum, c) => sum + c.properties.resistance, 0) || 100;
        
        const current = battery.properties.voltage / totalResistance;
        
        // Update component states in the circuit
        circuit.components.forEach((comp, index) => {
          // Find the actual component in updatedComponents array
          const compIndex = updatedComponents.findIndex(c => c.id === comp.id);
          if (compIndex !== -1) {
            if (updatedComponents[compIndex].type === 'led' && current > 0.001 && current < 0.05) {
              updatedComponents[compIndex].properties.lit = true;
            } else if (updatedComponents[compIndex].type === 'bulb' && current > 0.001) {
              updatedComponents[compIndex].properties.lit = true;
              updatedComponents[compIndex].properties.brightness = Math.min(current * 100, 1);
            } else if (updatedComponents[compIndex].type === 'buzzer' && current > 0.001) {
              updatedComponents[compIndex].properties.active = true;
            } else if (updatedComponents[compIndex].type === 'motor' && current > 0.01) {
              updatedComponents[compIndex].properties.rpm = Math.min(current * 10000, updatedComponents[compIndex].properties.maxRpm);
            }
          }
        });
      }
    });

    // Update the state with the new component states
    setComponents(updatedComponents);
  }, [components, wires, simulation.running]);

  const traceCircuit = (startComp, startPin, endPin, visited, allComponents) => {
    const circuit = { complete: false, components: [] };
    const queue = [{ component: startComp, pin: startPin, path: [startComp] }];
    visited.add(`${startComp.id}-${startPin.id}`);

    while (queue.length > 0) {
      const { component, pin, path } = queue.shift();
      
      // Find all wires connected to this pin
      const connectedWires = wires.filter(w => 
        (w.start.componentId === component.id && w.start.id === pin.id) ||
        (w.end.componentId === component.id && w.end.id === pin.id)
      );

      for (const wire of connectedWires) {
        const otherEnd = wire.start.componentId === component.id && wire.start.id === pin.id
          ? wire.end 
          : wire.start;
        const otherComp = allComponents.find(c => c.id === otherEnd.componentId);
        
        if (!otherComp) continue;

        // Check if this is the target
        if (otherComp.id === startComp.id && otherEnd.id === endPin.id && path.length > 1) {
          circuit.complete = true;
          circuit.components = [...path];
          return circuit;
        }

        // For switches, check if they're closed
        if (otherComp.type === 'switch') {
          if (!otherComp.properties.closed) {
            continue; // Skip if switch is open
          }
          // If switch is closed, find the other pin to continue through
          const otherPin = otherComp.pins.find(p => p.id !== otherEnd.id);
          if (otherPin && !visited.has(`${otherComp.id}-${otherPin.id}`)) {
            visited.add(`${otherComp.id}-${otherPin.id}`);
            queue.push({ 
              component: otherComp, 
              pin: otherPin, 
              path: [...path, otherComp] 
            });
          }
        } else {
          // For non-switch components, explore all other pins
          for (const nextPin of otherComp.pins) {
            if (nextPin.id !== otherEnd.id && !visited.has(`${otherComp.id}-${nextPin.id}`)) {
              visited.add(`${otherComp.id}-${nextPin.id}`);
              queue.push({ 
                component: otherComp, 
                pin: nextPin, 
                path: [...path, otherComp] 
              });
            }
          }
        }
      }
    }

    return circuit;
  };

  useEffect(() => {
    if (simulation.running) {
      const interval = setInterval(() => {
        simulateCircuit();
      }, 100); // Run simulation every 100ms
      
      return () => clearInterval(interval);
    }
  }, [simulation.running, simulateCircuit]);

  // Draw everything on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
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

    // Draw wires
    ctx.lineWidth = 3;
    wires.forEach(wire => {
      const startComp = components.find(c => c.id === wire.start.componentId);
      const endComp = components.find(c => c.id === wire.end.componentId);
      if (startComp && endComp) {
        // Check if this wire is part of an active circuit
        let wireActive = false;
        if (simulation.running) {
          // Simple check: if both components it connects are "active"
          wireActive = (startComp.type === 'battery' || startComp.properties.lit || startComp.properties.active || 
                       endComp.properties.lit || endComp.properties.active);
        }
        
        ctx.strokeStyle = wireActive ? '#10b981' : '#6b7280';
        ctx.lineWidth = wireActive ? 4 : 3;
        
        ctx.beginPath();
        ctx.moveTo(startComp.x + wire.start.x, startComp.y + wire.start.y);
        ctx.lineTo(endComp.x + wire.end.x, endComp.y + wire.end.y);
        ctx.stroke();
        
        // Draw current flow animation
        if (wireActive) {
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 10]);
          ctx.lineDashOffset = -Date.now() / 50 % 20;
          ctx.beginPath();
          ctx.moveTo(startComp.x + wire.start.x, startComp.y + wire.start.y);
          ctx.lineTo(endComp.x + wire.end.x, endComp.y + wire.end.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    });

    // Draw temp wire
    if (tempWire && wireStart) {
      ctx.strokeStyle = '#3b82f6';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      const startComp = components.find(c => c.id === wireStart.componentId);
      if (startComp) {
        ctx.moveTo(startComp.x + wireStart.x, startComp.y + wireStart.y);
        ctx.lineTo(tempWire.end.x, tempWire.end.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Draw components
    components.forEach(comp => {
      // Update color based on state
      let displayColor = comp.color;
      if (comp.type === 'bulb' && comp.properties.lit) {
        displayColor = '#fbbf24'; // Yellow when lit
      } else if (comp.type === 'bulb' && !comp.properties.lit) {
        displayColor = '#6b7280'; // Gray when off
      } else if (comp.type === 'led' && comp.properties.lit) {
        displayColor = '#ff0000'; // Bright red when lit
      } else if (comp.type === 'led' && !comp.properties.lit) {
        displayColor = '#8b0000'; // Dark red when off
      }
      
      // Component body
      ctx.fillStyle = displayColor;
      ctx.fillRect(comp.x, comp.y, comp.width, comp.height);
      
      // Component border
      ctx.strokeStyle = selectedComponent?.id === comp.id ? '#3b82f6' : '#374151';
      ctx.lineWidth = selectedComponent?.id === comp.id ? 3 : 2;
      ctx.strokeRect(comp.x, comp.y, comp.width, comp.height);

      // Component name
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(comp.name, comp.x + comp.width / 2, comp.y + comp.height / 2);

      // Draw pins
      comp.pins.forEach(pin => {
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(comp.x + pin.x, comp.y + pin.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pin labels
        if (pin.label) {
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(pin.label, comp.x + pin.x, comp.y + pin.y - 8);
        }
      });

      // Special rendering for components
      if (comp.type === 'bulb' && comp.properties.lit) {
        // Draw realistic bulb glow
        const gradient = ctx.createRadialGradient(
          comp.x + comp.width / 2, 
          comp.y + comp.height / 2 - 10, 
          0,
          comp.x + comp.width / 2, 
          comp.y + comp.height / 2 - 10, 
          comp.width * 1.5
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 200, 0.8)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 0, 0.6)');
        gradient.addColorStop(0.7, 'rgba(255, 200, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(comp.x - 40, comp.y - 40, comp.width + 80, comp.height + 80);
        
        // Draw bulb filament
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(comp.x + 20, comp.y + 40);
        ctx.quadraticCurveTo(comp.x + 30, comp.y + 20, comp.x + 40, comp.y + 40);
        ctx.stroke();
        
        // Add "ON" text
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('ON!', comp.x + comp.width / 2, comp.y - 10);
      }

      if (comp.type === 'led' && comp.properties.lit) {
        // Draw glow effect
        const gradient = ctx.createRadialGradient(
          comp.x + comp.width / 2, 
          comp.y + comp.height / 2, 
          0,
          comp.x + comp.width / 2, 
          comp.y + comp.height / 2, 
          comp.width
        );
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(comp.x - 20, comp.y - 20, comp.width + 40, comp.height + 40);
        
        // Add "ON" text
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('ON!', comp.x + comp.width / 2, comp.y - 10);
      }

      if (comp.type === 'buzzer' && comp.properties.active) {
        // Draw sound waves
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(comp.x + comp.width / 2, comp.y + comp.height / 2, 15 * i, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      if (comp.type === 'motor' && comp.properties.rpm > 0) {
        // Draw rotation indicator
        ctx.save();
        ctx.translate(comp.x + comp.width / 2, comp.y + comp.height / 2);
        ctx.rotate((Date.now() / 1000 * comp.properties.rpm / 60) * Math.PI * 2);
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(20, 0);
        ctx.stroke();
        ctx.restore();
      }

      if (comp.type === 'switch') {
        // Draw switch state
        ctx.fillStyle = comp.properties.closed ? '#10b981' : '#ef4444';
        ctx.font = '10px sans-serif';
        ctx.fillText(comp.properties.closed ? 'ON' : 'OFF', comp.x + comp.width / 2, comp.y + comp.height - 5);
      }
    });
  }, [components, wires, selectedComponent, tempWire, wireStart, simulation.running]);

  useEffect(() => {
    draw();
  }, [draw]);

  const startChallenge = (challenge) => {
    // Clear the canvas
    setComponents([]);
    setWires([]);
    setHistory([]);
    setHistoryIndex(-1);
    setSimulation({ ...simulation, running: false });
    
    // Set challenge mode
    setChallengeMode(true);
    setCurrentChallenge(challenge);
    setChallengeCompleted(false);
  };

  const exitChallengeMode = () => {
    setChallengeMode(false);
    setCurrentChallenge(null);
    setChallengeCompleted(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CircuitBoard className="w-8 h-8 text-blue-600" />
            Circuit Playground
            {challengeMode && (
              <span className="text-sm font-normal text-purple-600 ml-2">
                Challenge Mode: {currentChallenge?.name}
              </span>
            )}
          </h1>
          
          <div className="flex items-center gap-4">
            {/* Undo/Redo buttons */}
            <div className="flex items-center gap-2 border-r pr-4">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className={`p-2 rounded-lg transition-colors ${
                  historyIndex > 0 
                    ? 'hover:bg-gray-100 text-gray-700' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-5 h-5" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className={`p-2 rounded-lg transition-colors ${
                  historyIndex < history.length - 1 
                    ? 'hover:bg-gray-100 text-gray-700' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setSimulation({ ...simulation, running: !simulation.running })}
              className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
                simulation.running 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {simulation.running ? (
                <>
                  <Pause className="w-5 h-5" />
                  Stop Simulation
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Simulation
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                setComponents([]);
                setWires([]);
                setSimulation({ ...simulation, running: false });
                saveToHistory();
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Component Palette */}
          <div className="col-span-3 bg-white rounded-lg shadow-sm p-4">
            {/* Challenge/Normal Mode Toggle */}
            <div className="mb-4">
              <button
                onClick={() => challengeMode ? exitChallengeMode() : setChallengeMode(true)}
                className={`w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  challengeMode 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Trophy className="w-5 h-5" />
                {challengeMode ? 'Exit Challenge Mode' : 'Challenge Mode'}
              </button>
            </div>

            {!challengeMode ? (
              <>
                <h2 className="text-lg font-semibold mb-4">Components</h2>
                <div className="space-y-2">
                  {Object.entries(componentTemplates).map(([type, template]) => {
                    const Icon = template.icon;
                    return (
                      <div
                        key={type}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('componentType', type);
                        }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: template.color }}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-gray-500">Drag to canvas</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : !currentChallenge ? (
              <>
                <h2 className="text-lg font-semibold mb-4">Select Challenge</h2>
                <div className="space-y-3">
                  {challenges.map(challenge => (
                    <div
                      key={challenge.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => startChallenge(challenge)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{challenge.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                      <p className="text-xs text-purple-600 font-medium">{challenge.xp} XP</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-4">Available Components</h2>
                <div className="space-y-2">
                  {currentChallenge.requirements.components.map(type => {
                    const template = componentTemplates[type];
                    const Icon = template.icon;
                    return (
                      <div
                        key={type}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('componentType', type);
                        }}
                        className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg cursor-move hover:bg-purple-100 transition-colors"
                      >
                        <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: template.color }}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-gray-500">Required</p>
                        </div>
                      </div>
                    );
                  })}
                  {/* Show optional components */}
                  {Object.entries(componentTemplates).map(([type, template]) => {
                    if (!currentChallenge.requirements.components.includes(type) &&
                        !['battery', 'switch'].includes(type)) {
                      const Icon = template.icon;
                      return (
                        <div
                          key={type}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('componentType', type);
                          }}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors opacity-75"
                        >
                          <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: template.color }}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-xs text-gray-500">Optional</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </>
            )}

            {/* Mode Selection */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Mode</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setMode('drag')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    mode === 'drag' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Hand className="w-4 h-4" />
                  Drag Components
                </button>
                <button
                  onClick={() => setMode('wire')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    mode === 'wire' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Add Wires
                </button>
                <button
                  onClick={() => setMode('delete')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    mode === 'delete' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="col-span-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-gray-300 rounded cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const type = e.dataTransfer.getData('componentType');
                  const rect = canvasRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  addComponent(type, x, y);
                }}
                onDoubleClick={(e) => {
                  const rect = canvasRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const clickedComponent = components.find(comp => 
                    x >= comp.x && x <= comp.x + comp.width &&
                    y >= comp.y && y <= comp.y + comp.height
                  );
                  if (clickedComponent && clickedComponent.type === 'switch') {
                    toggleSwitch(clickedComponent);
                  }
                }}
              />
            </div>
          </div>

          {/* Info Panel */}
          <div className="col-span-3 space-y-4">
            {/* Challenge Info */}
            {challengeMode && currentChallenge && (
              <div className={`rounded-lg p-4 ${
                challengeCompleted 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-purple-50 border border-purple-200'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-purple-900">
                    {currentChallenge.name}
                  </h3>
                  {challengeCompleted && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-purple-800 mb-3">{currentChallenge.description}</p>
                
                {challengeCompleted ? (
                  <div className="bg-green-100 rounded-lg p-3 mb-3">
                    <p className="text-green-800 font-medium">
                      🎉 Challenge Complete! +{currentChallenge.xp} XP
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-3">
                      <p className="text-xs font-medium text-purple-700">Requirements:</p>
                      <ul className="text-xs text-purple-600 space-y-1">
                        {currentChallenge.requirements.mustLight && (
                          <li>• Light up: {currentChallenge.requirements.mustLight.join(', ')}</li>
                        )}
                        {currentChallenge.requirements.mustActivate && (
                          <li>• Activate: {currentChallenge.requirements.mustActivate.join(', ')}</li>
                        )}
                        {currentChallenge.requirements.maxComponents && (
                          <li>• Max {currentChallenge.requirements.maxComponents} components</li>
                        )}
                      </ul>
                    </div>
                    
                    {/* Hints */}
                    <details className="text-xs">
                      <summary className="cursor-pointer text-purple-600 hover:text-purple-700">
                        Need hints?
                      </summary>
                      <ol className="mt-2 space-y-1 text-purple-600">
                        {currentChallenge.hints.map((hint, index) => (
                          <li key={index}>{index + 1}. {hint}</li>
                        ))}
                      </ol>
                    </details>
                  </>
                )}
                
                <button
                  onClick={exitChallengeMode}
                  className="mt-3 w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  {challengeCompleted ? 'Next Challenge' : 'Exit Challenge'}
                </button>
              </div>
            )}

            {/* Tutorial */}
            {showTutorial && !challengeMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-blue-900">Quick Tutorial</h3>
                  <button
                    onClick={() => setShowTutorial(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Drag components from the left panel</li>
                  <li>2. Click "Add Wires" mode</li>
                  <li>3. Click pins to connect components</li>
                  <li>4. Double-click switches to toggle</li>
                  <li>5. Click "Start Simulation" to run!</li>
                  <li>6. Use Ctrl+Z/Y for undo/redo</li>
                </ol>
              </div>
            )}

            {/* Selected Component Info */}
            {selectedComponent && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold mb-3">Component Properties</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Type:</span>
                    <p className="font-medium">{selectedComponent.name}</p>
                  </div>
                  {Object.entries(selectedComponent.properties).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-sm text-gray-500 capitalize">{key}:</span>
                      <p className="font-medium">{typeof value === 'boolean' ? value ? 'Yes' : 'No' : value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Circuit Status */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3">Circuit Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Simulation:</span>
                  <span className={`font-medium ${simulation.running ? 'text-green-600' : 'text-gray-600'}`}>
                    {simulation.running ? 'Running' : 'Stopped'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Components:</span>
                  <span className="font-medium">{components.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Wires:</span>
                  <span className="font-medium">{wires.length}</span>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Debug Info:</p>
                  {components.filter(c => c.type === 'switch').map(sw => (
                    <div key={sw.id} className="text-xs">
                      Switch: {sw.properties.closed ? 'ON' : 'OFF'}
                    </div>
                  ))}
                  {components.filter(c => c.type === 'led' || c.type === 'bulb').map(light => (
                    <div key={light.id} className="text-xs">
                      {light.name}: {light.properties.lit ? 'LIT' : 'OFF'}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Tips</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• LEDs need a resistor to limit current</li>
                <li>• Connect battery + to - to complete circuit</li>
                <li>• Motors need more current than LEDs</li>
                <li>• Use switches to control flow</li>
                <li>• Press Ctrl+Z to undo mistakes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitPlayground;