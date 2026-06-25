export function looksLikeFiscalQr(data: string, scannerType?: string): boolean {
  const value = data.trim()
  const normalizedType = String(scannerType ?? '').toLowerCase()

  if (/^\d{44}$/.test(value)) return true

  if (normalizedType.includes('qr') && /nfce|nfe|sefaz|fazenda|chnfe=|[?&]p=/i.test(value)) {
    return true
  }

  return /^https?:\/\//i.test(value) && /nfce|nfe|sefaz|fazenda|chnfe=|[?&]p=/i.test(value)
}
