module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['module-resolver', {
      alias: { '@': './src' }
    }],
    ['@babel/plugin-transform-typescript', {
      allowNamespaces: true
    }]
  ],
  ignore: [
    '**/*.spec.ts'
  ]
}
