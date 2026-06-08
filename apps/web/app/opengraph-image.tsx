import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Lista Smart — Economize nas compras do supermercado'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0c0a08',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 100px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background:
              'radial-gradient(ellipse 60% 80% at 30% 50%, rgba(196,122,42,0.18), transparent)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background:
              'radial-gradient(ellipse 40% 60% at 85% 80%, rgba(61,170,42,0.08), transparent)',
          }}
        />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '52px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '13px',
              background: 'linear-gradient(135deg, #C47A2A, #8B4A10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '900',
              color: 'white',
              letterSpacing: '-0.5px',
            }}
          >
            LS
          </div>
          <span style={{ fontSize: '32px', fontWeight: '800', color: '#EDE8E2', letterSpacing: '-1px' }}>
            Lista Smart
          </span>
        </div>

        {/* Headline */}
        <div style={{ fontSize: '70px', fontWeight: '800', color: '#EDE8E2', letterSpacing: '-3px', lineHeight: '1.04', marginBottom: '12px' }}>
          Economize até
        </div>
        <div style={{ fontSize: '70px', fontWeight: '800', color: '#E8A050', letterSpacing: '-3px', lineHeight: '1.04', marginBottom: '32px' }}>
          R$ 400 por mês.
        </div>

        {/* Sub */}
        <div style={{ fontSize: '24px', color: '#7A7168', lineHeight: '1.5', maxWidth: '680px', marginBottom: '52px' }}>
          Compare os preços da sua lista de compras em supermercados da sua cidade. Grátis.
        </div>

        {/* CTA pill */}
        <div
          style={{
            padding: '16px 36px',
            background: 'linear-gradient(160deg, #E8A050, #C47A2A)',
            borderRadius: '99px',
            fontSize: '22px',
            fontWeight: '700',
            color: '#1a0d00',
          }}
        >
          Comparar preços agora →
        </div>
      </div>
    ),
    { ...size }
  )
}
