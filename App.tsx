import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Loader, Environment } from '@react-three/drei';
import { Experience } from './components/Experience';
import { UIOverlay } from './components/UIOverlay';
import { Recorder } from './components/Recorder';
import { SIMULATION_CONFIG, ZOETROPE_CONFIG } from './constants';
import { SimulationConfig, ZoetropeConfig, AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('runner');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  const [simConfig, setSimConfig] = useState<SimulationConfig>(SIMULATION_CONFIG);
  const [zoetropeConfig, setZoetropeConfig] = useState<ZoetropeConfig>(ZOETROPE_CONFIG);

  return (
    <>
      <Canvas
        camera={{ position: [2, 1.5, 4], fov: 45 }}
        gl={{ 
          antialias: false, 
          stencil: false, 
          depth: true,
          preserveDrawingBuffer: true // Required for recording
        }}
        dpr={[1, 1.5]}
        shadows
      >
        <color attach="background" args={['#050505']} />
        
        {/* Lights */}
        <ambientLight intensity={0.4} />
        
        <spotLight 
          position={[10, 15, 10]} 
          angle={0.2} 
          penumbra={0.5} 
          intensity={15} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        
        <spotLight position={[-5, 5, -5]} intensity={5} color={simConfig.colorA} angle={0.5} penumbra={1} />
        <pointLight position={[-10, 0, 10]} intensity={1} color={simConfig.colorB} />
        
        <Environment preset="city" />

        <Suspense fallback={null}>
          <Experience 
            mode={mode} 
            isPlaying={isPlaying} 
            simConfig={simConfig} 
            zoetropeConfig={zoetropeConfig} 
          />
        </Suspense>

        <Recorder isRecording={isRecording} />

        <OrbitControls 
          target={[0, 1, 0]} 
          minDistance={2} 
          maxDistance={15} 
          enablePan={false}
          autoRotate={false}
        />
      </Canvas>
      
      <Loader 
        containerStyles={{ background: '#050505' }}
        dataStyles={{ color: simConfig.colorA, fontSize: '12px', fontFamily: 'Inter' }}
        barStyles={{ background: simConfig.colorB, height: '4px' }}
      />
      
      <UIOverlay 
        mode={mode}
        setMode={setMode}
        isPlaying={isPlaying} 
        setIsPlaying={setIsPlaying} 
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        simConfig={simConfig}
        setSimConfig={setSimConfig}
        zoetropeConfig={zoetropeConfig}
        setZoetropeConfig={setZoetropeConfig}
      />
    </>
  );
};

export default App;
