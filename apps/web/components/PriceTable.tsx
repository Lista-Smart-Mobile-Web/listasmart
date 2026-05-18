type ColKey = 'atacadao' | 'extra' | 'pao' | 'carrefour'

type Row = {
  product: string
  bestCol: ColKey
  worstCol: ColKey | null
} & Record<ColKey, string>

const COLS: { key: ColKey; label: string }[] = [
  { key: 'atacadao', label: 'Atacadão' },
  { key: 'extra', label: 'Extra Hiper' },
  { key: 'pao', label: 'Pão de Açúcar' },
  { key: 'carrefour', label: 'Carrefour' },
]

const ROWS: Row[] = [
  { product: 'Arroz Camil 5kg',       atacadao: 'R$ 22,90', extra: 'R$ 31,20', pao: 'R$ 34,20', carrefour: 'R$ 28,40', bestCol: 'atacadao', worstCol: 'pao' },
  { product: 'Feijão carioca 1kg',    atacadao: 'R$ 7,20',  extra: 'R$ 9,80',  pao: 'R$ 11,20', carrefour: 'R$ 11,90', bestCol: 'atacadao', worstCol: 'carrefour' },
  { product: 'Leite integral 1L',     atacadao: 'R$ 4,89',  extra: 'R$ 5,40',  pao: 'R$ 6,49',  carrefour: 'R$ 5,20',  bestCol: 'atacadao', worstCol: null },
  { product: 'Frango peito s/osso 1kg', atacadao: 'R$ 13,90', extra: 'R$ 18,40', pao: 'R$ 21,90', carrefour: 'R$ 16,80', bestCol: 'atacadao', worstCol: 'pao' },
  { product: 'Ovos caipira 12un',     atacadao: 'R$ 11,90', extra: 'R$ 10,90', pao: 'R$ 14,80', carrefour: 'R$ 15,20', bestCol: 'extra',    worstCol: 'carrefour' },
  { product: 'Óleo de soja 900ml',    atacadao: 'R$ 6,90',  extra: 'R$ 8,40',  pao: 'R$ 9,80',  carrefour: 'R$ 8,10',  bestCol: 'atacadao', worstCol: 'pao' },
  { product: 'Açúcar cristal 1kg',    atacadao: 'R$ 3,90',  extra: 'R$ 5,20',  pao: 'R$ 5,80',  carrefour: 'R$ 6,40',  bestCol: 'atacadao', worstCol: 'carrefour' },
]

function cellClass(col: ColKey, row: Row): string {
  const cls: string[] = []
  if (row.bestCol === col) cls.push('best-price', 'best-col')
  if (row.worstCol === col) cls.push('worst-price')
  return cls.join(' ')
}

export default function PriceTable() {
  return (
    <section id="compare">
      <div className="compare-header">
        <div className="reveal section-label">Comparação real</div>
        <h2 className="reveal section-title" style={{ maxWidth: '580px', marginBottom: '12px', transitionDelay: '.08s' }}>
          Preços reais.<br />Diferença real.
        </h2>
        <p className="reveal" style={{ fontSize: '15px', color: 'var(--text-sub)', lineHeight: 1.7, transitionDelay: '.12s' }}>
          Dados coletados por consumidores reais por leitura de cupom fiscal e cadastro manual de preços. O mesmo carrinho pode custar até 38% a mais dependendo de onde você compra.
        </p>
      </div>

      <div className="reveal table-outer" style={{ transitionDelay: '.1s' }}>
        <div className="table-wrap">
          <table className="price-table">
            <thead>
              <tr>
                <th>Produto</th>
                {COLS.map((c) => <th key={c.key}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.product}>
                  <td>{row.product}</td>
                  {COLS.map((c) => (
                    <td key={c.key} className={cellClass(c.key, row)}>
                      {row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total da lista (7 itens)</td>
                <td className="best-col" style={{ color: 'var(--green-lt)' }}>R$ 71,59</td>
                <td>R$ 89,30</td>
                <td>R$ 104,19</td>
                <td style={{ color: 'var(--text-muted)' }}>R$ 92,00</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <p className="reveal table-note" style={{ transitionDelay: '.14s' }}>
        Preços coletados em São Paulo, SP · Dados de demonstração · Podem variar por unidade e data
      </p>

      <div className="compare-summary">
        <div className="compare-card best reveal" style={{ transitionDelay: '.1s' }}>
          <div className="cc-label">Mais barato</div>
          <div className="cc-market">Atacadão</div>
          <div className="cc-total green">R$ 71,59</div>
          <div className="cc-save">Você economiza R$ 32,60 vs. Pão de Açúcar</div>
          <div className="cc-badge">
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <polyline points="1.5,4.5 3.5,6.5 7.5,1.5" />
            </svg>
            Recomendado pelo Lista Smart
          </div>
        </div>
        <div className="compare-card reveal" style={{ transitionDelay: '.15s' }}>
          <div className="cc-label">Intermediário</div>
          <div className="cc-market">Extra Hiper</div>
          <div className="cc-total" style={{ color: 'var(--text-sub)' }}>R$ 89,30</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>R$ 17,71 a mais que o Atacadão</div>
        </div>
        <div className="compare-card reveal" style={{ transitionDelay: '.2s' }}>
          <div className="cc-label">Mais caro</div>
          <div className="cc-market">Pão de Açúcar</div>
          <div className="cc-total" style={{ color: 'var(--text-muted)' }}>R$ 104,19</div>
          <div style={{ fontSize: '13px', color: 'var(--red-lt)', marginTop: '2px' }}>R$ 32,60 a mais que o Atacadão</div>
        </div>
      </div>
    </section>
  )
}
