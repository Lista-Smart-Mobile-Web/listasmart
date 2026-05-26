// Paleta extraída do protótipo ListaSmart (tema escuro + âmbar)
export const Colors = {
  // Backgrounds
  bg: '#0c0a08',
  bgDeep: '#070504',
  surface: '#181310',
  surfaceElevated: '#1e1a16',

  // Borders
  border: 'rgba(255,255,255,0.07)',
  borderMed: 'rgba(255,255,255,0.12)',

  // Âmbar (brand)
  primary: '#C47A2A',
  primaryLight: '#E8A050',
  primaryDim: 'rgba(196,122,42,0.12)',
  primaryBorder: 'rgba(196,122,42,0.3)',

  // Text
  text: '#EDE8E2',
  textSecondary: '#7A7168',
  textMuted: '#4A4540',

  // Semantic
  success: '#3DAA2A',
  successDim: 'rgba(61,170,42,0.12)',
  error: '#E05050',
  errorDim: 'rgba(224,80,80,0.12)',
  warning: '#E8A050',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const

export type ColorKey = keyof typeof Colors
