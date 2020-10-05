import svelte from 'vite-plugin-svelte';

export default {
  plugins: [svelte()],
  rollupDedupe: ['svelte']
};