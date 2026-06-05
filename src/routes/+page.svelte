<script lang="ts">
	import { UU_LEVELS } from '$lib/types.js';
</script>

<svelte:head>
	<title>AI Transparency Tool | Universiteit Utrecht</title>
	<meta name="description" content="Reflect on your AI use in academic writing and generate a transparent AI usage statement aligned with the UU AI Index." />
</svelte:head>

<!-- Hero -->
<section style="background-color: #FFCD00;" class="border-b-2 border-black">
	<div class="max-w-5xl mx-auto px-6 py-16">
		<div class="max-w-2xl">
			<p class="text-xs font-bold uppercase tracking-widest mb-3" style="font-family: 'Open Sans', sans-serif; opacity: 0.7;">
				Responsible Data Science · INFOB3RDS
			</p>
			<h1 class="text-4xl sm:text-5xl font-bold leading-tight mb-4" style="font-family: 'Open Sans', sans-serif;">
				AI Transparency Tool
			</h1>
			<p class="text-lg mb-8 max-w-xl" style="font-family: 'Merriweather', serif; font-weight: 300; line-height: 1.8;">
				Reflect on how you used AI in your academic writing. Generate a transparent, honest AI usage statement aligned with the <strong>UU AI Index</strong>.
			</p>
			<a
				href="/analyze"
				class="inline-block px-8 py-3 bg-black text-white font-bold text-sm tracking-wide hover:bg-gray-800 transition-colors rounded-sm"
				style="font-family: 'Open Sans', sans-serif;"
			>
				Start Analysis →
			</a>
		</div>
	</div>
</section>

<!-- What this tool does -->
<section class="max-w-5xl mx-auto px-6 py-16">
	<div class="grid sm:grid-cols-3 gap-8">
		<div class="border-t-4 border-black pt-4">
			<h2 class="text-base font-bold mb-2" style="font-family: 'Open Sans', sans-serif;">1. Paste your text</h2>
			<p class="text-sm text-gray-600 m-0">Submit your academic paper or essay. The tool analyses citation density and identifies statements that may need a source.</p>
		</div>
		<div class="border-t-4 border-black pt-4">
			<h2 class="text-base font-bold mb-2" style="font-family: 'Open Sans', sans-serif;">2. Report your AI use</h2>
			<p class="text-sm text-gray-600 m-0">Answer a short questionnaire about which AI tools you used, for what purposes, and select your UU AI Index level.</p>
		</div>
		<div class="border-t-4 pt-4" style="border-color: #FFCD00;">
			<h2 class="text-base font-bold mb-2" style="font-family: 'Open Sans', sans-serif;">3. Get your statement</h2>
			<p class="text-sm text-gray-600 m-0">Review, edit, and approve the generated AI usage statement. Export it to attach to your submission.</p>
		</div>
	</div>
</section>

<!-- User personas -->
<section class="bg-gray-50 border-y border-gray-200">
	<div class="max-w-5xl mx-auto px-6 py-14">
		<h2 class="text-2xl font-bold mb-8" style="font-family: 'Open Sans', sans-serif;">Who is this for?</h2>
		<div class="grid sm:grid-cols-3 gap-6">
			<!-- Emma -->
			<div class="bg-white border border-gray-200 p-6 rounded-sm">
				<div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-4" style="background-color: #FFCD00; font-family: 'Open Sans', sans-serif;">E</div>
				<h3 class="font-bold text-base mb-1" style="font-family: 'Open Sans', sans-serif;">Emma</h3>
				<p class="text-xs text-gray-500 mb-3" style="font-family: 'Open Sans', sans-serif;">BSc Computer Science, 2nd year</p>
				<p class="text-sm text-gray-700 m-0">Uses ChatGPT to understand difficult concepts and get feedback on her code. Wants to be transparent about her AI use without risking academic integrity issues.</p>
			</div>
			<!-- Peter -->
			<div class="bg-white border border-gray-200 p-6 rounded-sm">
				<div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-4" style="background-color: #FFCD00; font-family: 'Open Sans', sans-serif;">P</div>
				<h3 class="font-bold text-base mb-1" style="font-family: 'Open Sans', sans-serif;">Peter</h3>
				<p class="text-xs text-gray-500 mb-3" style="font-family: 'Open Sans', sans-serif;">MSc Data Science, international student</p>
				<p class="text-sm text-gray-700 m-0">Uses AI to improve his English grammar and clarity. Concerned about being judged unfairly due to his non-native writing style.</p>
			</div>
			<!-- Sarah -->
			<div class="bg-white border border-gray-200 p-6 rounded-sm">
				<div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-4" style="background-color: #FFCD00; font-family: 'Open Sans', sans-serif;">S</div>
				<h3 class="font-bold text-base mb-1" style="font-family: 'Open Sans', sans-serif;">Sarah</h3>
				<p class="text-xs text-gray-500 mb-3" style="font-family: 'Open Sans', sans-serif;">Lecturer, Information Science</p>
				<p class="text-sm text-gray-700 m-0">Wants students to use AI responsibly. Values transparency declarations that show critical engagement with AI, not accusations of misconduct.</p>
			</div>
		</div>
	</div>
</section>

<!-- UU AI Index overview -->
<section class="max-w-5xl mx-auto px-6 py-16">
	<h2 class="text-2xl font-bold mb-2" style="font-family: 'Open Sans', sans-serif;">UU AI Index: 5 Levels</h2>
	<p class="text-sm text-gray-600 mb-8 max-w-2xl">The tool maps your reported AI use to the official Utrecht University AI Index (July 2025). Check which level your instructor specified.</p>
	<div class="space-y-3">
		{#each UU_LEVELS as lvl}
			<div class="flex gap-4 border border-gray-200 p-4 rounded-sm items-start">
				<div
					class="w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold text-sm rounded-sm"
					style="background-color: {lvl.aiInFinalWork === 'not_allowed' ? '#FEE2E2' : lvl.aiInFinalWork === 'limited' ? '#FEF9C3' : '#DCFCE7'}; font-family: 'Open Sans', sans-serif;"
				>
					{lvl.level}
				</div>
				<div>
					<p class="font-bold text-sm m-0" style="font-family: 'Open Sans', sans-serif;">{lvl.labelNL} <span class="text-gray-400 font-normal">({lvl.labelEN})</span></p>
					<p class="text-xs text-gray-500 m-0 mt-1">{lvl.requirementsNL[0]}</p>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- Transparency callout -->
<section class="max-w-5xl mx-auto px-6 pb-16">
	<div class="border-l-4 border-black bg-gray-50 p-6 rounded-sm">
		<h3 class="font-bold text-base mb-2" style="font-family: 'Open Sans', sans-serif;">What this tool is and is not</h3>
		<ul class="space-y-1 m-0 pl-4 list-disc">
			<li class="text-sm text-gray-700">This tool is for <strong>reflection and transparency</strong>, not detection or accusation.</li>
			<li class="text-sm text-gray-700">The citation analysis uses a <strong>dataset-driven classifier</strong>. It is not perfect and may produce false positives.</li>
			<li class="text-sm text-gray-700">Your text is <strong>never stored or sent to any server</strong>. All processing happens in your browser.</li>
			<li class="text-sm text-gray-700">The generated statement is a <strong>recommendation only</strong>. You must review and approve it before submitting.</li>
			<li class="text-sm text-gray-700">The UU AI Index compliance check is <strong>informational only</strong>. The tool cannot verify actual AI use.</li>
		</ul>
	</div>
</section>
