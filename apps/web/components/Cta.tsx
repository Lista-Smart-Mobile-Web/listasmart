export default function Cta() {
  return (
    <section id="cta">
      <div className="cta-line cta-line-1" />
      <div className="cta-line cta-line-2" />
      <div className="reveal" style={{ position: "relative", zIndex: 1 }}>
        <h2 className="cta-title">
          Comece a economizar
          <br />
          <span style={{ color: "var(--amber-lt)" }}>agora mesmo.</span>
        </h2>
        <p className="cta-sub">
          Disponível para iOS, Android e direto pelo navegador. Grátis.
        </p>
        <div className="cta-actions">
          <a href="#" className="store-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--text)">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div>
              <div className="sbl">Baixar na</div>
              <div className="sbn">App Store</div>
            </div>
          </a>
          <a href="#" className="store-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3.18 23.76A2 2 0 012 22V2a2 2 0 011.18-1.76l11.04 11.73L3.18 23.76z"
                fill="#EA4335"
              />
              <path
                d="M20.4 10.32l-2.64-1.48-3.12 3.32 3.12 3.32 2.68-1.5A2 2 0 0020.4 10.32z"
                fill="#FBBC04"
              />
              <path
                d="M3.18.24L14.22 11.97 17.76 8.4 5.12.36A2 2 0 003.18.24z"
                fill="#4285F4"
              />
              <path
                d="M3.18 23.76c.6.34 1.3.36 1.94.06l12.64-8.06-3.54-3.79L3.18 23.76z"
                fill="#34A853"
              />
            </svg>
            <div>
              <div className="sbl">Baixar no</div>
              <div className="sbn">Google Play</div>
            </div>
          </a>
          <a
            href="https://listasmart.com/"
            className="btn btn-amber btn-lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Acessar na Web →
          </a>
        </div>
        <div className="cta-note">
          iOS · Android · Web · Grátis para consumidores
        </div>
      </div>
    </section>
  );
}
