import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { sounds } from '../lib/sounds';

interface VirtualControlsProps {
  onDirection?: (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  onAction?: () => void;
  showDpad?: boolean;
  showAction?: boolean;
  actionLabel?: string;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onDirection,
  onAction,
  showDpad = true,
  showAction = false,
  actionLabel = 'ACTION',
}) => {
  const triggerDir = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    sounds.playTone(220, 'sine', 0.03, 0.05);
    if (onDirection) onDirection(dir);
  };

  const triggerAction = () => {
    sounds.playTone(440, 'triangle', 0.05, 0.08);
    if (onAction) onAction();
  };

  return (
    <div className="w-full flex items-center justify-between gap-4 p-2 bg-[#0a0b12]/80 backdrop-blur border-t border-cyber-border select-none touch-none">
      {/* Directional Pad */}
      {showDpad && (
        <div className="grid grid-cols-3 gap-1.5 w-36 h-36 mx-auto sm:mx-0">
          <div></div>
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              triggerDir('UP');
            }}
            className="w-11 h-11 bg-cyber-card border border-cyber-border active:bg-cyan-500/40 rounded-xl flex items-center justify-center text-cyan-400 active:scale-90 transition-transform shadow-md"
            aria-label="Up"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div></div>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              triggerDir('LEFT');
            }}
            className="w-11 h-11 bg-cyber-card border border-cyber-border active:bg-cyan-500/40 rounded-xl flex items-center justify-center text-cyan-400 active:scale-90 transition-transform shadow-md"
            aria-label="Left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-11 h-11 rounded-xl bg-[#0e111a] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-600"></div>
          </div>
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              triggerDir('RIGHT');
            }}
            className="w-11 h-11 bg-cyber-card border border-cyber-border active:bg-cyan-500/40 rounded-xl flex items-center justify-center text-cyan-400 active:scale-90 transition-transform shadow-md"
            aria-label="Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div></div>
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              triggerDir('DOWN');
            }}
            className="w-11 h-11 bg-cyber-card border border-cyber-border active:bg-cyan-500/40 rounded-xl flex items-center justify-center text-cyan-400 active:scale-90 transition-transform shadow-md"
            aria-label="Down"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <div></div>
        </div>
      )}

      {/* Action Button */}
      {showAction && (
        <div className="flex items-center gap-3 ml-auto">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              triggerAction();
            }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 active:from-pink-500 active:to-purple-500 border border-pink-400/50 text-white font-black text-xs tracking-wider flex flex-col items-center justify-center gap-1 shadow-neon-pink active:scale-90 transition-transform"
          >
            <Zap className="w-6 h-6 fill-current" />
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};

