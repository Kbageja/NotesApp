import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center text-3xl font-bold text-blue-600 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full mr-3 flex items-center justify-center">
            <span className="text-white text-lg">⭐</span>
          </div>
          HD
        </div>
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;