export default function Footer() {
  return (
    <>
      <footer>
        <div className="fl-brand">
          <a href="#" className="fl-logo">
            <div className="fl-icon">
              <svg width="30" height="30" viewBox="0 0 30 30">
                <use href="#ls-icon" width="30" height="30" />
              </svg>
            </div>
            Lista Smart
          </a>
          <p className="fl-desc">A plataforma de comparação de preços de supermercados para famílias brasileiras. Startup registrada.</p>
          <div className="fl-socials">
            <a href="#" className="fl-social" aria-label="Twitter / X">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            <a href="#" className="fl-social" aria-label="Instagram">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
              </svg>
            </a>
            <a href="#" className="fl-social" aria-label="LinkedIn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <div className="fc-title">Para consumidores</div>
          <ul className="fc-links">
            <li><a href="#">Comparar preços</a></li>
            <li><a href="#">Criar lista</a></li>
            <li><a href="#">Novidades</a></li>
            <li><a href="#">Baixar o app</a></li>
          </ul>
        </div>

        <div>
          <div className="fc-title">Para supermercados</div>
          <ul className="fc-links">
            <li><a href="#partners">Ser parceiro</a></li>
            <li><a href="#">Dashboard</a></li>
            <li><a href="#">Cadastrar promoções</a></li>
            <li><a href="#contact">Falar com a equipe</a></li>
          </ul>
        </div>

        <div>
          <div className="fc-title">Empresa</div>
          <ul className="fc-links">
            <li><a href="#">Sobre a Lista Smart</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Privacidade</a></li>
            <li><a href="#">Termos de uso</a></li>
          </ul>
        </div>
      </footer>

      <div className="footer-bottom">
        <span>© 2026 Lista Smart. Todos os direitos reservados. Startup registrada no Brasil.</span>
        <span>Feito no Brasil 🇧🇷</span>
      </div>
    </>
  )
}
