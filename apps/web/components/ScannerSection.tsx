export default function ScannerSection() {
  return (
    <section id="scanner">
      <div className="scanner-visual reveal" style={{ transitionDelay: '.05s' }}>
        <div className="scanner-top">
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Envio de cupom fiscal</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Aponte a câmera para o QR Code do cupom</div>
        </div>
        <div style={{ padding: '14px' }}>
          <div className="scanner-cam">
            <div className="scan-corner tl" />
            <div className="scan-corner tr" />
            <div className="scan-corner bl" />
            <div className="scan-corner br" />
            <div className="scan-line" />
            <div className="scan-icon">▦</div>
          </div>
        </div>
        <div className="scanner-results">
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Itens identificados no cupom</div>
          {[
            { product: 'Arroz Camil 5kg', store: 'Atacadão · R. Augusta, 1890', price: 'R$ 22,90', status: 'new', label: 'Novo' },
            { product: 'Leite Integral Italac 1L', store: 'Atacadão · R. Augusta, 1890', price: 'R$ 4,89', status: 'new', label: 'Novo' },
            { product: 'Feijão Carioca Kicaldo 1kg', store: 'Atacadão · R. Augusta, 1890', price: 'R$ 7,20', status: 'dup', label: 'Confirmado' },
          ].map((item) => (
            <div key={item.product} className="scan-result-item">
              <div style={{ flex: 1 }}>
                <div className="sri-product">{item.product}</div>
                <div className="sri-store">{item.store}</div>
              </div>
              <div className="sri-price">{item.price}</div>
              <div className={`sri-status ${item.status}`}>{item.label}</div>
            </div>
          ))}
        </div>
        <div className="gamif-row">
          <div className="gamif-pts">+45 pts por este cupom · Total: 1.230 pts</div>
          <div className="gamif-badge">Colaborador Prata</div>
        </div>
      </div>

      <div className="reveal" style={{ transitionDelay: '.15s' }}>
        <div className="feat-label">Colaboração de preços</div>
        <h3 className="feat-title">Dados reais de quem compra de verdade</h3>
        <p className="feat-desc">
          Os preços do Lista Smart vêm de consumidores reais que escaneiam cupons fiscais no supermercado. Quanto mais pessoas contribuem, mais precisa e atual fica a comparação para todo mundo.
        </p>
        <ul className="feat-list" style={{ marginTop: '28px' }}>
          {[
            'Leitura de QR Code do cupom fiscal diretamente pelo app',
            'Cadastro manual quando o cupom não estiver disponível',
            'Sistema de pontuação e ranking para colaboradores frequentes',
            'Validação automática para manter dados confiáveis',
          ].map((item) => (
            <li key={item}>
              <div className="feat-check">
                <svg viewBox="0 0 9 9" fill="none" strokeLinecap="round">
                  <polyline points="1.5,4.5 3.5,6.5 7.5,1.5" />
                </svg>
              </div>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
