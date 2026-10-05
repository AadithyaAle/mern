const { defineConfig } = require('vite');

module.exports = defineConfig({
  server: {
    proxy: {
      '/customers': 'http://localhost:5000',
      '/products': 'http://localhost:5000',
      '/wishlist': 'http://localhost:5000',
      '/cart': 'http://localhost:5000',
      '/api': 'http://localhost:5000',
    },
  },
});