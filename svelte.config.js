import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// Static adapter outputs a self-contained folder that can be shared or hosted anywhere
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html'
		})
	}
};

export default config;
