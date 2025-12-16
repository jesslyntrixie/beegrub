import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'Browse & Pesan',
      description: 'Buka aplikasi, pilih kantin favorit, dan pesan makanan dari menu yang tersedia.',
      icon: '📱',
    },
    {
      step: '02',
      title: 'Pilih Waktu & Bayar',
      description: 'Pilih waktu pickup (2-3 jam sebelumnya) dan lokasi yang diinginkan. Bayar dengan aman.',
      icon: '⏰',
    },
    {
      step: '03',
      title: 'Terima Notifikasi',
      description: 'Dapatkan update real-time tentang pesanan. Kami akan memberitahu saat siap diambil.',
      icon: '🔔',
    },
    {
      step: '04',
      title: 'Ambil & Nikmati',
      description: 'Tunjukkan kode pesanan di lokasi pickup, ambil makanan, dan nikmati! Tanpa antre.',
      icon: '✅',
    },
  ];

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-container">
        <div className="how-header">
          <span className="section-badge">Cara Kerja</span>
          <h2 className="section-title">
            Dari Pesan hingga Ambil dalam <span className="gradient-text">4 Langkah Mudah</span>
          </h2>
          <p className="section-subtitle">
            Kami membuatnya super mudah. Hanya beberapa tap dan selesai!
          </p>
        </div>

        <div className="steps-container">
          {steps.map((item, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{item.step}</div>
              <div className="step-icon">{item.icon}</div>
              <h3 className="step-title">{item.title}</h3>
              <p className="step-description">{item.description}</p>
              {index < steps.length - 1 && <div className="step-arrow">→</div>}
            </div>
          ))}
        </div>

        <div className="time-comparison">
          <div className="comparison-card old-way">
            <h4>😫 Cara Lama</h4>
            <ul>
              <li>Jalan ke kantin (5 menit)</li>
              <li>Antri panjang (15 menit)</li>
              <li>Tunggu makanan (10 menit)</li>
              <li>Jalan balik (5 menit)</li>
            </ul>
            <div className="total-time old">Total: <strong>35 menit</strong></div>
          </div>

          <div className="vs-divider">VS</div>

          <div className="comparison-card new-way">
            <h4>😊 Pakai BeeGrub</h4>
            <ul>
              <li>Pesan lewat app (2 menit)</li>
              <li>Bebas ngapain aja sambil nunggu</li>
              <li>Jalan ke pickup spot (3 menit)</li>
              <li>Tunjukkan kode & ambil (1 menit)</li>
            </ul>
            <div className="total-time new">Total: <strong>6 menit</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
