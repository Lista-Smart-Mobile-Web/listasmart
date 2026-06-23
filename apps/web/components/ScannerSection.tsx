import CheckIcon from '@/components/ui/CheckIcon'

type ScanItem = {
  product: string
  store: string
  price: string
  status: 'new' | 'dup'
  label: string
}

const SCAN_ITEMS: ScanItem[] = [
  { product: 'Arroz Camil 5kg',            store: 'Atacadão · R. Augusta, 1890', price: 'R$ 22,90', status: 'new', label: 'Novo'        },
  { product: 'Leite Integral Italac 1L',   store: 'Atacadão · R. Augusta, 1890', price: 'R$ 4,89',  status: 'new', label: 'Novo'        },
  { product: 'Feijão Carioca Kicaldo 1kg', store: 'Atacadão · R. Augusta, 1890', price: 'R$ 7,20',  status: 'dup', label: 'Confirmado'  },
]

const COLLAB_FEATURES = [
  'Leitura de QR Code do cupom fiscal diretamente pelo app',
  'Cadastro manual quando o cupom não estiver disponível',
  'Sistema de pontuação e ranking para colaboradores frequentes',
  'Validação automática para manter dados confiáveis',
]

export default function ScannerSection() {
  return (
    <section id="scanner">
      <div className="scanner-visual reveal" style={{ transitionDelay: '.05s' }}>
        <div className="scanner-top">
          <div className="scanner-top-title">Envio de cupom fiscal</div>
          <div className="scanner-top-sub">Aponte a câmera para o QR Code do cupom</div>
        </div>
        <div className="scanner-cam-wrap">
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
          <div className="scanner-results-label">Itens identificados no cupom</div>
          {SCAN_ITEMS.map((item) => (
            <div key={item.product} className="scan-result-item">
              <div className="scan-result-info">
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
          Os preços do Lista Smart vêm de consumidores reais que escaneiam cupons fiscais no
          supermercado. Quanto mais pessoas contribuem, mais precisa e atual fica a comparação
          para todo mundo.
        </p>
        <ul className="feat-list" style={{ marginTop: '28px' }}>
          {COLLAB_FEATURES.map((item) => (
            <li key={item}>
              <CheckIcon />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
