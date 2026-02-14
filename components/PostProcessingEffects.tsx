import React from 'react';
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export const PostProcessingEffects: React.FC = () => {
  return (
    <EffectComposer disableNormalPass>
      <Bloom 
        luminanceThreshold={0.8} 
        mipmapBlur 
        intensity={1.2} 
        radius={0.4} 
      />
      <DepthOfField 
        focusDistance={0.02} // where to focus (0..1)
        focalLength={0.2} // focal length
        bokehScale={3} // bokeh size
        height={480} 
      />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
      <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
};
