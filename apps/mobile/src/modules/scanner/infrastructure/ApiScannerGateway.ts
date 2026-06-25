import api from '@services/api'
import type { ScannerGateway } from '../application/ScannerGateway'
import type { NfeScanResponse } from '../domain/ScannerTypes'

export class ApiScannerGateway implements ScannerGateway {
  async processNfe(input: string): Promise<NfeScanResponse> {
    const { data } = await api.post<NfeScanResponse>('/scanner/nfe', { input })
    return data
  }
}
