import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_URL } from '../constants';
import { createNoise3D } from 'simplex-noise';
import { SimulationConfig } from '../types';

interface StringCharacterProps {
  isPlaying: boolean;
  config: SimulationConfig;
}

// Reuse geometries and materials
// Increased radius slightly to allow scaling down, better for shadows
const segmentGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 5); 
segmentGeometry.translate(0, 0.5, 0); // Pivot at base
segmentGeometry.rotateX(Math.PI / 2); // Point along Z

const baseMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#ffffff'),
  roughness: 0.3,
  metalness: 0.6,
  emissive: new THREE.Color('#111111'),
  emissiveIntensity: 0.1,
});

export const StringCharacter: React.FC<StringCharacterProps> = ({ isPlaying, config }) => {
  const group = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const colorAttributeRef = useRef<THREE.InstancedBufferAttribute>(null);
  
  // Load model
  const { nodes, animations } = useGLTF(MODEL_URL) as any;
  const { actions, mixer } = useAnimations(animations, group);

  // Simulation State - Only re-create if topology changes (count/segments)
  const simData = useMemo(() => {
    const { strandCount, segmentsPerStrand } = config;
    
    // Physics arrays
    const totalPoints = strandCount * segmentsPerStrand;
    const positions = new Float32Array(totalPoints * 3);
    const prevPositions = new Float32Array(totalPoints * 3);
    
    // Instance matrices (count * segments)
    const instanceCount = strandCount * (segmentsPerStrand - 1);
    
    // Pre-calculate bone attachments
    const boneNames = [
        'mixamorigHead', 'mixamorigNeck', 
        'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2',
        'mixamorigLeftArm', 'mixamorigLeftForeArm', 'mixamorigLeftHand',
        'mixamorigRightArm', 'mixamorigRightForeArm', 'mixamorigRightHand',
        'mixamorigLeftUpLeg', 'mixamorigLeftLeg', 'mixamorigLeftFoot',
        'mixamorigRightUpLeg', 'mixamorigRightLeg', 'mixamorigRightFoot'
    ];
    
    const attachments = [];
    for (let i = 0; i < strandCount; i++) {
        const boneName = boneNames[Math.floor(Math.random() * boneNames.length)];
        const offset = new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
        );
        attachments.push({ boneName, offset });
    }
    
    // Initial Color Buffer Allocation
    const colors = new Float32Array(instanceCount * 3);
    
    return { positions, prevPositions, attachments, instanceCount, colors };
  }, [config.strandCount, config.segmentsPerStrand]);

  // Separate effect to update colors without resetting simulation
  useEffect(() => {
    if (!colorAttributeRef.current) return;
    
    const { strandCount, segmentsPerStrand, colorA, colorB, colorC } = config;
    const array = colorAttributeRef.current.array as Float32Array;
    
    const cA = new THREE.Color(colorA);
    const cB = new THREE.Color(colorB);
    const cC = new THREE.Color(colorC);
    const scratchColor = new THREE.Color();

    for (let s = 0; s < strandCount; s++) {
        const strandHueOffset = Math.abs(Math.sin(s * 12.9898) * 43758.5453) % 1;

        for (let i = 0; i < segmentsPerStrand - 1; i++) {
             const instanceIdx = s * (segmentsPerStrand - 1) + i;
             const t = i / segmentsPerStrand;
             
             // Mix colors
             scratchColor.copy(cA).lerp(cB, t).lerp(cC, t * t);
             scratchColor.offsetHSL(strandHueOffset * 0.1, 0, 0);
             
             array[instanceIdx * 3 + 0] = scratchColor.r;
             array[instanceIdx * 3 + 1] = scratchColor.g;
             array[instanceIdx * 3 + 2] = scratchColor.b;
        }
    }
    colorAttributeRef.current.needsUpdate = true;
  }, [simData, config.colorA, config.colorB, config.colorC, config.strandCount, config.segmentsPerStrand]);

  // Noise for wind
  const noise3D = useMemo(() => createNoise3D(), []);
  
  // Animation Setup
  useEffect(() => {
    if (actions['Run']) {
      actions['Run'].reset().fadeIn(0.5).play();
    }
    return () => {
      actions['Run']?.fadeOut(0.5);
    };
  }, [actions]);

  // Pause/Play mixer
  useEffect(() => {
    if (mixer) {
        mixer.timeScale = isPlaying ? 1 : 0;
    }
  }, [isPlaying, mixer]);

  const tempVec3 = new THREE.Vector3();
  const tempObj = new THREE.Object3D();
  const rootPos = new THREE.Vector3();
  
  // Physics Loop
  useFrame((state, delta) => {
    if (!meshRef.current || !group.current) return;
    
    const dt = Math.min(delta, 0.05) * (isPlaying ? 1 : 0);
    const time = state.clock.elapsedTime;
    
    const { positions, prevPositions, attachments } = simData;
    const { strandCount, segmentsPerStrand, gravity, drag, stiffness, windForce, baseThickness, taper } = config;
    
    // Find bones in scene graph map
    const boneMap: Record<string, THREE.Bone> = {};
    group.current.traverse((obj) => {
        if ((obj as THREE.Bone).isBone) {
            boneMap[obj.name] = obj as THREE.Bone;
        }
    });

    // 1. UPDATE ROOTS & PHYSICS
    for (let s = 0; s < strandCount; s++) {
        // --- Handle Root (Segment 0) ---
        const attach = attachments[s];
        const bone = boneMap[attach.boneName];
        
        let rootIdx = s * segmentsPerStrand;
        
        if (bone) {
            rootPos.copy(attach.offset).applyMatrix4(bone.matrixWorld);
            
            positions[rootIdx * 3 + 0] = rootPos.x;
            positions[rootIdx * 3 + 1] = rootPos.y;
            positions[rootIdx * 3 + 2] = rootPos.z;
            
            prevPositions[rootIdx * 3 + 0] = rootPos.x;
            prevPositions[rootIdx * 3 + 1] = rootPos.y;
            prevPositions[rootIdx * 3 + 2] = rootPos.z;
        }

        // --- Handle Tail Segments (Verlet Integration) ---
        for (let i = 1; i < segmentsPerStrand; i++) {
            const idx = rootIdx + i;
            
            const px = positions[idx * 3 + 0];
            const py = positions[idx * 3 + 1];
            const pz = positions[idx * 3 + 2];
            
            const ox = prevPositions[idx * 3 + 0];
            const oy = prevPositions[idx * 3 + 1];
            const oz = prevPositions[idx * 3 + 2];
            
            let vx = (px - ox) * drag;
            let vy = (py - oy) * drag;
            let vz = (pz - oz) * drag;
            
            vy += gravity * dt * dt;
            
            const nScale = 0.5;
            const windX = noise3D(px * nScale, py * nScale, time * 0.5) * windForce * dt * dt;
            const windY = noise3D(px * nScale, pz * nScale, time * 0.5 + 100) * windForce * dt * dt;
            const windZ = noise3D(py * nScale, time * 0.5, pz * nScale) * windForce * dt * dt;
            
            vx += windX;
            vy += windY;
            vz += windZ;

            prevPositions[idx * 3 + 0] = px;
            prevPositions[idx * 3 + 1] = py;
            prevPositions[idx * 3 + 2] = pz;
            
            positions[idx * 3 + 0] = px + vx;
            positions[idx * 3 + 1] = py + vy;
            positions[idx * 3 + 2] = pz + vz;
        }
    }

    // 2. CONSTRAINTS
    const iterations = 5; // Increased for stability
    const segLen = 0.15;
    
    for (let k = 0; k < iterations; k++) {
        for (let s = 0; s < strandCount; s++) {
            const rootIdx = s * segmentsPerStrand;
            for (let i = 0; i < segmentsPerStrand - 1; i++) {
                const idx1 = rootIdx + i;
                const idx2 = rootIdx + i + 1;
                
                const p1x = positions[idx1 * 3 + 0];
                const p1y = positions[idx1 * 3 + 1];
                const p1z = positions[idx1 * 3 + 2];
                
                const p2x = positions[idx2 * 3 + 0];
                const p2y = positions[idx2 * 3 + 1];
                const p2z = positions[idx2 * 3 + 2];
                
                const dx = p2x - p1x;
                const dy = p2y - p1y;
                const dz = p2z - p1z;
                
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                const diff = (dist - segLen) / dist;
                
                const moveScale = stiffness * 0.5;
                const offsetX = dx * diff * moveScale;
                const offsetY = dy * diff * moveScale;
                const offsetZ = dz * diff * moveScale;

                if (i !== 0) {
                     positions[idx1 * 3 + 0] += offsetX;
                     positions[idx1 * 3 + 1] += offsetY;
                     positions[idx1 * 3 + 2] += offsetZ;
                }
                
                positions[idx2 * 3 + 0] -= offsetX;
                positions[idx2 * 3 + 1] -= offsetY;
                positions[idx2 * 3 + 2] -= offsetZ;
            }
            
            for (let i = 1; i < segmentsPerStrand; i++) {
                 const idx = rootIdx + i;
                 if (positions[idx * 3 + 1] < 0) {
                     positions[idx * 3 + 1] = 0;
                 }
            }
        }
    }

    // 3. RENDER UPDATE
    let instanceIdx = 0;
    
    for (let s = 0; s < strandCount; s++) {
        const rootIdx = s * segmentsPerStrand;
        
        for (let i = 0; i < segmentsPerStrand - 1; i++) {
            const idx1 = rootIdx + i;
            const idx2 = rootIdx + i + 1;
            
            const p1x = positions[idx1 * 3 + 0];
            const p1y = positions[idx1 * 3 + 1];
            const p1z = positions[idx1 * 3 + 2];
            
            const p2x = positions[idx2 * 3 + 0];
            const p2y = positions[idx2 * 3 + 1];
            const p2z = positions[idx2 * 3 + 2];
            
            tempVec3.set(p1x, p1y, p1z);
            tempObj.position.copy(tempVec3);
            
            const targetPos = new THREE.Vector3(p2x, p2y, p2z);
            tempObj.lookAt(targetPos);
            
            const d = tempVec3.distanceTo(targetPos);
            
            // Tapering Logic
            const t = i / (segmentsPerStrand - 1);
            // Linear taper from 1.0 down to (1-taper)
            const taperScale = 1.0 - (t * taper);
            const thickness = baseThickness * Math.max(0.1, taperScale);
            
            tempObj.scale.set(thickness, thickness, d);
            tempObj.updateMatrix();
            meshRef.current.setMatrixAt(instanceIdx, tempObj.matrix);
            instanceIdx++;
        }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={nodes.Scene} visible={false} />
      
      <instancedMesh
        ref={meshRef}
        args={[segmentGeometry, baseMaterial, simData.instanceCount]}
        frustumCulled={false}
        castShadow
        receiveShadow
      >
        <instancedBufferAttribute
            ref={colorAttributeRef}
            attach="instanceColor"
            args={[simData.colors, 3]}
        />
      </instancedMesh>
      
      <skinnedMesh 
        geometry={nodes.vanguard_Mesh.geometry}
        skeleton={nodes.vanguard_Mesh.skeleton}
        castShadow
        receiveShadow
      >
         <meshStandardMaterial 
            color="#111" 
            metalness={0.9} 
            roughness={0.1}
            transparent
            opacity={0.05}
         />
      </skinnedMesh>
    </group>
  );
};
