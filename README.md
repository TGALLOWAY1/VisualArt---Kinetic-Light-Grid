# Kinetic Light Grid (Visual Art)

# Kinetic Light Grid - Interactive Visual Art Project
<img width="701" height="695" alt="image" src="https://github.com/user-attachments/assets/4ffc2953-db37-46ee-89e2-2b455931750a" />

## Overview

Kinetic Light Grid is an interactive web-based visual art application that creates mesmerizing particle animations through physics-based interactions. A grid of illuminated points responds dynamically to a moving light emitter, creating beautiful kinetic patterns with depth, color gradients, and fluid motion.

## Features

### 🎨 Visual Effects
- **Dynamic Grid System**: Configurable grid density (20×20 to 100×100 points) that responds in real-time
- **Depth Simulation**: Optional depth layers that affect point size, brightness, and movement speed
- **Color Gradient**: Neon green to purple to grey gradient based on illumination intensity
- **Smooth Animation**: 60fps canvas-based rendering with optimized physics calculations

### ⚡ Physics Modes
- **Attract**: Points are drawn toward the emitter
- **Repel**: Points are pushed away from the emitter
- **Orbit**: Points orbit around the emitter in circular patterns
- **Wave**: Points respond with wave-like oscillations

### 🎯 Path Styles
- **Circle**: Emitter follows a smooth circular orbit (starts at top)
- **Triangle**: Emitter follows a triangular path with eased transitions

### 🎛️ Interactive Controls
- **Grid Density**: Adjust the number of points in the grid
- **Illumination Radius**: Control the light falloff distance (50-300px)
- **Emitter Speed**: Adjust animation speed (0.002-0.04)
- **Force Strength**: Control the intensity of physics interactions (0-0.5)
- **Depth Effect Toggle**: Enable/disable depth-based rendering
- **Collapsible Control Panel**: Clean UI with toggleable settings panel

## Technical Stack

- **React 18** - Component framework with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Canvas API** - High-performance 2D rendering
- **lucide-react** - Icon library

## Key Implementation Details

### Physics System
- Spring-based return forces bring points back to their base positions
- Velocity damping (0.85) for smooth, natural motion
- Distance-based force calculations with configurable falloff
- Depth-aware force scaling for layered visual effects

### Rendering
- Real-time canvas updates using `requestAnimationFrame`
- Dynamic brightness calculations based on distance to emitter
- Responsive canvas sizing that adapts to window dimensions
- Optimized point drawing with minimal redraws

### Performance
- Efficient point class with update/draw separation
- Single animation loop managing all physics and rendering
- Proper cleanup of event listeners and animation frames

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173` (or the port shown in terminal).


## Future Enhancements
Potential additions for future iterations:
- Additional path styles (square, figure-8, custom)
- Multiple emitters
- Particle trails
- Color scheme customization
- Export animation as video/GIF
- Touch/mouse interaction for manual emitter control


