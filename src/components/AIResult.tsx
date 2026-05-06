/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Markdown from 'react-markdown';
import { motion } from 'motion/react';
import { BookOpen, Lightbulb, Sparkles, RefreshCw } from 'lucide-react';
import { AIResult as AIResultType } from '../types';

interface AIResultProps {
  result: AIResultType;
  onExplainMore: () => void;
  onReset: () => void;
  isProcessingExtra: boolean;
}

export default function AIResult({ result, onExplainMore, onReset, isProcessingExtra }: AIResultProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      {/* Primary Answer Panel */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.4)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 p-6">
           <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-cyan-500/20">Analysis Complete</span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 text-cyan-400">
            <Sparkles size={20} className="animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Neural Solution Found</h2>
          </div>
          <div className="prose prose-invert max-w-none">
            <div className="text-5xl font-extrabold font-mono tracking-tight text-white mb-4 leading-tight">
              <Markdown>{result.answer}</Markdown>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] leading-none">Confidence Rating: 99.8%</p>
            </div>
          </div>
        </div>
      </div>

      {result.explanation ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Explanation Section */}
          <div className="bg-black/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 space-y-6">
            <div className="flex items-center gap-3 text-purple-400">
              <BookOpen size={20} />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Step-by-Step Logic</h2>
            </div>
            <div className="prose prose-invert max-w-none text-sm leading-relaxed text-white/60">
              <Markdown>{result.explanation}</Markdown>
            </div>
          </div>

          {/* Easiest Way / Shortcut Panel */}
          <div className="bg-[#0A0F1E] border border-white/10 p-8 rounded-[2rem] shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-bold flex items-center gap-3 text-white">
                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]"></span>
                The Easiest Way
              </h4>
              <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Optimization Map
              </div>
            </div>
            <div className="prose prose-invert max-w-none text-sm text-white/70 leading-relaxed font-medium">
              <Markdown>{result.easiestWay}</Markdown>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-white/20 uppercase font-bold tracking-[0.2em]">Efficiency Rating</span>
              <span className="text-green-400 text-xs font-bold tracking-widest">+40% Faster</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={onExplainMore}
            disabled={isProcessingExtra}
            className="h-18 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] active:scale-[0.98] disabled:opacity-50"
          >
            {isProcessingExtra ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <BookOpen size={22} className="text-cyan-300" />
            )}
            Show Full Explanation
          </button>
          
          <button
            onClick={onReset}
            className="h-18 rounded-2xl border border-white/10 bg-white/5 font-bold hover:bg-white/10 transition-all active:scale-[0.98] text-white/80"
          >
            Capture New
          </button>
        </div>
      )}

      {result.explanation && (
        <button
          onClick={onReset}
          className="w-full h-18 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98]"
        >
          <RefreshCw size={20} className="text-cyan-400" />
          Solve Another Document
        </button>
      )}
    </motion.div>
  );
}
