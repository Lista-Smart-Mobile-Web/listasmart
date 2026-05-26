/**
 * MOCK AXIOS ADAPTER
 *
 * Substitui o adapter HTTP do axios por uma implementação que responde
 * com dados fake localmente — sem qualquer chamada de rede real.
 *
 * Delay simulado de 150ms para imitar latência de rede.
 */

import type { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { getMockResponse } from './handlers'

const SIMULATED_DELAY_MS = 150

export function createMockAdapter(): AxiosAdapter {
  return function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const result = getMockResponse(config)

        if (!result) {
          const msg = `[MOCK] Endpoint não mapeado: ${config.method?.toUpperCase()} ${config.url}`
          console.warn(msg)
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({
            isAxiosError: true,
            config,
            response: {
              status: 404,
              statusText: 'Not Found',
              data: { error: msg },
              headers: {},
              config,
            },
          })
          return
        }

        resolve({
          data:       result.data,
          status:     result.status,
          statusText: result.status < 300 ? 'OK' : 'Error',
          headers:    { 'content-type': 'application/json' },
          config,
          request:    {},
        } as AxiosResponse)
      }, SIMULATED_DELAY_MS)
    })
  }
}
