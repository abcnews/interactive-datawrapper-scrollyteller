import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * vitePreprocess compiles `<style lang="scss">` (and TypeScript) in .svelte files,
 * including the ones shipped by @abcnews/svelte-scrollyteller.
 * @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig}
 */
export default {
  preprocess: vitePreprocess()
};
