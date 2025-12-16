import React from 'react';
import './Features.css';

const Features = () => {
  const features = [
    {
      icon: '🚫',
      title: 'Anti Antre',
      description: 'Ambil makanan tanpa antre. Tinggal ke pick-up point, langsung ambil.',
    },
    {
      icon: '⏰',
      title: 'Pesan Sekarang, Ambil Nanti',
      description: 'Pesan dari pagi, ambil saat istirahat. No rush, no panic.',
    },
    {
      icon: '🏪',
      title: 'Menu Resmi Kampus',
      description: 'Dari kantin resmi BINUS. Aman, higienis, terpercaya.',
    },
    {
      icon: '📱',
      title: 'Aplikasi Mobile',
      description: 'Interface mudah digunakan seperti aplikasi food delivery pada umumnya.',
    },
    {
      icon: '💳',
      title: 'Pembayaran Cashless',
      description: 'QRIS, e-wallet, mobile banking. Cepat dan aman.',
    },
    {
      icon: '📍',
      title: 'Pickup Point Strategis',
      description: 'Lokasi pickup tersebar di seluruh area kampus, selalu dekat dari kelas.',
    },
  ];

  return (
    <section id="features" className="features">
      <div className="features-container">
        <div className="features-header">
          <span className="section-badge">Fitur Unggulan</span>
          <h2 className="section-title">
            Solusi <span className="gradient-text">Lengkap</span> untuk Makan Siang Tanpa Ribet
          </h2>
          <p className="section-subtitle">
            Dirancang khusus untuk mahasiswa BINUS yang menghargai waktu mereka
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
