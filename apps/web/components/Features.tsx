import CheckIcon from '@/components/ui/CheckIcon'

type CompareRow = {
  rank: string
  name: string
  price: string
  diff: string | null
  best: boolean
  worst: boolean
}

type ListItem = {
  label: string
  done: boolean
  by?: string
}

const COMPARE_ROWS: CompareRow[] = [
  { rank: '1°', name: 'Atacadão · 1,4km',      price: 'R$ 13,90', diff: null,       best: true,  worst: false },
  { rank: '2°', name: 'Carrefour · 2,1km',      price: 'R$ 16,80', diff: '+R$ 2,90', best: false, worst: false },
  { rank: '3°', name: 'Extra Hiper · 0,8km',    price: 'R$ 18,40', diff: '+R$ 4,50', best: false, worst: false },
  { rank: '4°', name: 'Pão de Açúcar · 3,2km',  price: 'R$ 21,90', diff: '+R$ 8,00', best: false, worst: true  },
]

const PRICE_FEATURES = [
  'Comparação do total da lista entre mercados da sua cidade',
  'Sugestão automática do supermercado mais barato',
  'Notificações de queda de preço nos seus produtos favoritos',
]

const LIST_ITEMS: ListItem[] = [
  { label: 'Arroz 5kg',         done: true,  by: 'marcado por Ana' },
  { label: 'Feijão 2kg',        done: true,  by: 'marcado por Ana' },
  { label: 'Frango peito 1kg',  done: false                        },
]

const LIST_FEATURES = [
  'Sincronização instantânea entre celular e computador',
  'Histórico de listas e compras anteriores',
  'Funciona parcialmente offline para edição da lista',
]

export default function Features() {
  return (
    <section id="features">
      <div className="reveal section-label">Para consumidores</div>
      <h2
        className="reveal section-title"
        style={{ maxWidth: '580px', marginBottom: '56px', transitionDelay: '.08s' }}
      >
        Tudo que você precisa para comprar melhor
      </h2>

      {/* SPLIT 1 — Price comparison */}
      <div className="features-split">
        <div className="reveal" style={{ transitionDelay: '.05s' }}>
          <div className="feat-label">Comparação de preços</div>
          <h3 className="feat-title">O mesmo produto pode custar 40% mais em outro mercado</h3>
          <p className="feat-desc">
            Dados reais coletados por consumidores que, como você, escaneiam cupons fiscais e
            cadastram preços. Quanto mais gente usa, mais preciso fica.
          </p>
          <ul className="feat-list">
            {PRICE_FEATURES.map((item) => (
              <li key={item}>
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal" style={{ transitionDelay: '.18s' }}>
          <div className="fc-compare">
            <div className="fc-compare-head">
              Comparação de preços · Frango peito s/osso 1kg
            </div>
            <div className="fc-compare-body">
              {COMPARE_ROWS.map((row) => (
                <div key={row.rank} className="fc-compare-row">
                  <div className="fc-compare-rank">{row.rank}</div>
                  <div className="fc-compare-name">{row.name}</div>
                  <div className={`fc-compare-price${row.best ? ' best' : ''}`}>{row.price}</div>
                  {row.best && <div className="fc-compare-badge">Menor preço</div>}
                  {row.diff && (
                    <div className={`fc-compare-diff${row.worst ? ' worst' : ''}`}>{row.diff}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="fc-compare-foot">
              Atualizado há 3h · 124 registros de preço · São Paulo, SP
            </div>
          </div>
        </div>
      </div>

      {/* SPLIT 2 — Shared list */}
      <div className="features-split rev" style={{ marginTop: 0 }}>
        <div className="reveal" style={{ transitionDelay: '.05s' }}>
          <div className="feat-label">Lista compartilhada</div>
          <h3 className="feat-title">A mesma lista para toda a família</h3>
          <p className="feat-desc">
            Cada membro acessa e edita a lista em tempo real, pelo celular ou pelo computador.
            Quando alguém marca um item no mercado, todo mundo vê na hora.
          </p>
          <ul className="feat-list">
            {LIST_FEATURES.map((item) => (
              <li key={item}>
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal" style={{ transitionDelay: '.18s' }}>
          <div className="fc-list">
            <div className="fc-list-title">Lista da semana · Família Silva</div>
            <div className="fc-list-sublabel">Editando agora</div>
            <div className="fc-list-active">
              <div className="fc-list-av">A</div>
              <div className="fc-list-active-info">
                <strong>Ana</strong> está no Atacadão agora
              </div>
              <div className="fc-list-live">● ao vivo</div>
            </div>
            <div className="fc-list-items">
              {LIST_ITEMS.map((item) => (
                <div key={item.label} className={`fc-list-item${item.done ? ' done' : ''}`}>
                  {item.done ? (
                    <div className="fc-list-check">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        stroke="#000"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <polyline points="1.5,5 4,7.5 8.5,2" />
                      </svg>
                    </div>
                  ) : (
                    <div className="fc-list-circle" />
                  )}
                  <span className={`fc-list-item-name${item.done ? ' done' : ''}`}>
                    {item.label}
                  </span>
                  {item.by && <span className="fc-list-item-by">{item.by}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
