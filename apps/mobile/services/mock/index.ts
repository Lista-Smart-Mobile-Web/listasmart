/**
 * Camada de mocks para desenvolvimento sem backend.
 *
 * Ative com EXPO_PUBLIC_USE_MOCKS=true no .env
 * Para desativar e usar o backend real: EXPO_PUBLIC_USE_MOCKS=false
 */

export { createMockAdapter } from './adapter'
export { seedMockDB } from './seedDB'
