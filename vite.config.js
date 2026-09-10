const { defineConfig } = require('vite');

module.exports = defineConfig({
  server: { proxy: { '/customers': 'http://localhost:5000', '/api': 'http://localhost:5000' } },
});