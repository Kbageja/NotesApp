// src/components/ui/DesktopRightPanel.tsx
import React from 'react';

const DesktopRightPanel: React.FC = () => {
  return (
    <div className="w-1/2 bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-12 relative overflow-hidden">
      {/* Placeholder - Will be updated with your actual design */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 3D Wave/Flow Design - Placeholder */}
        <div className="relative">
          {/* Multiple layers for 3D effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full opacity-20 w-96 h-96 animate-pulse"></div>
          <div className="absolute inset-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-full opacity-30 w-80 h-80 animate-pulse delay-1000"></div>
          <div className="absolute inset-8 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-full opacity-40 w-64 h-64 animate-pulse delay-2000"></div>
          
          {/* Center content */}
          <div className="relative z-10 text-center text-white">
            <div className="text-6xl font-bold mb-4 opacity-30">HD</div>
            <div className="text-xl opacity-50">Notes App</div>
          </div>
        </div>
      </div>
      
      {/* Please provide the actual right-side image for exact implementation */}
      <div className="absolute top-4 right-4 text-xs text-white opacity-50">
        Placeholder - Waiting for actual design
      </div>
    </div>
  );
};

export default DesktopRightPanel;