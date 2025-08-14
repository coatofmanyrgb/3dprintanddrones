import React, { useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Zap, Activity, Settings } from 'lucide-react';

const Oscilloscope = ({ data, running, voltage, current }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#1a4d2e';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw center lines
    ctx.strokeStyle = '#2d6a4f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Draw waveform
    if (data.length > 1) {
      // Voltage waveform
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ff00';
      
      ctx.beginPath();
      data.forEach((point, index) => {
        const x = (index / data.length) * width;
        const y = height / 2 - (point.voltage / 20) * (height / 2);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // Current waveform
      ctx.strokeStyle = '#ffff00';
      ctx.shadowColor = '#ffff00';
      
      ctx.beginPath();
      data.forEach((point, index) => {
        const x = (index / data.length) * width;
        const y = height / 2 - (point.current * 100) * (height / 2);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw measurements
    ctx.fillStyle = '#00ff00';
    ctx.font = '14px monospace';
    ctx.fillText(`V: ${voltage.toFixed(2)}V`, 10, 20);
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`I: ${current.toFixed(3)}A`, 10, 40);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText(`P: ${(voltage * current).toFixed(2)}W`, 10, 60);
    
    if (running) {
      ctx.fillStyle = '#00ff00';
      ctx.fillText('● RUNNING', width - 80, 20);
    } else {
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('● STOPPED', width - 80, 20);
    }
    
  }, [data, running, voltage, current]);
  
  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Oscilloscope
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-green-400">CH1: Voltage</span>
          <span className="text-yellow-400">CH2: Current</span>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        className="w-full rounded bg-black"
        style={{ imageRendering: 'crisp-edges' }}
      />
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-gray-800 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Frequency</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-white font-bold">60 Hz</p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Peak Voltage</span>
            <Zap className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-white font-bold">{Math.max(...data.map(d => d.voltage || 0)).toFixed(2)} V</p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">RMS Current</span>
            <Activity className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-white font-bold">{(current * 0.707).toFixed(3)} A</p>
        </div>
      </div>
    </div>
  );
};

export default Oscilloscope;