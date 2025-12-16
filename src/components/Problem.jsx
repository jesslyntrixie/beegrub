import React from 'react';
import './Problem.css';

const Problem = () => {
  const problems = [
    {
      icon: '⏰',
      title: 'Proses Makan Tidak Efisien',
      description: 'Proses makan menyita waktu dan mengganggu jadwal kuliah yang padat'
    },
    {
      icon: '😰',
      title: 'Waktu Istirahat Jadi Stres',
      description: 'Waktu istirahat berubah jadi sumber stres dan kecemasan, bukan waktu relaksasi'
    },
    {
      icon: '🍽️',
      title: 'Mahasiswa Sering Melewatkan Makan',
      description: 'Aktivitas kampus yang padat membuat mahasiswa melewatkan makan hingga mengganggu fokus belajar'
    },
    {
      icon: '🏢',
      title: 'Kemacetan Vertikal',
      description: 'Naik turun kantin lama, sulit cari tempat duduk, dan antrian tidak merata'
    }
  ];

  return (
    <section id="problem" className="problem-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">😤 THE PROBLEM</span>
          <h2 className="section-title">Kenapa Mahasiswa BINUS Butuh BeeGrub?</h2>
          <p className="section-subtitle">
            Tekanan akademik membuat mahasiswa lebih fokus pada hal mendesak daripada kebutuhan makan
          </p>
        </div>
        
        <div className="problems-grid">
          {problems.map((problem, index) => (
            <div key={index} className="problem-card">
              <div className="problem-icon">{problem.icon}</div>
              <h3 className="problem-title">{problem.title}</h3>
              <p className="problem-description">{problem.description}</p>
            </div>
          ))}
        </div>

        <div className="why-now-section">
          <h3 className="why-now-title">Kenapa Sekarang?</h3>
          <div className="why-now-grid">
            <div className="why-now-card">
              <span className="why-now-emoji">🏢</span>
              <h4>Kemacetan Vertikal</h4>
              <p>Naik turun kantin lama! Belum makan, waktu istirahat sudah habis 😓</p>
            </div>
            <div className="why-now-card">
              <span className="why-now-emoji">💺</span>
              <h4>Defisit Kursi</h4>
              <p>Lama cari tempat kosong! Makan di kantin kurang ideal 😫</p>
            </div>
            <div className="why-now-card">
              <span className="why-now-emoji">👥</span>
              <h4>Antrian Tidak Rata</h4>
              <p>Ada yang ramai, ada yang sepi. Habis waktu buat ngantri deh 😤</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
