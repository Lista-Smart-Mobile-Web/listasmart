'use client'

import { useEffect, useState } from 'react'

const LINKS = [
  { href: '#features', label: 'Para você' },
  { href: '#partners', label: 'Para supermercados' },
  { href: '#how', label: 'Como funciona' },
  { href: '#compare', label: 'Comparar preços' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <a href="#" className="nav-logo" onClick={close}>
          <div className="nav-icon">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <use href="#ls-icon" width="32" height="32" />
            </svg>
          </div>
          Lista Smart
        </a>

        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
        </ul>

        <div className="nav-right">
          <a href="#partners" className="btn btn-ghost">Quero ser parceiro</a>
          <a href="#cta" className="btn btn-amber">Começar agora</a>
          <button
            className={`nav-hamburger${open ? ' open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${open ? ' open' : ''}`} aria-hidden={!open}>
        <nav className="mobile-nav">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
          ))}
        </nav>
        <div className="mobile-nav-footer">
          <a href="#partners" className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={close}>
            Quero ser parceiro
          </a>
          <a href="#cta" className="btn btn-amber" style={{ justifyContent: 'center' }} onClick={close}>
            Começar agora
          </a>
        </div>
      </div>
    </>
  )
}
