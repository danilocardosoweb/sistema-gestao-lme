// Carregar variáveis de ambiente do arquivo .env.test
require('dotenv').config({ path: '.env.test' })

// Mock do localStorage para testes
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock

// Mock do Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(),
        gte: jest.fn(),
        lte: jest.fn(),
        order: jest.fn(),
        single: jest.fn(),
        data: null,
        error: null
      })),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    })),
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn()
    }
  }))
}))

// Mock do Chart.js
jest.mock('chart.js', () => ({
  Chart: jest.fn(),
  registerables: []
}))

// Limpar todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
}) 