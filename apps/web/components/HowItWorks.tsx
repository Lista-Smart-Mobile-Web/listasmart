type Step = {
  num: string
  title: string
  desc: string
  hasArrow: boolean
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Crie sua lista de compras',
    desc: 'Adicione produtos manualmente, por código de barras ou voz. Organize por categoria e compartilhe com a família em tempo real.',
    hasArrow: true,
  },
  {
    num: '02',
    title: 'Compare preços na sua região',
    desc: 'A plataforma consulta dados colaborativos reais para comparar o preço total da sua lista nos supermercados próximos a você.',
    hasArrow: true,
  },
  {
    num: '03',
    title: 'Vá ao mercado mais barato',
    desc: 'Receba a sugestão do melhor mercado para sua lista completa e notificações quando um produto baixar de preço.',
    hasArrow: false,
  },
]

export default function HowItWorks() {
  return (
    <section id="how">
      <div className="reveal section-label">Como funciona</div>
      <h2 className="reveal section-title" style={{ maxWidth: '540px', transitionDelay: '.08s' }}>
        Três passos para economizar de verdade
      </h2>
      <div className="how-steps">
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            className="how-step reveal"
            style={{ transitionDelay: `${0.1 + i * 0.06}s` }}
          >
            <div className="how-num">{step.num}</div>
            {step.hasArrow && <div className="how-step-arrow">→</div>}
            <div className="how-title">{step.title}</div>
            <div className="how-desc">{step.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
