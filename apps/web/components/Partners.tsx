import ContactForm from './ContactForm'

const BENEFITS = [
  { num: '01', title: 'Visibilidade qualificada', desc: 'Apareça para consumidores que já estão criando listas de compras e buscando onde comprar. Tráfego com intenção real de compra.' },
  { num: '02', title: 'Inteligência de preços', desc: 'Veja em quais produtos você está mais caro que a concorrência, em quais está mais barato e onde há oportunidade de promoção estratégica.' },
  { num: '03', title: 'Dashboard de competitividade', desc: 'Relatórios de produtos mais pesquisados, ranking de preços por categoria, número de visualizações e desempenho frente à concorrência.' },
  { num: '04', title: 'Promoções segmentadas', desc: 'Cadastre ofertas e destaque promoções para usuários próximos da sua loja no momento em que estão montando a lista de compras.' },
  { num: '05', title: 'Relatórios exportáveis', desc: 'Exporte dados de comparação de preços, produtos mais pesquisados e comportamento de consumo em PDF ou CSV para uso interno.' },
  { num: '06', title: 'Dados de consumo local', desc: 'Entenda o comportamento de compra da sua região: quais produtos têm maior elasticidade de preço e onde seus clientes também compram.' },
]

export default function Partners() {
  return (
    <section id="partners">
      <div className="partners-header">
        <div>
          <div className="partners-eyebrow reveal">Para supermercados parceiros</div>
          <h2 className="reveal partners-title" style={{ transitionDelay: '.08s' }}>
            Sua loja na lista de compras de milhares de consumidores.
          </h2>
        </div>
        <div className="reveal" style={{ transitionDelay: '.1s' }}>
          <p className="partners-desc">
            O Lista Smart entrega visibilidade, inteligência de preços e oportunidades de promoção para supermercados que querem estar onde o consumidor já está tomando decisão de compra.
          </p>
          <a href="#contact" className="btn btn-amber" style={{ marginTop: '24px', display: 'inline-flex' }}>
            Quero ser parceiro
          </a>
        </div>
      </div>

      <div className="partners-benefits">
        {BENEFITS.map((b, i) => (
          <div key={b.num} className="pb-card reveal" style={{ transitionDelay: `${.1 + i * .05}s` }}>
            <div className="pb-num">{b.num}</div>
            <div className="pb-title">{b.title}</div>
            <div className="pb-desc">{b.desc}</div>
          </div>
        ))}
      </div>

      <ContactForm />
    </section>
  )
}
