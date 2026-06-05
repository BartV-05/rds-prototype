<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
	<header style="background-color: #FFCD00;" class="border-b-2 border-black">
		<div class="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
			<a href="/" class="flex items-center gap-4 no-underline" aria-label="Home">
				<img src="/uu-logo.svg" alt="Universiteit Utrecht" class="h-9 w-auto" />
				<span class="text-xs" style="font-family: 'Open Sans', sans-serif; opacity: 0.75; border-left: 2px solid #000; padding-left: 0.75rem;">AI Transparency Tool</span>
			</a>

			<nav class="flex items-center gap-6" aria-label="Main navigation">
				<a
					href="/"
					class="text-sm font-semibold hover:underline decoration-2 underline-offset-2"
					style="font-family: 'Open Sans', sans-serif; color: {$page.url.pathname === '/' ? '#000' : '#333'}; text-decoration: {$page.url.pathname === '/' ? 'underline' : 'none'};"
				>
					Home
				</a>
				<a
					href="/analyze"
					class="text-sm font-semibold px-4 py-1.5 rounded-sm border-2 border-black transition-colors hover:bg-black hover:text-white"
					style="font-family: 'Open Sans', sans-serif; background: {$page.url.pathname.startsWith('/analyze') ? '#000' : 'transparent'}; color: {$page.url.pathname.startsWith('/analyze') ? '#FFCD00' : '#000'};"
				>
					Start Analysis
				</a>
			</nav>
		</div>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-gray-200 mt-16">
		<div class="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-start gap-4">
			<div>
				<p class="text-xs text-gray-500 m-0" style="font-family: 'Open Sans', sans-serif;">
					<strong>AI Transparency Tool</strong> · INFOB3RDS Group Assignment 2, 2025-2026
				</p>
				<p class="text-xs text-gray-400 m-0 mt-1" style="font-family: 'Open Sans', sans-serif;">
					Built for Universiteit Utrecht · Group 01
				</p>
			</div>
			<div class="text-xs text-gray-400 text-right" style="font-family: 'Open Sans', sans-serif;">
				<p class="m-0">This tool provides recommendations only.</p>
				<p class="m-0">The author is responsible for accuracy.</p>
			</div>
		</div>
	</footer>
</div>
