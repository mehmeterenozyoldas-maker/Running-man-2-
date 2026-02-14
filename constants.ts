import { Vector3 } from 'three';
import { SimulationConfig, ZoetropeConfig } from './types';

export const SIMULATION_CONFIG: SimulationConfig = {
  strandCount: 1500, // Number of hairs
  segmentsPerStrand: 8, // Resolution of each hair
  gravity: -9.8,
  drag: 0.80, // Air resistance (lower = more damping)
  stiffness: 0.75, // Constraint solving (1 = rigid, 0 = elastic)
  windForce: 2.0,
  colorA: '#00ffff', // Cyan
  colorB: '#ff00ff', // Magenta
  colorC: '#ffff00', // Electric Yellow
  baseThickness: 1.0,
  taper: 0.8, // 0 = no taper, 1 = point
};

export const ZOETROPE_CONFIG: ZoetropeConfig = {
  distribution: 'helix',
  shape: 'superquadric',
  frames: 48,
  radius: 2.2,
  baseScale: 0.20,
  scaleVar: 0.10,
  startAngle: 0,
  layers: 8,
  layerStep: 0.12,
  morph: 0.4,
  bend: 0.6,
  deform: 0.9,
  noiseScale: 1.4,
  palette: 'neon',
  autoRotate: true,
};

export const PRESETS: Record<string, SimulationConfig> = {
  "Neon Runner": { ...SIMULATION_CONFIG },
  "Ghostly Wisp": {
    strandCount: 2000,
    segmentsPerStrand: 10,
    gravity: -1.0,
    drag: 0.94,
    stiffness: 0.3,
    windForce: 1.0,
    colorA: '#b2ebf2',
    colorB: '#80deea',
    colorC: '#ffffff',
    baseThickness: 0.5,
    taper: 1.0,
  },
  "Cyber Punk": {
    strandCount: 1200,
    segmentsPerStrand: 6,
    gravity: -15.0,
    drag: 0.80,
    stiffness: 0.9,
    windForce: 0.5,
    colorA: '#ff0055',
    colorB: '#2200cc',
    colorC: '#00ff99',
    baseThickness: 2.2,
    taper: 0.4,
  },
  "Deep Sea": {
    strandCount: 2500,
    segmentsPerStrand: 12,
    gravity: -0.2,
    drag: 0.98,
    stiffness: 0.15,
    windForce: 3.0,
    colorA: '#001f3f',
    colorB: '#0074D9',
    colorC: '#39CCCC',
    baseThickness: 0.8,
    taper: 0.7,
  },
  "Solar Flare": {
    strandCount: 1800,
    segmentsPerStrand: 8,
    gravity: 1.5, // Negative gravity makes it rise
    drag: 0.88,
    stiffness: 0.5,
    windForce: 5.0,
    colorA: '#85144b',
    colorB: '#FF4136',
    colorC: '#FFDC00',
    baseThickness: 1.2,
    taper: 0.9,
  },
  "Void Walker": {
    strandCount: 2200,
    segmentsPerStrand: 12,
    gravity: -0.5,
    drag: 0.96,
    stiffness: 0.2,
    windForce: 0.8,
    colorA: '#000000',
    colorB: '#220033',
    colorC: '#4b0082', // Indigo
    baseThickness: 1.5,
    taper: 0.2,
  },
  "Pixel Glitch": {
    strandCount: 1000,
    segmentsPerStrand: 6,
    gravity: -5.0,
    drag: 0.75, // Low drag = chaotic
    stiffness: 0.95, // High stiffness = rigid/jittery
    windForce: 8.0,
    colorA: '#00ff00',
    colorB: '#ff00ff',
    colorC: '#ffffff',
    baseThickness: 2.0,
    taper: 0.0,
  },
  "Golden Thread": {
    strandCount: 1600,
    segmentsPerStrand: 10,
    gravity: -12.0, // Heavy
    drag: 0.90,
    stiffness: 0.1, // Very loose
    windForce: 1.5,
    colorA: '#FFD700', // Gold
    colorB: '#DAA520', // Goldenrod
    colorC: '#FFF8DC', // Cornsilk
    baseThickness: 0.6,
    taper: 0.5,
  },
  "Ethereal Angel": {
    strandCount: 2800,
    segmentsPerStrand: 14,
    gravity: 0.8, // Floats up slowly
    drag: 0.97, // Very slow damping
    stiffness: 0.25,
    windForce: 1.2,
    colorA: '#E0FFFF', // Light Cyan
    colorB: '#F0FFFF', // Azure
    colorC: '#FFB6C1', // Light Pink
    baseThickness: 0.4,
    taper: 1.0,
  },
  "Toxic Sludge": {
    strandCount: 1400,
    segmentsPerStrand: 8,
    gravity: -8.0,
    drag: 0.92,
    stiffness: 0.4,
    windForce: 0.5,
    colorA: '#7FFF00', // Chartreuse
    colorB: '#32CD32', // Lime Green
    colorC: '#006400', // Dark Green
    baseThickness: 3.0, // Thick
    taper: 0.3,
  }
};

export const MODEL_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Soldier.glb';
