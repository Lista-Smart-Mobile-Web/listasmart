const APP_URL = 'https://www.listasmart.com.br'

export default function Cta() {
  return (
    <section id="cta">
      <div className="cta-line cta-line-1" />
      <div className="cta-line cta-line-2" />
      <div className="reveal" style={{ position: 'relative', zIndex: 1 }}>
        <h2 className="cta-title">
          Comece a economizar
          <br />
          <span style={{ color: 'var(--amber-lt)' }}>agora mesmo.</span>
        </h2>
        <p className="cta-sub">
          Disponível direto pelo navegador e em breve no iOS e Android. Grátis.
        </p>
        <div className="cta-actions">
          <a
            href={APP_URL}
            className="btn btn-amber btn-lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Acessar na Web →
          </a>
          <a href="#contact" className="btn btn-ghost btn-lg">
            Quero ser parceiro
          </a>
        </div>
        <div className="cta-note">
          App mobile em breve · iOS · Android · Grátis para consumidores
        </div>
      </div>
    </section>
  )
}
