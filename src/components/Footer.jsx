import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3 className="footer-logo">BeeGrub</h3>
            <p className="footer-tagline">
              Fast Bites, No Lines, More Time to Shine
            </p>
            <div className="footer-social">
              <a href="https://instagram.com/beegrub.binus" target="_blank" rel="noopener noreferrer" aria-label="Instagram">📷</a>
              <a href="https://tiktok.com/@beegrub" target="_blank" rel="noopener noreferrer" aria-label="TikTok">🎵</a>
              <a href="mailto:beegrub.binus@gmail.com" aria-label="Email">📧</a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Produk</h4>
            <ul>
              <li><a href="#features">Fitur</a></li>
              <li><a href="#how-it-works">Cara Kerja</a></li>
              <li><a href="#vendors">Untuk Mitra</a></li>
              <li><a href="https://github.com/yourusername/beegrub" target="_blank" rel="noopener noreferrer">Download App</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Perusahaan</h4>
            <ul>
              <li><a href="#contact">Tentang Kami</a></li>
              <li><a href="#contact">Kontak</a></li>
              <li><a href="#problem">Masalah yang Kami Selesaikan</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Dukungan</h4>
            <ul>
              <li><a href="#contact">Bantuan</a></li>
              <li><a href="#contact">FAQ</a></li>
              <li><a href="https://github.com/yourusername/beegrub" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} BeeGrub. All rights reserved. Made with 💚 at BINUS University Anggrek.</p>
          <p className="footer-note">Proyek untuk Mata Kuliah Business Ideation - Semester 5</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
