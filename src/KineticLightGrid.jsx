import React, { useEffect, useRef, useState } from 'react';
import { Sliders } from 'lucide-react';

const KineticLightGrid = () => {
  const canvasRef = useRef(null);
  const [gridDensity, setGridDensity] = useState(60);
  const [falloff, setFalloff] = useState(150);
  const [attraction, setAttraction] = useState(0.15);
  const [physicsMode, setPhysicsMode] = useState('attract');
  const [emitterSpeed, setEmitterSpeed] = useState(0.015);
  const [pathStyle, setPathStyle] = useState('circle');
  const [depthEffect, setDepthEffect] = useState(true);
  const [showControls, setShowControls] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    
    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Point class
    class Point {
      constructor(x, y, gridIndex, totalPoints) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        // Depth layer (0.3 to 1.0, based on grid position)
        this.depth = 0.3 + (gridIndex / totalPoints) * 0.7;
      }
      
      update(emitterX, emitterY, attractionForce, maxDist, mode, useDepth) {
        // Calculate distance to emitter
        const dx = emitterX - this.x;
        const dy = emitterY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Apply depth-based force scaling
        const depthScale = useDepth ? this.depth : 1.0;
        
        // Apply force based on physics mode
        if (dist < maxDist && dist > 0) {
          const forceMagnitude = attractionForce * (1 - dist / maxDist) * depthScale;
          
          switch(mode) {
            case 'attract':
              this.vx += (dx / dist) * forceMagnitude;
              this.vy += (dy / dist) * forceMagnitude;
              break;
              
            case 'repel':
              this.vx -= (dx / dist) * forceMagnitude;
              this.vy -= (dy / dist) * forceMagnitude;
              break;
              
            case 'orbit':
              const perpX = -dy / dist;
              const perpY = dx / dist;
              this.vx += perpX * forceMagnitude;
              this.vy += perpY * forceMagnitude;
              break;
              
            case 'wave':
              const phase = (dist / maxDist) * Math.PI * 2;
              const waveFactor = Math.sin(phase - Date.now() * 0.003);
              this.vx += (dx / dist) * forceMagnitude * waveFactor;
              this.vy += (dy / dist) * forceMagnitude * waveFactor;
              break;
          }
        }
        
        // Spring force back to base position
        const returnForceX = (this.baseX - this.x) * 0.1;
        const returnForceY = (this.baseY - this.y) * 0.1;
        this.vx += returnForceX;
        this.vy += returnForceY;
        
        // Damping
        this.vx *= 0.85;
        this.vy *= 0.85;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
      }
      
      draw(ctx, emitterX, emitterY, maxDist, useDepth) {
        const dx = emitterX - this.x;
        const dy = emitterY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate illumination
        let brightness = 0;
        if (dist < maxDist) {
          brightness = 1 - (dist / maxDist);
          brightness = Math.pow(brightness, 1.5);
        }
        
        // Apply depth to size and brightness
        const depthScale = useDepth ? this.depth : 1.0;
        const baseSize = 2 + brightness * 2;
        const size = baseSize * (0.5 + depthScale * 0.5);
        const depthBrightness = brightness * (0.4 + depthScale * 0.6);
        
        // Neon green to purple to grey gradient
        let r, g, b;
        
        if (depthBrightness > 0.5) {
          const t = (depthBrightness - 0.5) * 2;
          r = Math.floor(138 + (57 - 138) * t);
          g = Math.floor(43 + (255 - 43) * t);
          b = Math.floor(226 + (20 - 226) * t);
        } else {
          const t = depthBrightness * 2;
          r = Math.floor(80 + (138 - 80) * t);
          g = Math.floor(80 + (43 - 80) * t);
          b = Math.floor(80 + (226 - 80) * t);
        }
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Initialize grid
    let points = [];
    const initGrid = (density) => {
      points = [];
      const spacing = Math.min(canvas.width, canvas.height) / (density + 1);
      const offsetX = (canvas.width - (density - 1) * spacing) / 2;
      const offsetY = (canvas.height - (density - 1) * spacing) / 2;
      
      let index = 0;
      const totalPoints = density * density;
      
      for (let i = 0; i < density; i++) {
        for (let j = 0; j < density; j++) {
          points.push(new Point(
            offsetX + i * spacing,
            offsetY + j * spacing,
            index++,
            totalPoints
          ));
        }
      }
    };
    
    initGrid(gridDensity);
    
    // Emitter state - start at top of circle (-Math.PI/2)
    let angle = -Math.PI / 2;
    const orbitRadius = Math.min(canvas.width, canvas.height) * 0.25;
    
    // Easing function
    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    // Triangle path calculation
    const getTrianglePosition = (progress) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const size = orbitRadius * 1.5;
      
      const vertices = [
        { x: centerX, y: centerY - size },
        { x: centerX + size * Math.cos(Math.PI / 6), y: centerY + size * Math.sin(Math.PI / 6) },
        { x: centerX - size * Math.cos(Math.PI / 6), y: centerY + size * Math.sin(Math.PI / 6) }
      ];
      
      const segment = Math.floor(progress * 3);
      const segmentProgress = (progress * 3) % 1;
      const easedProgress = easeInOutCubic(segmentProgress);
      
      const startVertex = vertices[segment];
      const endVertex = vertices[(segment + 1) % 3];
      
      return {
        x: startVertex.x + (endVertex.x - startVertex.x) * easedProgress,
        y: startVertex.y + (endVertex.y - startVertex.y) * easedProgress
      };
    };
    
    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgb(20, 20, 25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update emitter position
      let emitterX, emitterY;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      if (pathStyle === 'circle') {
        emitterX = centerX + Math.cos(angle) * orbitRadius;
        emitterY = centerY + Math.sin(angle) * orbitRadius;
        angle += emitterSpeed;
      } else {
        const progress = (angle / (Math.PI * 2)) % 1;
        const pos = getTrianglePosition(progress);
        emitterX = pos.x;
        emitterY = pos.y;
        angle += emitterSpeed;
      }
      
      // Update and draw points
      for (const point of points) {
        point.update(emitterX, emitterY, attraction, falloff, physicsMode, depthEffect);
        point.draw(ctx, emitterX, emitterY, falloff, depthEffect);
      }
      
      // Draw emitter
      ctx.fillStyle = '#39FF14';
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#39FF14';
      ctx.beginPath();
      ctx.arc(emitterX, emitterY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [gridDensity, falloff, attraction, physicsMode, emitterSpeed, pathStyle, depthEffect]);
  
  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      
      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute top-4 right-4 z-20 bg-slate-800/80 hover:bg-slate-700/80 text-white p-3 rounded-lg backdrop-blur-sm transition-colors"
      >
        <Sliders size={20} />
      </button>
      
      {showControls && (
        <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-md p-6 rounded-xl shadow-2xl z-10 w-80">
          <h2 className="text-white font-semibold text-lg mb-4">Kinetic Controls</h2>
          
          <div className="space-y-5">
            <div>
              <label className="text-slate-300 text-sm block mb-2">
                Path Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPathStyle('circle')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathStyle === 'circle' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Circle
                </button>
                <button
                  onClick={() => setPathStyle('triangle')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathStyle === 'triangle' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Triangle
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-slate-300 text-sm flex items-center justify-between mb-2">
                <span>Depth Effect</span>
                <button
                  onClick={() => setDepthEffect(!depthEffect)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    depthEffect 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {depthEffect ? 'ON' : 'OFF'}
                </button>
              </label>
              <p className="text-xs text-slate-400">
                Simulates depth layers with varying point sizes and movement speeds
              </p>
            </div>
            
            <div>
              <label className="text-slate-300 text-sm block mb-2">
                Physics Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPhysicsMode('attract')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    physicsMode === 'attract' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Attract
                </button>
                <button
                  onClick={() => setPhysicsMode('repel')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    physicsMode === 'repel' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Repel
                </button>
                <button
                  onClick={() => setPhysicsMode('orbit')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    physicsMode === 'orbit' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Orbit
                </button>
                <button
                  onClick={() => setPhysicsMode('wave')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    physicsMode === 'wave' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Wave
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-slate-300 text-sm block mb-2">
                Grid Density: {gridDensity}×{gridDensity}
              </label>
              <input
                type="range"
                min="20"
                max="100"
                value={gridDensity}
                onChange={(e) => setGridDensity(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Sparse</span>
                <span>Dense</span>
              </div>
            </div>
            
            <div>
              <label className="text-slate-300 text-sm block mb-2">
                Illumination Radius: {Math.round(falloff)}px
              </label>
              <input
                type="range"
                min="50"
                max="300"
                value={falloff}
                onChange={(e) => setFalloff(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Sharp</span>
                <span>Soft</span>
              </div>
            </div>
            
            <div>
              <label className="text-slate-300 text-sm block mb-2">
                Emitter Speed: {emitterSpeed.toFixed(3)}
              </label>
              <input
                type="range"
                min="0.002"
                max="0.04"
                step="0.001"
                value={emitterSpeed}
                onChange={(e) => setEmitterSpeed(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>
            
            <div>
              <label className="text-slate-300 text-sm block mb-2">
                Force Strength: {attraction.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={attraction}
                onChange={(e) => setAttraction(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Light Only</span>
                <span>Strong Force</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-slate-400 text-xs">
              Experiment with different physics modes and path styles to create unique effects.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KineticLightGrid;

