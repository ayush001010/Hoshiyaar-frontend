import React from 'react';

export default function SimpleLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-xl font-bold text-gray-800">Loading...</p>
      </div>
    </div>
  );
}
