import React from 'react';

// Import all the components
import Header from './components/Header';
import Hero from './components/Hero';
// import LanguageScroller from './components/LanguageScroller';
import FeatureSection from './components/FeatureSection';
import AppDownloadSection from './components/AppDownloadSection';
import ProductSection from './components/ProductSection';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

// Corrected the import path for the data file
import { features, products } from './components/data';

function App() {
  return (
    <div className="font-sans">
      <Header />
      <main>
        <Hero />
        {/* Added the LanguageScroller component back */}
        {/* <LanguageScroller /> */}

        {/* Updated to use the 'children' prop for FeatureSection */}
        {features.map((feature, index) => (
          <FeatureSection
            key={index}
            title={feature.title}
            imgSrc={feature.imgSrc}
            imageSide={feature.imageSide}
          >
            <p>
              {feature.description}
            </p>
          </FeatureSection>
        ))}

        <AppDownloadSection />

        {products.map((product, index) => (
            <ProductSection key={index} {...product} />
        ))}

        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;