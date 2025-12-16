import React from 'react';
import './ForVendors.css';

const ForVendors = () => {
  const benefits = [
    {
      icon: '📊',
      title: 'Permintaan yang Dapat Diprediksi',
      description: 'Tahu persis apa yang harus disiapkan 2-3 jam sebelumnya. Kurangi food waste hingga 30%.',
    },
    {
      icon: '⚡',
      title: 'Operasional Lebih Efisien',
      description: 'Pre-order membantu perencanaan produksi dan mengurangi kekacauan saat jam sibuk.',
    },
    {
      icon: '💰',
      title: 'Revenue Penuh untuk Vendor',
      description: 'Anda terima 100% harga menu. Biaya layanan Rp 3.000 dibayar oleh mahasiswa, bukan vendor.',
    },
    {
      icon: '📱',
      title: 'Dashboard Mudah Digunakan',
      description: 'Kelola menu, pesanan, dan pendapatan dalam satu tempat. Interface simpel dan intuitif.',
    },
  ];

  return (
    <section id="vendors" className="for-vendors">
      <div className="vendors-container">
        <div className="vendors-content">
          <span className="section-badge">Untuk Mitra Kantin</span>
          <h2 className="section-title">
            Bergabung dengan BeeGrub sebagai <span className="gradient-text">Mitra Kantin</span>
          </h2>
          <p className="vendors-intro">
            Tingkatkan efisiensi operasional kantin dengan sistem pre-order kami. 
            Layani lebih banyak mahasiswa dengan efisien sambil mengurangi waste dan kekacauan.
          </p>

          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-item">
                <div className="benefit-icon">{benefit.icon}</div>
                <div className="benefit-content">
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="vendor-pricing">
            <h3>Model Harga Transparan</h3>
            <div className="pricing-card">
              <div className="price-tag">
                <span className="percentage">100%</span>
                <span className="price-label">Anda terima dari harga menu</span>
              </div>
              <ul className="pricing-features">
                <li>✅ Zero komisi untuk vendor</li>
                <li>✅ Biaya layanan Rp 3.000 dibayar mahasiswa</li>
                <li>✅ Tidak ada biaya setup</li>
                <li>✅ Tidak ada biaya bulanan</li>
                <li>✅ Payout mingguan</li>
              </ul>
              <div className="pricing-example">
                <strong>Contoh:</strong> Menu Rp 25.000 → Anda terima Rp 25.000<br/>
                <span style={{fontSize: '14px', opacity: 0.8}}>Mahasiswa bayar Rp 28.000 (menu + fee)</span>
              </div>
            </div>
          </div>

          <div className="vendor-cta">
            <a href="https://github.com/yourusername/beegrub" target="_blank" rel="noopener noreferrer" className="btn-primary-large">
              Daftar Jadi Mitra
            </a>
            <p className="cta-note">Bergabunglah dengan kantin-kantin kampus yang sudah menggunakan BeeGrub</p>
          </div>
        </div>

        <div className="vendors-visual">
          <div className="dashboard-preview">
            <div className="dashboard-header">
              <h4>Vendor Dashboard</h4>
              <span className="status-badge">Live</span>
            </div>
            <div className="dashboard-stats">
              <div className="stat-box">
                <div className="stat-label">Today's Orders</div>
                <div className="stat-value">47</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Revenue</div>
                <div className="stat-value">Rp 940K</div>
              </div>
            </div>
            <div className="order-list">
              <div className="order-item">
                <div className="order-info">
                  <span className="order-id">#0847</span>
                  <span className="order-time">11:00 AM</span>
                </div>
                <div className="order-status preparing">Preparing</div>
              </div>
              <div className="order-item">
                <div className="order-info">
                  <span className="order-id">#0848</span>
                  <span className="order-time">11:00 AM</span>
                </div>
                <div className="order-status ready">Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForVendors;
