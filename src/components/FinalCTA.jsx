// src/components/FinalCTA.jsx

import React from 'react';
import finalCTABackground from '../Images/footer.png'; // <--- IMPORTANT: Update 'final-cta-bg.png' to your actual image filename

const FinalCTA = () => (
    <section 
        className="relative overflow-hidden" // Removed bg-duo-footer-blue as background image will cover
        style={{ 
            backgroundImage: `url(${finalCTABackground})`, 
            backgroundSize: 'cover',        // Ensures image covers the section
            backgroundPosition: 'center',   // Centers the image
            backgroundRepeat: 'no-repeat',  // Prevents tiling
        }}
    >
        <div className="h-[110vh] relative container mx-auto px-4 text-center py-20 lg:py-32">
            <h2 className="text-4xl md:text-5xl font-extrabold text-duo-blue mb-8">learn a subject with hoshiyaar...!</h2>
            {/* Changed button color to match the desired image style */}
            <button className="w-full sm:w-auto bg-duo-blue text-white font-bold uppercase tracking-wider py-4 px-10 rounded-2xl border-b-4 border-duo-blue hover:bg-blue-500 transition">
                Get Started
            </button>
        </div>
    </section>
);

export default FinalCTA;