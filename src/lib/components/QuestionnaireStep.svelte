<script lang="ts">
	// Step 2: the AI use questionnaire
	import type { QuestionnaireAnswers, AITool, AIPurpose, UULevel } from '$lib/types.js';
	import { UU_LEVELS, PURPOSE_LABELS, TOOL_LABELS } from '$lib/types.js';
	import { checkCompliance } from '$lib/analysis.js';

	// Ordered lists for rendering the toggle buttons in the UI
	const ALL_TOOLS: AITool[] = ['ChatGPT', 'Claude', 'Copilot', 'Gemini', 'Other', 'None'];
	const ALL_PURPOSES: AIPurpose[] = [
		'concept_explanation',
		'text_generation',
		'grammar_support',
		'brainstorming',
		'programming_support',
		'finding_references',
		'feedback_on_writing'
	];

	let {
		answers = $bindable<QuestionnaireAnswers>({
			uuLevel: null,
			tools: [],
			purposes: [],
			aiPercentage: 0,
			factChecked: null,
			referencesVerified: null
		}),
		onNext,
		onBack
	}: {
		answers: QuestionnaireAnswers;
		onNext: () => void;
		onBack: () => void;
	} = $props();

	// Selecting 'None' deselects all other tools and clears the purpose/percentage
	function toggleTool(tool: AITool) {
		if (tool === 'None') {
			answers.tools = answers.tools.includes('None') ? [] : ['None'];
			answers.purposes = [];
			answers.aiPercentage = 0;
		} else {
			// If the student selects an actual tool, make sure 'None' is removed first
			answers.tools = answers.tools.filter((t) => t !== 'None');
			answers.tools = answers.tools.includes(tool)
				? answers.tools.filter((t) => t !== tool)
				: [...answers.tools, tool];
		}
	}

	function togglePurpose(purpose: AIPurpose) {
		answers.purposes = answers.purposes.includes(purpose)
			? answers.purposes.filter((p) => p !== purpose)
			: [...answers.purposes, purpose];
	}

	// Show the AI-specific questions
	let usedAI = $derived(!answers.tools.includes('None') && answers.tools.length > 0);
	let compliance = $derived(answers.uuLevel ? checkCompliance(answers) : null);

	let canProceed = $derived(
		answers.uuLevel !== null &&
		answers.tools.length > 0 &&
		(answers.tools.includes('None') || (answers.purposes.length > 0 && answers.factChecked !== null && answers.referencesVerified !== null))
	);

	const levelColors: Record<string, string> = {
		not_allowed: '#FEE2E2',
		limited: '#FEF9C3',
		specific_parts: '#DCFCE7',
		fully_allowed: '#DCFCE7'
	};
</script>

