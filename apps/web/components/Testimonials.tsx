type Testimonial = {
  text: string
  initial: string
  bg: string
  name: string
  role: string
  avatarColor?: string
  delay: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    text: 'Uso para controlar gastos mensais com mercado. Meu marido não acreditava que dava pra economizar tanto só trocando onde compra. Mostrei os números e ele virou o maior fã do app.',
    initial: 'A',
    bg: 'linear-gradient(135deg,#60A5FA,#2563EB)',
    name: 'Ana Beatriz Ferreira',
    role: 'Professora · Curitiba, PR',
    delay: '.12s',
  },
  {
    text: 'Escaneei meu cupom fiscal no supermercado e em segundos vi que poderia ter pago R$ 38 a menos no Atacadão ao lado. Na semana seguinte já fui lá. A diferença foi absurda.',
    initial: 'R',
    bg: 'linear-gradient(135deg,#86EFAC,#16A34A)',
    name: 'Ricardo Souza',
    role: 'Engenheiro · Porto Alegre, RS',
    delay: '.16s',
  },
  {
    text: 'Implementamos o Lista Smart como parceiros e passamos a aparecer para mais de 8 mil consumidores na nossa região. As promoções que cadastramos geraram um aumento visível no movimento.',
    initial: 'J',
    bg: 'linear-gradient(135deg,var(--amber-lt),var(--amber))',
    name: 'João Pimentel',
    role: 'Gerente comercial · Supermercado Bom Preço',
    avatarColor: '#1a0d00',
    delay: '.2s',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials">
      <div className="reveal section-label">Depoimentos</div>
      <h2 className="reveal section-title" style={{ maxWidth: '500px', transitionDelay: '.08s' }}>
        Quem usa, economiza de verdade
      </h2>

      <div className="testi-layout">
        <div className="testi-featured reveal" style={{ transitionDelay: '.1s' }}>
          <div className="tf-stars" role="img" aria-label="5 de 5 estrelas">★★★★★</div>
          <div className="tf-text">
            &ldquo;Em três meses de uso, calculamos que economizamos mais de R$ 580 só mudando
            de supermercado para comprar itens específicos. O app me mostrou que o Atacadão tem
            o melhor preço no arroz e feijão, mas o Extra é mais barato nos laticínios. Nunca
            tinha parado pra pensar nisso.&rdquo;
          </div>
          <div className="tf-author">
            <div
              className="tf-av"
              style={{
                background: 'linear-gradient(135deg,var(--amber-lt),var(--amber))',
                fontSize: '16px',
                fontWeight: 800,
                color: '#1a0d00',
              }}
            >
              M
            </div>
            <div>
              <div className="tf-name">Mariana Costa</div>
              <div className="tf-role">Mãe de 2 · Vila Madalena, SP</div>
            </div>
          </div>
        </div>

        <div className="testi-list">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="tl-card reveal" style={{ transitionDelay: t.delay }}>
              <div className="tl-text">&ldquo;{t.text}&rdquo;</div>
              <div className="tl-author">
                <div
                  className="tl-av"
                  style={{ background: t.bg, color: t.avatarColor ?? undefined }}
                >
                  {t.initial}
                </div>
                <div>
                  <div className="tl-name">{t.name}</div>
                  <div className="tl-role">{t.role}</div>
                  <div className="tl-stars" role="img" aria-label="5 de 5 estrelas">★★★★★</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
