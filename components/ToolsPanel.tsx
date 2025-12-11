import React from 'react';
import { Settings2 } from 'lucide-react';
import { ImageGenConfig, AppMode } from '../types';

interface ToolsPanelProps {
  mode: AppMode;
  section: 'imagine';
  imageConfig: ImageGenConfig;
  setImageConfig: (cfg: ImageGenConfig) => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({
  mode,
  section,
  imageConfig,
  setImageConfig,
}) => {
  return (
    <div className="w-72 bg-zinc-900 border-l border-zinc-800 p-4 hidden lg:block overflow-y-auto">
      <div className="flex items-center gap-2 mb-6 text-zinc-200">
        <Settings2 className="w-5 h-5" />
        <h2 className="font-semibold">Configuration</h2>
      </div>

      <div className="space-y-6">
        {/* Imagine Settings */}
        {section === 'imagine' && (
          <>
             <div className="space-y-3">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {['1:1', '3:4', '4:3', '16:9', '9:16'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setImageConfig({ ...imageConfig, aspectRatio: ratio as any })}
                    className={`px-2 py-2 text-xs rounded-md border ${
                      imageConfig.aspectRatio === ratio
                        ? 'bg-zinc-800 border-indigo-500 text-white'
                        : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'detail' && (
              <div className="space-y-3">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Quality (Pro Only)</label>
                <div className="grid grid-cols-3 gap-2">
                  {['1K', '2K', '4K'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setImageConfig({ ...imageConfig, size: size as any })}
                      className={`px-2 py-2 text-xs rounded-md border ${
                        imageConfig.size === size
                          ? 'bg-zinc-800 border-indigo-500 text-white'
                          : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {mode === 'flash' && (
                 <div className="p-3 bg-indigo-900/20 border border-indigo-500/20 rounded-lg">
                    <p className="text-xs text-indigo-300">Switch to Detail mode for 2K/4K resolution.</p>
                 </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ToolsPanel;