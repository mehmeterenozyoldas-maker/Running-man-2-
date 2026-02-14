import React from 'react';
import { StringCharacter } from './StringCharacter';
import { Zoetrope } from './Zoetrope';
import { PostProcessingEffects } from './PostProcessingEffects';
import { Ground } from './Ground';
import { SimulationConfig, ZoetropeConfig, AppMode } from '../types';

interface ExperienceProps {
  mode: AppMode;
  isPlaying: boolean;
  simConfig: SimulationConfig;
  zoetropeConfig: ZoetropeConfig;
}

export const Experience: React.FC<ExperienceProps> = ({ mode, isPlaying, simConfig, zoetropeConfig }) => {
  return (
    <>
      {mode === 'runner' ? (
        <StringCharacter isPlaying={isPlaying} config={simConfig} />
      ) : (
        <Zoetrope config={zoetropeConfig} />
      )}
      
      <Ground />
      <PostProcessingEffects />
    </>
  );
};
