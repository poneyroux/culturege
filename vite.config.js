import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // Désactiver le plugin React en mode test ou dans certains contextes
    !process.env.VITEST && react({
      // Configuration explicite
      include: ["**/*.jsx", "**/*.tsx"],
      exclude: ["**/node_modules/**", "**/dist/**"]
    })
  ].filter(Boolean), // Supprimer les valeurs falsy

  // Configuration pour éviter les conflits
  optimizeDeps: {
    include: ['react', 'react-dom']
  },

  // Configuration du serveur de développement
  server: {
    port: 3000,
    host: 'localhost'
  }
})
