/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Camera, RefreshCw, GraduationCap, ChevronLeft, Image as ImageIcon, Upload, Download, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CameraCapture from './components/CameraCapture';
import AIResult from './components/AIResult';
import { solveWorksheet } from './services/gemini';
import { AIResult as AIResultType, AppState } from './types';

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<AIResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleCapture = async (capturedImage: string) => {
    setImage(capturedImage);
    setState('processing');
    setLoading(true);
    setError(null);
    try {
      const res = await solveWorksheet(capturedImage);
      setResult(res);
      setState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setState('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainMore = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await solveWorksheet(image, true);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setState('idle');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white font-sans selection:bg-blue-500/30 selection:text-white relative overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="bg-atmosphere-top"></div>
      <div className="bg-atmosphere-bottom"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <GraduationCap size={22} />
            </div>
            <div>
              <span className="font-bold tracking-tight text-xl block leading-none">SnapSolver</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/60 mt-1">AI Intelligence</span>
            </div>
          </div>
          {state !== 'idle' && (
            <button 
              onClick={resetAll}
              className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-12 py-12"
            >
              <div className="mx-auto w-28 h-28 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center text-blue-400 shadow-2xl relative group">
                <div className="absolute inset-0 bg-blue-500/20 rounded-[2.5rem] blur-2xl group-hover:bg-blue-500/30 transition-all"></div>
                <Camera size={44} className="relative z-10" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-tight">
                  Solve anything with <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Lens AI.</span>
                </h1>
                <p className="text-white/40 text-lg max-w-sm mx-auto leading-relaxed">
                  Snap a photo of any worksheet—math, science, or social studies—and unlock instant knowledge.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => setState('capturing')}
                  className="w-full h-18 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] active:scale-[0.98]"
                >
                  <Camera size={24} />
                  Open Scanner
                </button>
                
                <label className="w-full h-18 bg-white/5 border border-white/10 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/10 transition-all cursor-pointer active:scale-[0.98]">
                  <Upload size={24} className="text-white/40" />
                  <span className="text-white/80">Upload Image</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                </label>

                {deferredPrompt && (
                  <button 
                    onClick={handleInstallClick}
                    className="w-full h-18 bg-white/5 border border-cyan-400/20 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-cyan-400/10 transition-all active:scale-[0.98] text-cyan-400"
                  >
                    <Download size={24} />
                    Install App (PC & Android)
                  </button>
                )}

                <div className="pt-8 space-y-4 border-t border-white/5 mt-4">
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">
                    How to get it on your devices
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <p className="text-xs font-bold text-white/50 mb-1">PC / Windows</p>
                      <p className="text-[10px] text-white/30 leading-relaxed uppercase">Click the Install button above or the icon in your browser address bar to add to desktop.</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <p className="text-xs font-bold text-white/50 mb-1">Android / APK</p>
                      <p className="text-[10px] text-white/30 leading-relaxed uppercase">Open in Chrome, tap "Add to Home Screen" in the menu for a full-screen app experience.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">
                    System Online / Gemini Ultra Core
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm font-semibold border border-red-500/20">
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {state === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-12 relative"
            >
              {/* Complex Neural Animation */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Outer pulsing rings */}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 border border-cyan-500/30 rounded-full"
                ></motion.div>
                <motion.div 
                  animate={{ scale: [1.2, 1.4, 1.2], opacity: [0.1, 0.05, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-[-20px] border border-blue-500/20 rounded-full"
                ></motion.div>
                
                {/* Core Scanner */}
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 border-2 border-white/5 rounded-full"></div>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-cyan-400 rounded-full border-t-transparent shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                  ></motion.div>
                  <div className="absolute inset-4 bg-white/5 rounded-full backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="text-cyan-400 animate-pulse" size={24} />
                  </div>
                </div>

                {/* Orbiting particles */}
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-0 left-1/2 -ml-1 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]"></div>
                </motion.div>
              </div>

              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                    Neural Processing
                  </h2>
                  <motion.p 
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.4em]"
                  >
                    Solving Complexity / Layer 4
                  </motion.p>
                </div>
                
                {/* Mock status updates */}
                <div className="flex flex-col gap-2 max-w-[200px] mx-auto">
                   {[
                     { label: 'Document Scanning', delay: 0 },
                     { label: 'OCR Extraction', delay: 1 },
                     { label: 'Neural Resolution', delay: 2 }
                   ].map((step, i) => (
                     <motion.div 
                       key={step.label}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: step.delay }}
                       className="flex items-center gap-3 text-left"
                     >
                       <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                       <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{step.label}</span>
                       <motion.span 
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: step.delay + 0.5 }}
                         className="ml-auto text-green-400"
                       >
                         ✓
                       </motion.span>
                     </motion.div>
                   ))}
                </div>
              </div>

              {/* Background ambient sweep */}
              <motion.div 
                animate={{ left: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 -translate-y-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-xl pointer-events-none"
              ></motion.div>
            </motion.div>
          )}

          {state === 'result' && result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-10"
            >
              {image && (
                <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group">
                  <img src={image} className="w-full h-full object-cover grayscale-[0.2] transition-all group-hover:grayscale-0" alt="Captured Worksheet" />
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                    <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">
                      <ImageIcon size={14} className="text-cyan-400" />
                      Original Capture Document
                    </div>
                  </div>
                  {/* Viewfinder corners aesthetic */}
                  <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-cyan-400/40"></div>
                  <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-cyan-400/40"></div>
                  <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-cyan-400/40"></div>
                  <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-cyan-400/40"></div>
                </div>
              )}

              <AIResult 
                result={result} 
                onExplainMore={handleExplainMore}
                onReset={resetAll}
                isProcessingExtra={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {state === 'capturing' && (
          <CameraCapture 
            onCapture={handleCapture}
            onClose={() => setState('idle')}
          />
        )}
      </AnimatePresence>

      <footer className="max-w-xl mx-auto px-6 py-12 text-center text-white/20 text-[10px] font-bold uppercase tracking-[0.3em] border-t border-white/5 mt-auto">
        Powered by AI Studio &bull; Next-Gen Learning
      </footer>
    </div>
  );
}

