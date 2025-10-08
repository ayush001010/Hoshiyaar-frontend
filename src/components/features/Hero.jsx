import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../../assets/images/heroChar.png';

const Hero = () => (
  <section className="py-12 lg:py-24">
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
      <div className="flex-1 text-center lg:text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold text-duo-text mb-6">
        Learn anything, anytime, anywhere — your pace, your way.        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
          <Link to="/signup">
            <button className="w-full sm:w-auto bg-duo-blue text-white font-bold uppercase tracking-wider py-4 px-16 md:px-20 rounded-2xl border-b-4 border-duo-blue-dark hover:bg-blue-500 transition min-w-[240px]">
              Get Started
            </button>
          </Link>
        </div>
      </div>

    </div>
  </section>
);

export default Hero;
