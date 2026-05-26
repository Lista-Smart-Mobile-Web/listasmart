/**
 * Declarações globais para variáveis de ambiente do Expo (EXPO_PUBLIC_*).
 * Metro substitui process.env.EXPO_PUBLIC_* em tempo de build.
 * Este arquivo apenas informa ao TypeScript que process existe.
 */
declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string
    EXPO_PUBLIC_USE_MOCKS?: string
    NODE_ENV?: 'development' | 'production' | 'test'
    [key: string]: string | undefined
  }
}
