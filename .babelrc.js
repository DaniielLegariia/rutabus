const isTest = String(process.env.NODE_ENV) === 'test';

module.exports = {
  env: {
    production: {
      presets: [
        'next/babel'
      ]
      /*plugins: [
        'react-remove-properties',
        {
          properties: [
            'data-testid'
          ]
        }
      ]*/
    },
    test: {
      presets: [ "@babel/preset-env", "@babel/preset-react","@babel/typescript"],
    },
    development: {
      presets: [
        'next/babel'
      ]
    }
  },
  plugins: [
    ['import', {
      libraryName: 'antd', style: true
    }, 'antd'],
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-syntax-jsx',
    isTest ? 'dynamic-import-node' : null,
  ].filter(Boolean),
};
