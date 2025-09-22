import React from 'react';
import heroImage from '../Images/heroChar.png';

const Hero = () => (
  <section className="py-12 lg:py-24">
    {/* The key change is increasing gap-12 to gap-24 */}
    <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-center gap-24">
      
      {/* Left: Image */}
      <div className="flex-1 flex justify-center mb-8 lg:mb-0">
        <img
          src={heroImage}
          alt="Learn a language illustration"
          className="max-w-xs md:max-w-md w-[40vh] h-auto"
        />
      </div>

      {/* Right: Text and Buttons */}
      {/* Changed lg:text-center to lg:text-left */}
      <div className="flex-1 text-center lg:text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold text-duo-text mb-6">
          The free, fun, and effective way to learn a language!
        </h1>
        {/* Changed justification to lg:justify-start for buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
          <button className="w-full sm:w-auto bg-duo-blue text-white font-bold uppercase tracking-wider py-4 px-10 rounded-2xl border-b-4 border-duo-blue-dark hover:bg-blue-500 transition">
            Get Started
          </button>
          <button className="w-full sm:w-auto bg-white text-duo-blue font-bold uppercase tracking-wider py-4 px-10 rounded-2xl border-2 border-duo-gray hover:bg-gray-100 transition">
            I already have an account
          </button>
        </div>
      </div>

    </div>
  </section>
);

export default Hero;