import { Vector3 } from 'three';

export type AppMode = 'runner' | 'zoetrope';

export interface SimulationConfig {
  strandCount: number;
  segmentsPerStrand: number;
  gravity: number; // Vertical gravity
  drag: number;
  stiffness: number;
  windForce: number;
  colorA: string;
  colorB: string;
  colorC: string;
  baseThickness: number;
  taper: number;
}

export interface ZoetropeConfig {
  distribution: 'circle' | 'helix' | 'phyllotaxis';
  shape: 'sphere' | 'box' | 'torus' | 'superquadric';
  frames: number;
  radius: number;
  baseScale: number;
  scaleVar: number;
  startAngle: number;
  layers: number;
  layerStep: number;
  morph: number;
  bend: number;
  deform: number;
  noiseScale: number;
  palette: 'aurora' | 'sunset' | 'mono' | 'neon';
  autoRotate: boolean;
}

export interface BoneBinding {
  boneName: string;
  boneIndex: number;
  offset: Vector3;
}
