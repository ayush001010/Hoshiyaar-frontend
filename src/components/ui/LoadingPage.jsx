import React from 'react';
import loadingVideo from '../../assets/videos/Animated_Loading_Instead_of_Circle.mp4';

const LoadingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
      <div className="text-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-32 h-32 md:w-48 md:h-48 object-contain"
        >
          <source src={loadingVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <p className="text-white text-lg font-semibold mt-4">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingPage;
