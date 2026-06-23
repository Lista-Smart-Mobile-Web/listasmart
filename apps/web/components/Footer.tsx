const APP_URL = 'https://www.listasmart.com.br'

type FooterLink = {
  label: string
  href: string
  external?: boolean
  disabled?: boolean
}

const CONSUMER_LINKS: FooterLink[] = [
  { label: 'Comparar preços', href: APP_URL, external: true },
  { label: 'Criar lista',     href: APP_URL, external: true },
  { label: 'Novidades',       href: '#',     disabled: true  },
  { label: 'Baixar o app',    href: '#',     disabled: true  },
]

const PARTNER_LINKS: FooterLink[] = [
  { label: 'Ser parceiro',       href: '#partners'                },
  { label: 'Falar com a equipe', href: '#contact'                 },
  { label: 'Dashboard',          href: '#', disabled: true        },
  { label: 'Cadastrar promoções',href: '#', disabled: true        },
]

const COMPANY_LINKS: FooterLink[] = [
  { label: 'Sobre a Lista Smart', href: '#', disabled: true },
  { label: 'Blog',                href: '#', disabled: true },
  { label: 'Privacidade',         href: '#', disabled: true },
  { label: 'Termos de uso',       href: '#', disabled: true },
]

function FooterLinkItem({ link }: { link: FooterLink }) {
  if (link.disabled) {
    return (
      <li>
        <span className="fc-link-disabled" aria-disabled="true">
          {link.label}
        </span>
      </li>
    )
  }
  return (
    <li>
      <a
        href={link.href}
        {...(link.external
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
      >
        {link.label}
      </a>
    </li>
  )
}

export default function Footer() {
  return (
    <>
      <footer>
        <div className="fl-brand">
          <a href={APP_URL} className="fl-logo" target="_blank" rel="noopener noreferrer">
            <div className="fl-icon">
              <svg width="30" height="30" viewBox="0 0 30 30">
                <use href="#ls-icon" width="30" height="30" />
              </svg>
            </div>
            Lista Smart
          </a>
          <p className="fl-desc">
            A plataforma de comparação de preços de supermercados para famílias brasileiras.
            Startup registrada.
          </p>
          <div className="fl-socials">
            <a href="#" className="fl-social" aria-label="Twitter / X" title="Twitter / X">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            <a href="#" className="fl-social" aria-label="Instagram" title="Instagram">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
              </svg>
            </a>
            <a href="#" className="fl-social" aria-label="LinkedIn" title="LinkedIn">
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
            {CONSUMER_LINKS.map((link) => (
              <FooterLinkItem key={link.label} link={link} />
            ))}
          </ul>
        </div>

        <div>
          <div className="fc-title">Para supermercados</div>
          <ul className="fc-links">
            {PARTNER_LINKS.map((link) => (
              <FooterLinkItem key={link.label} link={link} />
            ))}
          </ul>
        </div>

        <div>
          <div className="fc-title">Empresa</div>
          <ul className="fc-links">
            {COMPANY_LINKS.map((link) => (
              <FooterLinkItem key={link.label} link={link} />
            ))}
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
