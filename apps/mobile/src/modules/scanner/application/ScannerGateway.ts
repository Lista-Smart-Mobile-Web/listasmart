import type { NfeScanResponse } from '../domain/ScannerTypes'

export interface ScannerGateway {
  processNfe(input: string): Promise<NfeScanResponse>
}
