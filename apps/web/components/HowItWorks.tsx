export default function HowItWorks() {
  return (
    <section id="how">
      <div className="reveal section-label">Como funciona</div>
      <h2 className="reveal section-title" style={{ maxWidth: '540px', transitionDelay: '.08s' }}>
        Três passos para economizar de verdade
      </h2>
      <div className="how-steps">
        <div className="how-step reveal" style={{ transitionDelay: '.1s' }}>
          <div className="how-num">01</div>
          <div className="how-step-arrow">→</div>
          <div className="how-title">Crie sua lista de compras</div>
          <div className="how-desc">Adicione produtos manualmente, por código de barras ou voz. Organize por categoria e compartilhe com a família em tempo real.</div>
        </div>
        <div className="how-step reveal" style={{ transitionDelay: '.16s' }}>
          <div className="how-num">02</div>
          <div className="how-step-arrow">→</div>
          <div className="how-title">Compare preços na sua região</div>
          <div className="how-desc">A plataforma consulta dados colaborativos reais para comparar o preço total da sua lista nos supermercados próximos a você.</div>
        </div>
        <div className="how-step reveal" style={{ transitionDelay: '.22s' }}>
          <div className="how-num">03</div>
          <div className="how-title">Vá ao mercado mais barato</div>
          <div className="how-desc">Receba a sugestão do melhor mercado para sua lista completa e notificações quando um produto baixar de preço.</div>
        </div>
      </div>
    </section>
  )
}
