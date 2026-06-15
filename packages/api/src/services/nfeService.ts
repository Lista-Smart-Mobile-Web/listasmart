/**
 * NFe / NFC-e Parser Service
 *
 * Supports two input modes:
 *  1. QR code URL  (e.g. https://nfce.fazenda.sp.gov.br/...?p=<chave>|...)
 *  2. Raw access key (44-digit chave de acesso)
 *
 * Flow:
 *  - Fetch the SEFAZ consultation page with axios
 *  - Try to extract embedded XML from known patterns
 *  - Fall back to HTML table scraping for common SEFAZ layouts
 *  - Return structured { emitter, items[] }
 */

import axios from 'axios'

export interface NFeItem {
  code: string | null       // EAN / GTIN
  name: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
}

export interface NFeEmitter {
  cnpj: string | null
  name: string | null
  address: string | null
  city: string | null
}

export interface NFeData {
  accessKey: string | null
  emitter: NFeEmitter
  items: NFeItem[]
  issuedAt: string | null
  total: number | null
}

// ── XML parser (minimal, no external dependency) ──────────────────────────────

function tagContent(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return m ? m[1].trim() : ''
}

function allTags(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi')
  return xml.match(re) ?? []
}

function parseXml(xml: string): NFeData {
  const emitter: NFeEmitter = {
    cnpj: tagContent(xml, 'CNPJ') || null,
    name: tagContent(xml, 'xFant') || tagContent(xml, 'xNome') || null,
    address: [tagContent(xml, 'xLgr'), tagContent(xml, 'nro')].filter(Boolean).join(', ') || null,
    city: tagContent(xml, 'xMun') || null,
  }

  const detTags = allTags(xml, 'det')
  const items: NFeItem[] = detTags.map((det) => {
    const prod = tagContent(det, 'prod')
    return {
      code: tagContent(prod, 'cEAN') || tagContent(prod, 'cProd') || null,
      name: tagContent(prod, 'xProd'),
      quantity: parseFloat(tagContent(prod, 'qCom') || '1'),
      unit: tagContent(prod, 'uCom') || 'UN',
      unitPrice: parseFloat(tagContent(prod, 'vUnCom') || '0'),
      totalPrice: parseFloat(tagContent(prod, 'vProd') || '0'),
    }
  })

  const issuedAt = tagContent(xml, 'dhEmi') || tagContent(xml, 'dEmi') || null
  const totalTag = tagContent(xml, 'vNF') || tagContent(xml, 'vProd')
  const total = totalTag ? parseFloat(totalTag) : null

  const keyAttr = xml.match(/Id="NFe(\d{44})"/)
  const accessKey = keyAttr ? keyAttr[1] : null

  return { accessKey, emitter, items, issuedAt, total }
}

// ── HTML scraper for common SEFAZ portal layouts ──────────────────────────────

function scrapeHtmlTable(html: string): Partial<NFeData> {
  const items: NFeItem[] = []

  // Pattern common in SP, MG, RS NFC-e portals:
  // Each product row looks like <tr class="..."><td>...</td> repeated
  const rowRe = /<tr[^>]*class="[^"]*(?:odd|even|item|produto)[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi
  let match: RegExpExecArray | null
  while ((match = rowRe.exec(html)) !== null) {
    const cells = (match[1].match(/<td[^>]*>([\s\S]*?)<\/td>/gi) ?? []).map((td) =>
      td.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    )
    if (cells.length >= 4) {
      const price = parseFloat(cells[cells.length - 1].replace(/\./g, '').replace(',', '.'))
      const qty = parseFloat(cells[2]?.replace(',', '.') || '1')
      const unitPrice = parseFloat(
        cells[3]?.replace(/\./g, '').replace(',', '.') || String(price / qty)
      )
      if (!isNaN(price) && cells[0]) {
        items.push({
          code: null,
          name: cells[1] || cells[0],
          quantity: isNaN(qty) ? 1 : qty,
          unit: 'UN',
          unitPrice: isNaN(unitPrice) ? price : unitPrice,
          totalPrice: isNaN(price) ? 0 : price,
        })
      }
    }
  }

  // Try extracting CNPJ from HTML
  const cnpjMatch = html.match(/\b(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})\b/)
  const cnpj = cnpjMatch ? cnpjMatch[1].replace(/\D/g, '') : null

  // Market name — usually in an <h4> or <strong> near the CNPJ
  const nameMatch = html.match(/<(?:h[1-4]|strong)[^>]*>([\s\S]{5,60}?)<\/(?:h[1-4]|strong)>/i)
  const name = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, '').trim() : null

  const total = (() => {
    const m = html.match(/(?:TOTAL|Valor Total)[^R$]*R\$\s*([\d.,]+)/i)
    return m ? parseFloat(m[1].replace(/\./g, '').replace(',', '.')) : null
  })()

  return {
    emitter: { cnpj, name, address: null, city: null },
    items,
    total,
    issuedAt: null,
    accessKey: null,
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9',
}

/**
 * Parse a NFC-e from a URL (QR code destination) or a raw 44-digit access key.
 * Throws on network/parse failure.
 */
export async function parseNfe(input: string): Promise<NFeData> {
  let url: string

  const trimmed = input.trim()

  if (/^\d{44}$/.test(trimmed)) {
    // Raw access key — use the SEFAZ national portal as fallback
    url = `https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=completa&tipoConteudo=XmlNFe&nfe_id=${trimmed}`
  } else if (trimmed.startsWith('http')) {
    url = trimmed
  } else {
    throw new Error('Input inválido: forneça uma URL ou chave de acesso de 44 dígitos')
  }

  const response = await axios.get(url, {
    headers: HEADERS,
    timeout: 15_000,
    // Some SEFAZ portals return gzip
    decompress: true,
    // Allow redirects
    maxRedirects: 5,
  })

  const contentType = String(response.headers['content-type'] ?? '')
  const body: string = typeof response.data === 'string'
    ? response.data
    : JSON.stringify(response.data)

  // If the response is XML, parse directly
  if (
    contentType.includes('xml') ||
    body.trimStart().startsWith('<?xml') ||
    body.includes('<nfeProc') ||
    body.includes('<NFe ')
  ) {
    return parseXml(body)
  }

  // Otherwise try to find embedded XML in the HTML
  const xmlMatch = body.match(/<nfeProc[\s\S]*?<\/nfeProc>/)
  if (xmlMatch) return parseXml(xmlMatch[0])

  const nfeMatch = body.match(/<NFe[\s\S]*?<\/NFe>/)
  if (nfeMatch) return parseXml(nfeMatch[0])

  // Last resort: HTML table scraping
  const scraped = scrapeHtmlTable(body)
  if (scraped.items && scraped.items.length > 0) {
    return {
      accessKey: scraped.accessKey ?? null,
      emitter: scraped.emitter ?? { cnpj: null, name: null, address: null, city: null },
      items: scraped.items,
      issuedAt: scraped.issuedAt ?? null,
      total: scraped.total ?? null,
    }
  }

  throw new Error('Não foi possível extrair os dados da nota fiscal. Tente o modo manual.')
}
