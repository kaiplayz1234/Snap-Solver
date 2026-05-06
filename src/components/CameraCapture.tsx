/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [startCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#020408]/90 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-4"
    >
      <div className="relative w-full max-w-lg aspect-[3/4] bg-black rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover opacity-80"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanner Overlay Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scanner Line */}
          <motion.div 
            animate={{ top: ['10%', '90%', '10%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-10"
          />
          
          {/* Virtual Corners */}
          <div className="absolute top-8 left-8 w-10 h-10 border-t-2 border-l-2 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"></div>
          <div className="absolute top-8 right-8 w-10 h-10 border-t-2 border-r-2 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"></div>
          <div className="absolute bottom-8 left-8 w-10 h-10 border-b-2 border-l-2 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"></div>
          <div className="absolute bottom-8 right-8 w-10 h-10 border-b-2 border-r-2 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"></div>

          {/* Vignette */}
          <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%]"></div>
        </div>
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={startCamera}
              className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors font-bold uppercase tracking-widest text-xs"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="absolute top-6 right-6">
          <button 
            onClick={onClose}
            className="p-3 bg-black/40 backdrop-blur-xl rounded-full text-white/60 hover:text-white border border-white/10 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="absolute bottom-12 inset-x-0 flex justify-center">
          <button
            onClick={capturePhoto}
            disabled={!!error || !stream}
            className="w-22 h-22 bg-white rounded-full p-1.5 shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-90 transition-transform disabled:opacity-50"
          >
            <div className="w-full h-full rounded-full border-4 border-black/5 bg-white flex items-center justify-center">
               <Camera size={32} className="text-black" />
            </div>
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase">
        Optical Analysis In Progress
      </p>
    </motion.div>
  );
}
