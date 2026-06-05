<script lang="ts">
	// Main wizard page

	import StepIndicator from '$lib/components/StepIndicator.svelte';
	import TextInputStep from '$lib/components/TextInputStep.svelte';
	import QuestionnaireStep from '$lib/components/QuestionnaireStep.svelte';
	import AnalysisStep from '$lib/components/AnalysisStep.svelte';
	import StatementStep from '$lib/components/StatementStep.svelte';
	import { analyzeText, checkCompliance, generateStatement } from '$lib/analysis.js';
	import type { QuestionnaireAnswers, AnalysisResult, ComplianceResult } from '$lib/types.js';

	// Current wizard step
	let currentStep = $state(1);
	let text = $state('');

	let answers = $state<QuestionnaireAnswers>({
		uuLevel: null,
		tools: [],
		purposes: [],
		aiPercentage: 0,
		factChecked: null,
		referencesVerified: null
	});

	let analysisResult = $state<AnalysisResult | null>(null);
	let complianceResult = $state<ComplianceResult>({ status: 'compliant', violations: [] });

	let statement = $state('');

	function goToStep2() {
		currentStep = 2;
		scrollToTop();
	}

	function goToStep3() {
		analysisResult = analyzeText(text);
		complianceResult = checkCompliance(answers);
		currentStep = 3;
		scrollToTop();
	}

	function goToStep4() {
		if (!analysisResult) return;
		statement = generateStatement(answers, analysisResult, complianceResult);
		currentStep = 4;
		scrollToTop();
	}

	function restart() {
		currentStep = 1;
		text = '';
		answers = {
			uuLevel: null,
			tools: [],
			purposes: [],
			aiPercentage: 0,
			factChecked: null,
			referencesVerified: null
		};
		analysisResult = null;
		complianceResult = { status: 'compliant', violations: [] };
		statement = '';
		scrollToTop();
	}

	function scrollToTop() {
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}
</script>

<svelte:head>
	<title>Analyse Your Text | AI Transparency Tool · UU</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-6 py-10">
	<div class="mb-2">
		<a href="/" class="text-xs text-gray-400 hover:text-black transition-colors" style="font-family: 'Open Sans', sans-serif;">
			← Back to home
		</a>
	</div>

	<!-- Progress indicator shown above every step -->
	<StepIndicator {currentStep} />

	<!-- Render the active step component -->
	{#if currentStep === 1}
		<TextInputStep bind:value={text} onNext={goToStep2} />
	{:else if currentStep === 2}
		<QuestionnaireStep
			bind:answers
			onNext={goToStep3}
			onBack={() => { currentStep = 1; scrollToTop(); }}
		/>
	{:else if currentStep === 3 && analysisResult}
		<AnalysisStep
			result={analysisResult}
			onNext={goToStep4}
			onBack={() => { currentStep = 2; scrollToTop(); }}
		/>
	{:else if currentStep === 4}
		<StatementStep
			bind:statement
			compliance={complianceResult}
			onBack={() => { currentStep = 3; scrollToTop(); }}
			onRestart={restart}
		/>
	{/if}
</div>
