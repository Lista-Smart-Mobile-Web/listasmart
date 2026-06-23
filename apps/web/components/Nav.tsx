'use client'

import { useEffect, useState } from 'react'

const APP_URL = 'https://www.listasmart.com.br'

const LINKS = [
  { href: '#features', label: 'Para você' },
  { href: '#partners', label: 'Para supermercados' },
  { href: '#how', label: 'Como funciona' },
  { href: '#compare', label: 'Comparar preços' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const sectionIds = LINKS.map(l => l.href.slice(1))
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setActiveId(e.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

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

        {/* Desktop nav links — hidden on mobile */}
        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className={activeId === l.href.slice(1) ? 'active' : ''}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop right actions — hidden on mobile via .nav-desktop-btn */}
        <div className="nav-right">
          <a href="#partners" className="btn btn-ghost nav-desktop-btn">Quero ser parceiro</a>
          <a
            href={APP_URL}
            className="btn btn-amber nav-desktop-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Começar agora
          </a>
          <button
            className={`nav-hamburger${open ? ' open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={`mobile-menu${open ? ' open' : ''}`} aria-hidden={!open}>
        {/* Nav links */}
        <nav className="mobile-nav">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="mob-link" onClick={close}>
              {l.label}
              <span className="mob-arrow">→</span>
            </a>
          ))}
        </nav>

        {/* CTAs pinned to bottom */}
        <div className="mob-footer">
          <a
            href={APP_URL}
            className="mob-cta-primary"
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
          >
            Comparar preços agora
          </a>
          <a href="#partners" className="mob-cta-secondary" onClick={close}>
            Quero ser parceiro
          </a>
        </div>
      </div>
    </>
  )
}
