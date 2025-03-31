module.exports = {
  // Diretório raiz do projeto
  rootDir: '.',

  // Padrões de arquivos de teste
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Diretórios a serem ignorados
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],

  // Ambiente de teste
  testEnvironment: 'node',

  // Cobertura de código
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/__tests__/'
  ],

  // Transformações
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Módulos a serem transformados
  transformIgnorePatterns: [
    '/node_modules/(?!@supabase|chart.js|date-fns|lodash)'
  ],

  // Setup de ambiente
  setupFiles: ['<rootDir>/jest.setup.js'],

  // Configurações de timeout
  testTimeout: 10000,

  // Configurações de relatório
  verbose: true,
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'reports/junit',
      outputName: 'js-test-results.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ]
} 