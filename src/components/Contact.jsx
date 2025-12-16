import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <section id="contact" className="contact">
      <div className="contact-container">
        <div className="contact-content">
          <span className="section-badge">Hubungi Kami</span>
          <h2 className="section-title">
            Siap <span className="gradient-text">Bergabung</span> dengan BeeGrub?
          </h2>
          <p className="contact-intro">
            Ada pertanyaan? Ingin jadi mitra kantin? Kami siap membantu!
          </p>

          <div className="contact-methods">
            <div className="contact-method">
              <div className="method-icon">📧</div>
              <div className="method-info">
                <h4>Email</h4>
                <a href="mailto:beegrub.binus@gmail.com">beegrub.binus@gmail.com</a>
              </div>
            </div>
            <div className="contact-method">
              <div className="method-icon">📱</div>
              <div className="method-info">
                <h4>Instagram</h4>
                <a href="https://instagram.com/beegrub.binus" target="_blank" rel="noopener noreferrer">
                  @beegrub.binus
                </a>
              </div>
            </div>
            <div className="contact-method">
              <div className="method-icon">🎵</div>
              <div className="method-info">
                <h4>TikTok</h4>
                <a href="https://tiktok.com/@beegrub" target="_blank" rel="noopener noreferrer">
                  @beegrub
                </a>
              </div>
            </div>
            <div className="contact-method">
              <div className="method-icon">📍</div>
              <div className="method-info">
                <h4>Lokasi</h4>
                <p>BINUS Anggrek Campus<br />Jakarta, Indonesia</p>
              </div>
            </div>
          </div>
        </div>

        <div className="faq-section">
          <h3>Pertanyaan yang Sering Diajukan</h3>
          <div className="faq-list">
            <details className="faq-item">
              <summary>Bagaimana cara kerja BeeGrub?</summary>
              <p>Pesan makanan 2-3 jam sebelumnya lewat aplikasi, pilih waktu dan lokasi pickup, lalu ambil pesanan saat siap. Tanpa antre!</p>
            </details>
            <details className="faq-item">
              <summary>Berapa biaya layanan BeeGrub?</summary>
              <p>Biaya layanan flat Rp 3.000 per pesanan. Ini sudah termasuk koordinasi pickup dan sistem platform. Harga menu dari kantin dibayar penuh kepada vendor.</p>
            </details>
            <details className="faq-item">
              <summary>Apakah BeeGrub hanya untuk BINUS Anggrek?</summary>
              <p>Saat ini fokus di BINUS Anggrek. Kami berencana ekspansi ke kampus BINUS lainnya setelah MVP sukses.</p>
            </details>
            <details className="faq-item">
              <summary>Metode pembayaran apa saja yang tersedia?</summary>
              <p>Kami menerima QRIS, e-wallet (GoPay, OVO, Dana, ShopeePay), dan mobile banking melalui payment gateway yang aman.</p>
            </details>
            <details className="faq-item">
              <summary>Bagaimana cara vendor bergabung?</summary>
              <p>Kantin dapat mendaftar melalui aplikasi atau menghubungi kami. Setelah verifikasi dan persetujuan admin, Anda siap menerima pesanan!</p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
