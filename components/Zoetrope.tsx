import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ZoetropeConfig } from '../types';

interface ZoetropeProps {
  config: ZoetropeConfig;
}

export const Zoetrope: React.FC<ZoetropeProps> = ({ config }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Geometry Generation
  const geometry = useMemo(() => {
    switch (config.shape) {
      case 'box': return new THREE.BoxGeometry(1, 1, 1);
      case 'torus': return new THREE.TorusGeometry(0.7, 0.25, 16, 24);
      case 'sphere': return new THREE.SphereGeometry(0.85, 32, 16);
      case 'superquadric':
      default: {
        const uSeg = 32, vSeg = 20, rad = 0.85;
        const geo = new THREE.SphereGeometry(rad, uSeg, vSeg);
        const pos = geo.attributes.position;
        const e = 0.8 + 0.4 * config.morph;
        const n = 1.0 + 1.0 * (1.0 - config.morph);
        
        const tempVec = new THREE.Vector3();
        
        for (let i = 0; i < pos.count; i++) {
          tempVec.fromBufferAttribute(pos, i);
          const { x, y, z } = tempVec;
          
          const r = Math.sqrt(x*x + y*y + z*z) || 1e-6;
          const nx = x/r, ny = y/r, nz = z/r;
          
          const u = Math.asin(Math.max(-1, Math.min(1, nz)));
          const v = Math.atan2(ny, nx);
          
          const cu = Math.cos(u), su = Math.sin(u);
          const cv = Math.cos(v), sv = Math.sin(v);
          
          const sp = (val: number, p: number) => Math.sign(val || 1) * Math.pow(Math.abs(val), p);
          
          const sx = rad * sp(cu, e) * sp(cv, n);
          const sy = rad * sp(cu, e) * sp(sv, n);
          const sz = rad * sp(su, e);
          
          pos.setXYZ(i, sx, sy, sz);
        }
        geo.computeVertexNormals();
        return geo;
      }
    }
  }, [config.shape, config.morph]);

  // Color Palette Logic
  const colors = useMemo(() => {
    const getPalette = (name: string) => {
      if (name === 'sunset') return [0xff8a66, 0xff66d1];
      if (name === 'mono') return [0x99a6c9, 0x3a4663];
      if (name === 'aurora') return [0x99d8ff, 0xd0b3ff];
      return [0x00ffff, 0xff00ff]; // neon
    };
    
    const pal = getPalette(config.palette);
    const c1 = new THREE.Color(pal[0]);
    const c2 = new THREE.Color(pal[1]);
    const count = Math.max(1, Math.floor(config.frames));
    const data = new Float32Array(count * 3);
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      tempColor.copy(c1).lerp(c2, i / (count - 1 || 1));
      data[i * 3 + 0] = tempColor.r;
      data[i * 3 + 1] = tempColor.g;
      data[i * 3 + 2] = tempColor.b;
    }
    return data;
  }, [config.palette, config.frames]);

  // Instance Positioning
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    
    const dummy = new THREE.Object3D();
    const N = Math.max(1, Math.floor(config.frames));
    
    for (let i = 0; i < N; i++) {
      // Calculate position
      const a = THREE.MathUtils.degToRad(config.startAngle) + Math.PI * 2 * (i / N);
      const r = config.radius;
      const layer = Math.floor((i / N) * config.layers);
      const yBase = -(layer * config.layerStep);
      
      let pos = new THREE.Vector3();
      
      if (config.distribution === 'circle') {
        pos.set(Math.cos(a) * r, yBase, Math.sin(a) * r);
      } else if (config.distribution === 'phyllotaxis') {
        const ga = THREE.MathUtils.degToRad(137.5);
        const rr = r * Math.sqrt(i / Math.max(1, N - 1));
        const ang = THREE.MathUtils.degToRad(config.startAngle) + i * ga;
        pos.set(Math.cos(ang) * rr, yBase, Math.sin(ang) * rr);
      } else {
        // Helix
        const y2 = yBase - i * (config.layerStep / Math.max(1, N));
        pos.set(Math.cos(a) * r, y2, Math.sin(a) * r);
      }

      // Calculate Scale with variance
      const variance = Math.sin(i * 0.55);
      const sc = Math.max(0.001, config.baseScale + config.scaleVar * variance);

      // Set transform
      dummy.position.copy(pos);
      // Face outward
      dummy.rotation.y = Math.atan2(pos.z, pos.x) - Math.PI / 2;
      // Bend
      dummy.rotation.z = config.bend * THREE.MathUtils.clamp((pos.y / (config.layers * config.layerStep)) || 0, -1, 1);
      
      dummy.scale.setScalar(sc);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [config, geometry]); // Update when config or geometry changes

  useFrame(() => {
    if (config.autoRotate && groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, undefined, config.frames]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
            roughness={0.2} 
            metalness={0.8} 
            emissiveIntensity={0.2}
            emissive={new THREE.Color(0x222222)}
        />
        <instancedBufferAttribute 
            attach="instanceColor" 
            args={[colors, 3]} 
        />
      </instancedMesh>
    </group>
  );
};
