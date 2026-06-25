import { looksLikeFiscalQr as looksLikeFiscalQrUseCase } from '@/src/modules/scanner/application/looksLikeFiscalQr'
import { processFiscalQrUseCase } from '@/src/modules/scanner/application/processFiscalQr'
import { ApiScannerGateway } from '@/src/modules/scanner/infrastructure/ApiScannerGateway'
import type { ProcessedFiscalScan } from '@/src/modules/scanner/domain/ScannerTypes'

const gateway = new ApiScannerGateway()

export function looksLikeFiscalQr(data: string, scannerType?: string): boolean {
  return looksLikeFiscalQrUseCase(data, scannerType)
}

export async function processFiscalQr(input: string): Promise<ProcessedFiscalScan> {
  return processFiscalQrUseCase(gateway, input)
}

export function formatPriceInput(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ''
  return value.toFixed(2).replace('.', ',')
}
