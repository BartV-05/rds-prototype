<script lang="ts">
	// Progress bar shown at the top of the analyze page

	const STEPS = [
		{ n: 1, label: 'Paste Text' },
		{ n: 2, label: 'AI Questionnaire' },
		{ n: 3, label: 'Analysis' },
		{ n: 4, label: 'Statement' }
	];

	let { currentStep }: { currentStep: number } = $props();
</script>

<nav aria-label="Progress" class="mb-8">
	<ol class="flex items-center gap-0">
		{#each STEPS as step, i}
			<li class="flex items-center" class:flex-1={i < STEPS.length - 1}>
				<!-- Step circle -->
				<div class="flex flex-col items-center">
					<div
						class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
						style="
							font-family: 'Open Sans', sans-serif;
							background-color: {currentStep > step.n ? '#000' : currentStep === step.n ? '#FFCD00' : '#fff'};
							border-color: {currentStep >= step.n ? (currentStep === step.n ? '#FFCD00' : '#000') : '#d1d5db'};
							color: {currentStep > step.n ? '#FFCD00' : currentStep === step.n ? '#000' : '#9ca3af'};
						"
						aria-current={currentStep === step.n ? 'step' : undefined}
					>
						{#if currentStep > step.n}
							<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						{:else}
							{step.n}
						{/if}
					</div>
					<span
						class="mt-1.5 text-xs font-semibold hidden sm:block whitespace-nowrap"
						style="font-family: 'Open Sans', sans-serif; color: {currentStep === step.n ? '#000' : '#6b7280'};"
					>
						{step.label}
					</span>
				</div>

				<!-- Connector line between circles, turns black once a step is completed -->
				{#if i < STEPS.length - 1}
					<div
						class="flex-1 h-0.5 mx-2 mb-4"
						style="background-color: {currentStep > step.n ? '#000' : '#d1d5db'};"
					></div>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
