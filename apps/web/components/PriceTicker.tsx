const ITEMS = [
  { left: 'Arroz 5kg — Atacadão', leftPrice: 'R$ 22,90', leftDir: 'dn', right: 'Pão de Açúcar', rightPrice: 'R$ 34,20', rightDir: 'up' },
  { left: 'Frango peito — Extra', leftPrice: 'R$ 14,90/kg', leftDir: 'dn', right: 'Carrefour', rightPrice: 'R$ 19,80/kg', rightDir: 'up' },
  { left: 'Leite integral 1L — Atacadão', leftPrice: 'R$ 4,89', leftDir: 'dn', right: 'Pão de Açúcar', rightPrice: 'R$ 6,49', rightDir: 'up' },
  { left: 'Feijão carioca 1kg — BIG', leftPrice: 'R$ 7,20', leftDir: 'dn', right: 'Extra', rightPrice: 'R$ 11,80', rightDir: 'up' },
  { left: 'Ovos 12un — Atacadão', leftPrice: 'R$ 10,90', leftDir: 'dn', right: 'Pão de Açúcar', rightPrice: 'R$ 14,80', rightDir: 'up' },
]

export default function PriceTicker() {
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div className="ticker">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span key={i} className="ticker-item">
            {item.left} <span className={item.leftDir}>{item.leftPrice}</span>{' '}
            <span className="ticker-sep">vs</span>{' '}
            {item.right} <span className={item.rightDir}>{item.rightPrice}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
