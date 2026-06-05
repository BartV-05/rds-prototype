<script lang="ts">
	import { getTextStats } from '$lib/analysis.js';

	// Sample text for the demo
	const SAMPLE_TEXT = `Artificial intelligence (AI) has become increasingly prevalent in higher education, raising important questions about academic integrity and the nature of learning. Studies show that students who use AI tools for concept explanation tend to engage more deeply with course material, yet the relationship between AI use and academic performance remains contested. Evidence suggests that AI functions most effectively as a support tool when students maintain critical engagement with its outputs.

The integration of AI into academic writing presents both opportunities and challenges. Research indicates that students from non-native English speaking backgrounds may benefit disproportionately from AI grammar support, as it levels the linguistic playing field without replacing their original ideas. However, it has been argued that over-reliance on AI-generated text undermines the development of critical thinking and argumentation skills.

Several studies have examined how different types of AI use affect learning outcomes. A survey found that students who used AI for brainstorming and feedback reported higher satisfaction with their writing process, while those who used AI to generate entire sections showed no improvement in their ability to construct original arguments. This suggests that the purpose and extent of AI use matters significantly.

The lack of standardized disclosure norms for AI use in academic writing is a significant gap in the current literature. Most researchers agree that transparency about AI use is essential for maintaining trust between students and educators. Yet few practical tools exist to support this transparency in a structured, non-accusatory way. There is growing consensus that universities need clear frameworks (such as the UU AI Index) to guide both students and instructors in responsible AI use.`;

	let {
		value = $bindable(''),
		onNext
	}: {
		value: string;
		onNext: () => void;
	} = $props();

	// Stats are recomputed reactively as the user types
	let stats = $derived(getTextStats(value));
	let canProceed = $derived(stats.words >= 100);
</script>

<div>
	<h2 class="text-2xl font-bold mb-1" style="font-family: 'Open Sans', sans-serif;">Step 1: Paste your text</h2>
	<p class="text-sm text-gray-600 mb-6 mt-0" style="font-family: 'Merriweather', serif;">Paste the academic text you want to analyse. Only the text itself; no title page or references list needed (though including them is fine).</p>

	<!-- Textarea -->
	<div class="relative">
		<textarea
			bind:value
			rows={18}
			placeholder="Paste your academic text here…"
			class="w-full border-2 border-gray-300 p-4 text-sm leading-relaxed focus:border-black focus:outline-none resize-y rounded-sm transition-colors"
			style="font-family: 'Merriweather', serif;"
			aria-label="Academic text input"
		></textarea>
	</div>

	<!-- Live stats -->
	<div class="flex gap-6 mt-3 mb-6">
		<div class="text-center">
			<div class="text-xl font-bold" style="font-family: 'Open Sans', sans-serif; color: {canProceed ? '#000' : '#C00A35'};">{stats.words}</div>
			<div class="text-xs text-gray-500" style="font-family: 'Open Sans', sans-serif;">words {canProceed ? '' : '(min. 100)'}</div>
		</div>
		<div class="text-center">
			<div class="text-xl font-bold" style="font-family: 'Open Sans', sans-serif;">{stats.paragraphs}</div>
			<div class="text-xs text-gray-500" style="font-family: 'Open Sans', sans-serif;">paragraphs</div>
		</div>
		<div class="text-center">
			<div class="text-xl font-bold" style="font-family: 'Open Sans', sans-serif;">{stats.sentences}</div>
			<div class="text-xs text-gray-500" style="font-family: 'Open Sans', sans-serif;">sentences</div>
		</div>
		<div class="ml-auto">
			<button
				onclick={() => (value = SAMPLE_TEXT)}
				class="text-xs px-3 py-1.5 border border-gray-300 hover:border-black transition-colors rounded-sm"
				style="font-family: 'Open Sans', sans-serif;"
				type="button"
			>
				Load sample paper
			</button>
		</div>
	</div>

	<!-- Privacy note -->
	<div class="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-sm p-3 mb-6">
		<svg class="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
			<path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
		</svg>
		<p class="text-xs text-gray-500 m-0" style="font-family: 'Open Sans', sans-serif;">Your text is processed <strong>entirely in your browser</strong> and is never sent to any server.</p>
	</div>

	<div class="flex justify-end">
		<button
			onclick={onNext}
			disabled={!canProceed}
			class="px-8 py-3 font-bold text-sm tracking-wide transition-colors rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
			style="font-family: 'Open Sans', sans-serif; background-color: {canProceed ? '#FFCD00' : '#e5e7eb'}; color: #000;"
			type="button"
		>
			Next: AI Questionnaire →
		</button>
	</div>
</div>
