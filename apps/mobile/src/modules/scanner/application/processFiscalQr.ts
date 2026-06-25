import type { ProcessedFiscalScan } from '../domain/ScannerTypes'
import type { ScannerGateway } from './ScannerGateway'

export async function processFiscalQrUseCase(
  gateway: ScannerGateway,
  input: string
): Promise<ProcessedFiscalScan> {
  const data = await gateway.processNfe(input)

  return {
    marketName: data.market?.name ?? null,
    preferredMarketId: data.market?.id ?? null,
    matchedItems: (data.items ?? []).filter((item) => item.matched && item.product),
  }
}
