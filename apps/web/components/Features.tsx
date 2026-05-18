function CheckIcon() {
  return (
    <div className="feat-check">
      <svg viewBox="0 0 9 9" fill="none" strokeLinecap="round">
        <polyline points="1.5,4.5 3.5,6.5 7.5,1.5" />
      </svg>
    </div>
  )
}

export default function Features() {
  return (
    <section id="features">
      <div className="reveal section-label">Para consumidores</div>
      <h2 className="reveal section-title" style={{ maxWidth: '580px', marginBottom: '56px', transitionDelay: '.08s' }}>
        Tudo que você precisa para comprar melhor
      </h2>

      {/* SPLIT 1 — Price comparison */}
      <div className="features-split">
        <div className="reveal" style={{ transitionDelay: '.05s' }}>
          <div className="feat-label">Comparação de preços</div>
          <h3 className="feat-title">O mesmo produto pode custar 40% mais em outro mercado</h3>
          <p className="feat-desc">Dados reais coletados por consumidores que, como você, escaneiam cupons fiscais e cadastram preços. Quanto mais gente usa, mais preciso fica.</p>
          <ul className="feat-list">
            <li><CheckIcon />Comparação do total da lista entre mercados da sua cidade</li>
            <li><CheckIcon />Sugestão automática do supermercado mais barato</li>
            <li><CheckIcon />Notificações de queda de preço nos seus produtos favoritos</li>
          </ul>
        </div>
        <div className="reveal" style={{ transitionDelay: '.18s' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
              Comparação de preços · Frango peito s/osso 1kg
            </div>
            <div style={{ padding: '12px 0' }}>
              {[
                { rank: '1°', name: 'Atacadão · 1,4km', price: 'R$ 13,90', diff: null, best: true },
                { rank: '2°', name: 'Carrefour · 2,1km', price: 'R$ 16,80', diff: '+R$ 2,90', best: false },
                { rank: '3°', name: 'Extra Hiper · 0,8km', price: 'R$ 18,40', diff: '+R$ 4,50', best: false },
                { rank: '4°', name: 'Pão de Açúcar · 3,2km', price: 'R$ 21,90', diff: '+R$ 8,00', worst: true, best: false },
              ].map((row) => (
                <div key={row.rank} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', width: '20px', fontFamily: 'var(--mono)' }}>{row.rank}</div>
                  <div style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{row.name}</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--mono)', color: row.best ? 'var(--green-lt)' : 'var(--text-sub)' }}>{row.price}</div>
                  {row.best && <div style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px', background: 'var(--green-subtle)', color: 'var(--green-lt)', border: '1px solid var(--green-border)' }}>Menor preço</div>}
                  {row.diff && <div style={{ fontSize: '10px', color: row.worst ? 'var(--red-lt)' : 'var(--text-muted)', paddingRight: '4px' }}>{row.diff}</div>}
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 20px', background: 'rgba(196,122,42,.05)', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)' }}>
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
          <p className="feat-desc">Cada membro acessa e edita a lista em tempo real, pelo celular ou pelo computador. Quando alguém marca um item no mercado, todo mundo vê na hora.</p>
          <ul className="feat-list">
            <li><CheckIcon />Sincronização instantânea entre celular e computador</li>
            <li><CheckIcon />Histórico de listas e compras anteriores</li>
            <li><CheckIcon />Funciona parcialmente offline para edição da lista</li>
          </ul>
        </div>
        <div className="reveal" style={{ transitionDelay: '.18s' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Lista da semana · Família Silva</div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Editando agora</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(61,170,42,.06)', border: '1px solid var(--green-border)', borderRadius: 'var(--r-sm)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#60A5FA,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>A</div>
              <div style={{ flex: 1, fontSize: '12px', color: 'var(--text-sub)' }}><strong style={{ color: 'var(--text)' }}>Ana</strong> está no Atacadão agora</div>
              <div style={{ fontSize: '10px', color: 'var(--green-lt)' }}>● ao vivo</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Arroz 5kg', done: true, by: 'marcado por Ana' },
                { label: 'Feijão 2kg', done: true, by: 'marcado por Ana' },
                { label: 'Frango peito 1kg', done: false },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: item.done ? '1px solid var(--border)' : 'none' }}>
                  {item.done ? (
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--green-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round"><polyline points="1.5,5 4,7.5 8.5,2" /></svg>
                    </div>
                  ) : (
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--border2)', flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: '12px', fontWeight: 600, color: item.done ? 'var(--text-muted)' : 'var(--text)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</span>
                  {item.by && <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{item.by}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
