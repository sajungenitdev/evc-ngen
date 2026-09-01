// app/loading.tsx
'use client';

import React from 'react';
import { Zap, ShieldCheck, Activity } from 'lucide-react';

export default function Loading() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#071322] text-white overflow-hidden select-none">
      {/* Background Radial Glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#1b7936]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Main Charging Hub Container */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
        
        {/* Animated Power Core */}
        <div className="relative flex items-center justify-center w-36 h-36 mb-8">
          
          {/* Outer Rotating Energy Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#1b7936]/40 animate-[spin_8s_linear_infinite]" />
          
          {/* Reverse Pulsing Voltage Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-t-[#1b7936] border-r-transparent border-b-[#1b7936]/40 border-l-transparent animate-[spin_3s_linear_infinite_reverse]" />
          
          {/* Glowing Aura Ring */}
          <div className="absolute inset-4 rounded-full bg-[#1b7936]/10 border border-[#1b7936]/30 animate-ping opacity-75" />

          {/* Central Battery Indicator */}
          <div className="relative z-10 flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0b1d33] border border-[#1b7936]/50 shadow-[0_0_30px_rgba(27,121,54,0.3)] backdrop-blur-md">
            <Zap className="w-10 h-10 text-[#1b7936] fill-[#1b7936] animate-[pulse_1.5s_ease-in-out_infinite] drop-shadow-[0_0_12px_rgba(27,121,54,0.8)]" />
          </div>

          {/* Orbital Sparkle / Power Flow Particles */}
          <span className="absolute top-1 left-1/2 w-2 h-2 bg-[#1b7936] rounded-full shadow-[0_0_8px_#1b7936] animate-ping" />
          <span className="absolute bottom-2 left-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_6px_#34d399] animate-pulse" />
        </div>

        {/* Text Status Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b7936]/10 border border-[#1b7936]/30 text-xs font-semibold tracking-wider text-[#1b7936] uppercase mb-1">
            <Activity className="w-3.5 h-3.5 animate-spin" /> High-Voltage Sync
          </div>
          
          <h2 className="text-2xl font-black tracking-wide text-white">
            POWERING UP<span className="text-[#1b7936]">...</span>
          </h2>
          
          <p className="text-xs text-gray-400 font-medium">
            Initializing telemetry & syncing charging protocols
          </p>
        </div>

        {/* Dynamic Progress Indicator Bar */}
        <div className="w-full mt-6 space-y-2">
          <div className="relative w-full h-2 bg-[#0b1d33] rounded-full overflow-hidden border border-[#1b7936]/20">
            {/* Animated Gradient Bar */}
            <div className="h-full bg-gradient-to-r from-[#1b7936]/40 via-[#1b7936] to-emerald-400 rounded-full animate-[chargingBar_2s_ease-in-out_infinite] shadow-[0_0_10px_#1b7936]" />
          </div>

          {/* Real-time Status Details */}
          <div className="flex justify-between text-[11px] font-mono text-gray-400 pt-1">
            <span>VOLTAGE: HIGH</span>
            <span className="text-[#1b7936] font-bold animate-pulse">800V SYSTEM</span>
          </div>
        </div>

        {/* Security / System Footer Badge */}
        <div className="mt-8 flex items-center gap-1.5 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-[#1b7936]" />
          <span>Encrypted EV Link Active</span>
        </div>
      </div>

      {/* Embedded CSS for Custom Keyframe Animations */}
      <style jsx>{`
        @keyframes chargingBar {
          0% {
            width: 0%;
            opacity: 0.3;
          }
          50% {
            width: 70%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}