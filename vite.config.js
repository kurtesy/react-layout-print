import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.js'),
            name: 'ReactLayoutPrint',
            formats: ['es', 'umd'],
            fileName: (format) => (format === 'es' ? 'index.es.js' : 'index.js'),
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'jspdf', 'html-to-image', 'react-modal', 'react-icons', 'react-spinners', 'react-iframe'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
        outDir: 'lib',
        sourcemap: true,
    },
});