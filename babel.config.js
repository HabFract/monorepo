module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    "@babel/preset-typescript",
    "@babel/preset-react"
  ],
  "plugins": [["import", {
    "libraryName": "antd",
    "style": true
  }],
  // // If you're using dynamic import() syntax, you might need this plugin
  // "@babel/plugin-syntax-dynamic-import",
  ],
  ignore: [/node_modules\/(?!d3-*)/, /app\/node_modules\/(?!d3-*)/]
};