import type { ReactNode } from 'react'

type StatItem = {
  value: string
  label: string
  iconBg: string
  icon: ReactNode
}

const ITEMS: StatItem[] = [
  {
    value: '+62 mil',
    label: 'Famílias ativas no Brasil',
    iconBg: 'var(--amber-subtle)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--amber-lt)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    value: '4.8 / 5',
    label: 'Nota média · 28 mil avaliações',
    iconBg: 'var(--green-subtle)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-lt)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    value: 'R$ 127',
    label: 'Economizados por família/mês',
    iconBg: 'var(--amber-subtle)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--amber-lt)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    value: '4,2 mi',
    label: 'Itens comprados via app',
    iconBg: 'rgba(59,130,246,.1)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
]

export default function Stats() {
  return (
    <div id="stats">
      <div className="stats-grid">
        {ITEMS.map((item) => (
          <div key={item.value} className="stat-cell">
            <div className="stat-icon" style={{ background: item.iconBg }}>
              {item.icon}
            </div>
            <div>
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
