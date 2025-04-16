module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
          browsers: [
            'last 2 versions',
            '> 1%',
            'not dead'
          ]
        },
        useBuiltIns: 'usage',
        corejs: 3,
        modules: 'auto'
      }
    ]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-runtime'
  ],
  env: {
    test: {
      plugins: ['@babel/plugin-transform-modules-commonjs']
    },
    production: {
      presets: [
        ['minify', {
          builtIns: false,
          evaluate: false,
          mangle: false
        }]
      ]
    }
  }
} 