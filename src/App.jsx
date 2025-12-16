import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Problem from './components/Problem';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import ForVendors from './components/ForVendors';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Features />
        <HowItWorks />
        <ForVendors />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
