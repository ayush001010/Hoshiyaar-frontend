import React from 'react';
import { DuolingoLogo } from './Icons';

const Header = () => (
  <header className="sticky top-0 bg-white border-b border-duo-gray h-20 flex items-center">
    <div className="container mx-auto px-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        {/* <DuolingoLogo /> */}
        <span className="text-2xl font-extrabold text-duo-blue tracking-tight">Hoshiyaar</span>
      </div>
      <div>
        <button className="w-full sm:w-auto bg-duo-blue text-white font-bold uppercase tracking-wider py-3 px-7 rounded-2xl border-b-4 border-duo-blue-dark hover:bg-blue-500 transition">
          Login / Signup
        </button>
      </div>
    </div>
  </header>
);

export default Header;