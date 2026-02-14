import React, { useState } from 'react';
import { SimulationConfig, ZoetropeConfig, AppMode } from '../types';
import { PRESETS } from '../constants';
import * as THREE from 'three';

interface UIOverlayProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
  simConfig: SimulationConfig;
  setSimConfig: (config: SimulationConfig) => void;
  zoetropeConfig: ZoetropeConfig;
  setZoetropeConfig: (config: ZoetropeConfig) => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  mode, setMode, 
  isPlaying, setIsPlaying, 
  isRecording, setIsRecording,
  simConfig, setSimConfig,
  zoetropeConfig, setZoetropeConfig 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleSimChange = (key: keyof SimulationConfig, value: number | string) => {
    setSimConfig({ ...simConfig, [key]: value });
  };

  const handleZoeChange = (key: keyof ZoetropeConfig, value: number | string | boolean) => {
    setZoetropeConfig({ ...zoetropeConfig, [key]: value });
  };

  const exportZoetropeJSON = () => {
    const { frames, startAngle, baseScale, scaleVar, layers, radius, deform, bend, noiseScale, distribution, morph } = zoetropeConfig;
    const N = Math.max(1, Math.floor(frames));
    const frameData = [];

    for(let i=0; i<N; i++){
      const angleDeg = THREE.MathUtils.radToDeg(THREE.MathUtils.degToRad(startAngle) + Math.PI*2*(i/N));
      const sc = +(baseScale + scaleVar * Math.sin(i*0.55)).toFixed(3);
      const layer = Math.floor((i/N) * layers);
      
      frameData.push({
        angle: +angleDeg.toFixed(3),
        scale: Math.max(0.01, +sc.toFixed(3)),
        radius: +radius.toFixed(4),
        deform_factor: +deform.toFixed(3),
        layer: layer,
        bend_factor: +bend.toFixed(3),
        noise_scale: +noiseScale.toFixed(3),
        morph_t: +morph.toFixed(3),
        unit_scale: 1.0,
        distribution: distribution
      });
    }
    
    const blob = new Blob([JSON.stringify(frameData, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'zoetrope_frames.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between z-10">
      {/* Header */}
      <div className="p-6 pointer-events-auto w-fit">
        <h1 className="text-4xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500 w-fit drop-shadow-[0_2px_10px_rgba(0,255,255,0.5)]">
          NEON {mode === 'runner' ? 'RUNNER' : 'ZOETROPE'}
        </h1>
        <div className="flex gap-4 mt-2">
           <button 
             onClick={() => setMode('runner')}
             className={`text-xs font-bold uppercase tracking-widest transition-colors ${mode==='runner' ? 'text-cyan-400 border-b border-cyan-400' : 'text-gray-500 hover:text-white'}`}
           >
             Runner
           </button>
           <button 
             onClick={() => setMode('zoetrope')}
             className={`text-xs font-bold uppercase tracking-widest transition-colors ${mode==='zoetrope' ? 'text-pink-400 border-b border-pink-400' : 'text-gray-500 hover:text-white'}`}
           >
             Builder
           </button>
        </div>
      </div>

      {/* Recorder Control */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-2">
          <button
              onClick={() => setIsRecording(!isRecording)}
              className={`
                  w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center transition-all duration-300
                  ${isRecording ? 'bg-red-500/20 scale-110 shadow-[0_0_30px_rgba(255,0,0,0.5)]' : 'bg-white/10 hover:bg-white/20 hover:scale-105'}
              `}
          >
              <div className={`
                  transition-all duration-300
                  ${isRecording ? 'w-6 h-6 bg-red-500 rounded-sm' : 'w-6 h-6 bg-red-500 rounded-full'}
              `} />
          </button>
          <span className={`text-[10px] font-bold tracking-widest uppercase ${isRecording ? 'text-red-400 animate-pulse' : 'text-white/40'}`}>
              {isRecording ? 'Recording...' : 'Record Gift'}
          </span>
      </div>

      {/* Controls Container */}
      <div className="pointer-events-auto absolute right-6 top-6 w-80 flex flex-col gap-4">
        <div className={`
          bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 ease-out
          ${isOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className="p-5 space-y-6 overflow-y-auto max-h-[85vh] custom-scrollbar">
            
            {/* RUNNER MODE CONTROLS */}
            {mode === 'runner' && (
              <>
                <div 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`cursor-pointer p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all
                    ${isPlaying ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-pink-500/20 text-pink-400 border-pink-500/50'} border`}
                >
                  <span>{isPlaying ? 'RUNNING' : 'PAUSED'}</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-2">Presets</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PRESETS).map(([name, preset]) => (
                      <button key={name} onClick={() => setSimConfig(preset)}
                        className="px-3 py-2 text-[10px] uppercase font-bold border border-white/20 rounded bg-white/5 hover:bg-white/20 hover:text-cyan-400 transition-all text-left">
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                    <ControlGroup label="Strand Count" value={simConfig.strandCount} min={100} max={3000} step={100} onChange={(v) => handleSimChange('strandCount', v)} />
                    <ControlGroup label="Thickness" value={simConfig.baseThickness} min={0.1} max={5} step={0.1} onChange={(v) => handleSimChange('baseThickness', v)} />
                    <ControlGroup label="Taper" value={simConfig.taper} min={0} max={1} step={0.05} onChange={(v) => handleSimChange('taper', v)} />
                    <ControlGroup label="Wind" value={simConfig.windForce} min={0} max={10} step={0.1} onChange={(v) => handleSimChange('windForce', v)} />
                    <ControlGroup label="Gravity" value={simConfig.gravity} min={-20} max={5} step={0.5} onChange={(v) => handleSimChange('gravity', v)} />
                    <ControlGroup label="Drag" value={simConfig.drag} min={0.5} max={0.99} step={0.01} onChange={(v) => handleSimChange('drag', v)} />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                   <ColorInput label="Base" value={simConfig.colorA} onChange={(v) => handleSimChange('colorA', v)} />
                   <ColorInput label="Mid" value={simConfig.colorB} onChange={(v) => handleSimChange('colorB', v)} />
                   <ColorInput label="Tip" value={simConfig.colorC} onChange={(v) => handleSimChange('colorC', v)} />
                </div>
              </>
            )}

            {/* ZOETROPE MODE CONTROLS */}
            {mode === 'zoetrope' && (
              <>
                 <button onClick={exportZoetropeJSON} className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                    EXPORT JSON TO BLENDER
                 </button>

                 <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-mono text-gray-400">Distribution</label>
                        <div className="flex gap-1">
                            {['circle','helix','phyllotaxis'].map(d => (
                                <button key={d} onClick={()=>handleZoeChange('distribution', d)}
                                    className={`flex-1 py-1 text-[10px] uppercase border rounded transition-all ${zoetropeConfig.distribution===d ? 'bg-cyan-500/40 border-cyan-500 text-white' : 'border-white/20 text-gray-500 hover:text-white'}`}>
                                    {d.slice(0,4)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-mono text-gray-400">Shape</label>
                        <div className="flex gap-1">
                            {['sphere','box','superquadric'].map(s => (
                                <button key={s} onClick={()=>handleZoeChange('shape', s)}
                                    className={`flex-1 py-1 text-[10px] uppercase border rounded transition-all ${zoetropeConfig.shape===s ? 'bg-pink-500/40 border-pink-500 text-white' : 'border-white/20 text-gray-500 hover:text-white'}`}>
                                    {s.slice(0,5)}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-mono text-gray-400">Palette</label>
                        <div className="flex gap-1">
                            {['neon','aurora','sunset','mono'].map(p => (
                                <button key={p} onClick={()=>handleZoeChange('palette', p)}
                                    className={`flex-1 py-1 text-[10px] uppercase border rounded transition-all ${zoetropeConfig.palette===p ? 'bg-purple-500/40 border-purple-500 text-white' : 'border-white/20 text-gray-500 hover:text-white'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                      onClick={() => handleZoeChange('autoRotate', !zoetropeConfig.autoRotate)}
                      className={`w-full py-2 text-[10px] uppercase font-bold border rounded transition-all ${zoetropeConfig.autoRotate ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/20 text-gray-400'}`}
                    >
                      {zoetropeConfig.autoRotate ? 'Auto Rotate: ON' : 'Auto Rotate: OFF'}
                    </button>

                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-2 pt-2">Geometry</h3>
                    <ControlGroup label="Frames" value={zoetropeConfig.frames} min={6} max={120} step={1} onChange={(v) => handleZoeChange('frames', v)} />
                    <ControlGroup label="Radius" value={zoetropeConfig.radius} min={0.5} max={6} step={0.1} onChange={(v) => handleZoeChange('radius', v)} />
                    <ControlGroup label="Base Scale" value={zoetropeConfig.baseScale} min={0.02} max={1} step={0.01} onChange={(v) => handleZoeChange('baseScale', v)} />
                    <ControlGroup label="Scale Variance" value={zoetropeConfig.scaleVar} min={0} max={1} step={0.01} onChange={(v) => handleZoeChange('scaleVar', v)} />
                    <ControlGroup label="Start Angle" value={zoetropeConfig.startAngle} min={0} max={360} step={1} onChange={(v) => handleZoeChange('startAngle', v)} />
                    
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-2 pt-2">Structure</h3>
                    <ControlGroup label="Layers" value={zoetropeConfig.layers} min={1} max={20} step={1} onChange={(v) => handleZoeChange('layers', v)} />
                    <ControlGroup label="Layer Step" value={zoetropeConfig.layerStep} min={0} max={1} step={0.01} onChange={(v) => handleZoeChange('layerStep', v)} />
                    <ControlGroup label="Morph (Sq)" value={zoetropeConfig.morph} min={0} max={1} step={0.01} onChange={(v) => handleZoeChange('morph', v)} />
                    <ControlGroup label="Bend" value={zoetropeConfig.bend} min={0} max={2} step={0.1} onChange={(v) => handleZoeChange('bend', v)} />
                    
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-2 pt-2">Export Params</h3>
                    <ControlGroup label="Deform" value={zoetropeConfig.deform} min={0} max={3} step={0.01} onChange={(v) => handleZoeChange('deform', v)} />
                    <ControlGroup label="Noise Scale" value={zoetropeConfig.noiseScale} min={0.1} max={4} step={0.1} onChange={(v) => handleZoeChange('noiseScale', v)} />
                 </div>
              </>
            )}

          </div>
        </div>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="self-end p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-colors text-white/70"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
        input[type="range"] { -webkit-appearance: none; background: transparent; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 12px; width: 12px; border-radius: 50%; background: white; margin-top: -5px; box-shadow: 0 0 10px rgba(255,255,255,0.5); }
        input[type="range"]::-webkit-slider-runnable-track { width: 100%; height: 2px; background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

const ControlGroup = ({ label, value, min, max, step, onChange }: { label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between text-[10px] font-mono text-gray-400">
      <span>{label}</span>
      <span className="text-cyan-400">{value}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full cursor-pointer" />
  </div>
);

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-1 items-center">
    <div className="w-full aspect-square rounded-lg overflow-hidden relative group border border-white/20">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-none" />
    </div>
    <span className="text-[10px] font-mono text-gray-400 uppercase">{label}</span>
  </div>
);
