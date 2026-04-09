import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 0,
    // 打包成 IIFE 格式，支持直接双击打开
    format: 'iife',
    rollupOptions: {
      output: {
        entryFileNames: 'js/game.js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          const ext = name.split('.').pop() || '';
          if (['mp3', 'ogg', 'wav'].includes(ext)) {
            return 'assets/audio/[name].[ext]';
          }
          if (['png', 'jpg', 'gif', 'svg', 'webp'].includes(ext)) {
            return 'assets/images/[name].[ext]';
          }
          return 'assets/[name].[ext]';
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: false
    }
  },
  assetsInclude: ['**/*.mp3', '**/*.ogg', '**/*.wav']
});
