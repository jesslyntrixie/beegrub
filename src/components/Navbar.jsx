import React, { useState } from 'react';
import { COLORS } from '../constants/theme';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-text">BeeGrub</span>
        </div>
        
        <button 
          className="navbar-hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><a onClick={() => scrollToSection('home')}>Home</a></li>
          <li><a onClick={() => scrollToSection('features')}>Features</a></li>
          <li><a onClick={() => scrollToSection('how-it-works')}>How It Works</a></li>
          <li><a onClick={() => scrollToSection('vendors')}>For Vendors</a></li>
          <li><a onClick={() => scrollToSection('contact')}>Contact</a></li>
        </ul>

        <button className="navbar-cta">Download App</button>
      </div>
    </nav>
  );
};

export default Navbar;