<div>
	<h2 class="text-2xl font-bold mb-1" style="font-family: 'Open Sans', sans-serif;">Step 2: AI Use Questionnaire</h2>
	<p class="text-sm text-gray-600 mb-8 mt-0" style="font-family: 'Merriweather', serif;">Answer honestly. The purpose of this tool is reflection, not detection. Your answers inform the AI usage statement.</p>

	<!-- Q1: UU AI Index Level -->
	<fieldset class="mb-8">
		<legend class="text-base font-bold mb-1" style="font-family: 'Open Sans', sans-serif;">
			1. Which UU AI Index level applies to this assignment?
			<span class="text-red-600 ml-1" aria-hidden="true">*</span>
		</legend>
		<p class="text-xs text-gray-500 mb-3 mt-0" style="font-family: 'Open Sans', sans-serif;">Check the assignment instructions from your instructor.</p>
		<div class="space-y-2">
			{#each UU_LEVELS as lvl}
				<label
					class="flex gap-3 items-start border-2 p-3 rounded-sm cursor-pointer transition-all"
					style="border-color: {answers.uuLevel === lvl.level ? '#000' : '#e5e7eb'}; background-color: {answers.uuLevel === lvl.level ? levelColors[lvl.aiInFinalWork] : '#fff'};"
				>
					<input
						type="radio"
						name="uu-level"
						value={lvl.level}
						checked={answers.uuLevel === lvl.level}
						onchange={() => (answers.uuLevel = lvl.level as UULevel)}
						class="mt-0.5"
						aria-describedby={`level-desc-${lvl.level}`}
					/>
					<div>
						<span class="font-semibold text-sm" style="font-family: 'Open Sans', sans-serif;">
							Level {lvl.level}: {lvl.labelNL}
						</span>
						<span class="text-xs text-gray-500 ml-2" style="font-family: 'Open Sans', sans-serif;">{lvl.labelEN}</span>
						<p id={`level-desc-${lvl.level}`} class="text-xs text-gray-500 m-0 mt-0.5" style="font-family: 'Open Sans', sans-serif;">
							{lvl.requirementsNL[0]}
						</p>
					</div>
				</label>
			{/each}
		</div>
	</fieldset>

	<!-- Q2: Tools used -->
	<fieldset class="mb-8">
		<legend class="text-base font-bold mb-1" style="font-family: 'Open Sans', sans-serif;">
			2. Which AI tools did you use?
			<span class="text-red-600 ml-1" aria-hidden="true">*</span>
		</legend>
		<div class="flex flex-wrap gap-2 mt-2">
			{#each ALL_TOOLS as tool}
				<button
					type="button"
					onclick={() => toggleTool(tool)}
					class="px-3 py-1.5 text-sm border-2 rounded-sm transition-all font-medium"
					style="
						font-family: 'Open Sans', sans-serif;
						border-color: {answers.tools.includes(tool) ? '#000' : '#d1d5db'};
						background-color: {answers.tools.includes(tool) ? (tool === 'None' ? '#f3f4f6' : '#FFCD00') : '#fff'};
						font-weight: {answers.tools.includes(tool) ? '700' : '400'};
					"
					aria-pressed={answers.tools.includes(tool)}
				>
					{TOOL_LABELS[tool]}
				</button>
			{/each}
		</div>
	</fieldset>

	{#if usedAI}
		<!-- Q3: Purposes -->
		<fieldset class="mb-8">
			<legend class="text-base font-bold mb-1" style="font-family: 'Open Sans', sans-serif;">
				3. For what purposes did you use AI?
				<span class="text-red-600 ml-1" aria-hidden="true">*</span>
			</legend>
			<div class="flex flex-wrap gap-2 mt-2">
				{#each ALL_PURPOSES as purpose}
					<button
						type="button"
						onclick={() => togglePurpose(purpose)}
						class="px-3 py-1.5 text-sm border-2 rounded-sm transition-all"
						style="
							font-family: 'Open Sans', sans-serif;
							border-color: {answers.purposes.includes(purpose) ? '#000' : '#d1d5db'};
							background-color: {answers.purposes.includes(purpose) ? '#FFCD00' : '#fff'};
							font-weight: {answers.purposes.includes(purpose) ? '700' : '400'};
						"
						aria-pressed={answers.purposes.includes(purpose)}
					>
						{PURPOSE_LABELS[purpose]}
					</button>
				{/each}
			</div>
		</fieldset>

		<!-- Q4: Percentage -->
		<div class="mb-8">
			<label for="ai-percentage" class="text-base font-bold block mb-1" style="font-family: 'Open Sans', sans-serif;">
				4. Approximately what percentage of the text was written or substantially revised with AI?
			</label>
			<div class="flex items-center gap-4 mt-3">
				<input
					id="ai-percentage"
					type="range"
					min="0" max="100" step="5"
					bind:value={answers.aiPercentage}
					class="flex-1 h-2 accent-black"
					aria-valuenow={answers.aiPercentage}
					aria-valuemin={0}
					aria-valuemax={100}
				/>
				<span class="text-xl font-bold w-16 text-right" style="font-family: 'Open Sans', sans-serif;">{answers.aiPercentage}%</span>
			</div>
			<div class="flex justify-between text-xs text-gray-400 mt-1" style="font-family: 'Open Sans', sans-serif;">
				<span>None</span>
				<span>All AI-generated</span>
			</div>
		</div>

		<!-- Q5: Fact-checked -->
		<fieldset class="mb-8">
			<legend class="text-base font-bold mb-3" style="font-family: 'Open Sans', sans-serif;">
				5. Did you independently fact-check AI-generated claims?
			</legend>
			<div class="flex gap-3">
				{#each [['yes', 'Yes, all of them'], ['partial', 'Some of them'], ['no', 'No']] as [val, label]}
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="radio"
							name="fact-checked"
							value={val}
							checked={answers.factChecked === val}
							onchange={() => (answers.factChecked = val as 'yes' | 'no' | 'partial')}
						/>
						<span class="text-sm" style="font-family: 'Open Sans', sans-serif;">{label}</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<!-- Q6: References verified -->
		<fieldset class="mb-8">
			<legend class="text-base font-bold mb-3" style="font-family: 'Open Sans', sans-serif;">
				6. Did you verify any references suggested by AI tools?
			</legend>
			<div class="flex gap-3 flex-wrap">
				{#each [['yes', 'Yes, I verified them'], ['no', 'No'], ['na', 'I did not use AI for references']] as [val, label]}
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="radio"
							name="refs-verified"
							value={val}
							checked={answers.referencesVerified === val}
							onchange={() => (answers.referencesVerified = val as 'yes' | 'no' | 'na')}
						/>
						<span class="text-sm" style="font-family: 'Open Sans', sans-serif;">{label}</span>
					</label>
				{/each}
			</div>
		</fieldset>
	{/if}

	<!-- Compliance preview -->
	{#if compliance && answers.uuLevel}
		<div
			class="border-l-4 p-4 mb-8 rounded-sm"
			style="
				border-color: {compliance.status === 'compliant' ? '#24A793' : compliance.status === 'no_ai' ? '#5287C6' : '#C00A35'};
				background-color: {compliance.status === 'compliant' ? '#f0fdfb' : compliance.status === 'no_ai' ? '#eff6ff' : '#fff5f5'};
			"
			role="status"
			aria-live="polite"
		>
			<p class="font-bold text-sm m-0 mb-1" style="font-family: 'Open Sans', sans-serif;">
				{#if compliance.status === 'compliant'}
					✓ Reported AI use appears compliant with Level {answers.uuLevel}
				{:else if compliance.status === 'no_ai'}
					ℹ No AI use reported
				{:else}
					⚠ Attention: please review your reported AI use
				{/if}
			</p>
			{#if compliance.violations.length > 0}
				<ul class="m-0 pl-4 list-disc space-y-0.5">
					{#each compliance.violations as v}
						<li class="text-xs" style="font-family: 'Open Sans', sans-serif;">{v}</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}

	<div class="flex justify-between">
		<button
			onclick={onBack}
			type="button"
			class="px-6 py-3 text-sm font-semibold border-2 border-gray-300 hover:border-black transition-colors rounded-sm"
			style="font-family: 'Open Sans', sans-serif;"
		>
			← Back
		</button>
		<button
			onclick={onNext}
			disabled={!canProceed}
			type="button"
			class="px-8 py-3 font-bold text-sm tracking-wide transition-colors rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
			style="font-family: 'Open Sans', sans-serif; background-color: {canProceed ? '#FFCD00' : '#e5e7eb'}; color: #000;"
		>
			Next: Run Analysis →
		</button>
	</div>
</div>
