// src/components/HomePage.jsx
import React from 'react';
import Hero from './Hero';
// import LanguageScroller from './LanguageScroller'; // Make sure this component exists
import FeatureSection from './FeatureSection';
import AppDownloadSection from './AppDownloadSection';
import ProductSection from './ProductSection';
import FinalCTA from './FinalCTA';
import { features, products } from '../components/data'; // Correct path to data.js

const HomePage = () => (
  <>
    <Hero />
    {/* I've uncommented LanguageScroller, assuming you have this component */}
    {/* <LanguageScroller /> */}
    
    {features.map((feature, index) => (
      <FeatureSection
        key={index}
        title={feature.title}
        imgSrc={feature.imgSrc}
        imageSide={feature.imageSide}
      >
        <p>{feature.description}</p>
      </FeatureSection>
    ))}
    
    <AppDownloadSection />
    
    {products.map((product, index) => (
      <ProductSection key={index} {...product} />
    ))}
    
    <FinalCTA />
  </>
);

export default HomePage;