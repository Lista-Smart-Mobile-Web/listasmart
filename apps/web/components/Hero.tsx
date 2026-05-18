export default function Hero() {
  return (
    <section id="hero">
      <div className="hero-grain" />

      <div style={{ animation: 'fadeUp .7s ease both .1s' }}>
        <div className="hero-eyebrow">Lista Smart · Comparação de preços</div>
        <h1 className="hero-headline">
          Você pode estar<br />
          pagando <em>mais caro</em><br />
          sem perceber.
        </h1>
        <p className="hero-sub">
          A Lista Smart compara os preços da sua lista em supermercados da sua cidade e indica onde comprar pelo menor preço. Economize até R$ 400 por mês.
        </p>
        <div className="hero-actions">
          <a href="#cta" className="btn btn-amber btn-lg">Comparar preços agora</a>
          <a href="#how" className="btn btn-ghost btn-lg">Ver como funciona</a>
        </div>
        <div className="hero-proof">
          <div className="hero-proof-avatars">
            <span style={{ background: 'linear-gradient(135deg,#C47A2A,#8B4A10)' }}>M</span>
            <span style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>R</span>
            <span style={{ background: 'linear-gradient(135deg,#5DC84A,#2E8B1A)' }}>J</span>
            <span style={{ background: 'linear-gradient(135deg,#A855F7,#7C3AED)' }}>A</span>
          </div>
          <div className="hero-proof-text"><strong>+62 mil famílias</strong> já economizam todo mês</div>
        </div>
      </div>

      <div style={{ animation: 'fadeUp .8s ease both .3s' }}>
        <div className="price-widget">
          <div className="pw-header">
            <div>
              <div className="pw-header-title">Lista da semana · 12 produtos</div>
              <div className="pw-header-meta" style={{ marginTop: '4px' }}>
                <div className="pw-live" />
                Preços atualizados agora · São Paulo, SP
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
            </svg>
          </div>
          <div className="pw-products">
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Sua lista</div>
            <div className="pw-product-row">
              <div className="pw-product-dot" />
              <div className="pw-product-name">Arroz Camil 5kg</div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>× 1</div>
            </div>
            <div className="pw-product-row">
              <div className="pw-product-dot" />
              <div className="pw-product-name">Feijão Carioca 1kg</div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>× 2</div>
            </div>
            <div className="pw-product-row">
              <div className="pw-product-dot" />
              <div className="pw-product-name">Leite Integral 1L</div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>× 6</div>
            </div>
            <div className="pw-product-row" style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '11px', paddingTop: '4px' }}>+ 9 outros itens</div>
          </div>
          <div className="pw-results">
            <div className="pw-result-label">Resultado da comparação</div>
            <div className="pw-row best">
              <div className="pw-rank">1°</div>
              <div className="pw-market">Atacadão</div>
              <div className="pw-price">R$ 142,80</div>
              <div className="pw-save-tag">Economize R$ 44,60</div>
            </div>
            <div className="pw-row">
              <div className="pw-rank">2°</div>
              <div className="pw-market">Extra Hiper</div>
              <div className="pw-price">R$ 167,40</div>
            </div>
            <div className="pw-row">
              <div className="pw-rank">3°</div>
              <div className="pw-market">Pão de Açúcar</div>
              <div className="pw-price">R$ 198,30</div>
            </div>
            <div className="pw-cta-row">
              <button className="pw-cta-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Comparar minha lista
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
