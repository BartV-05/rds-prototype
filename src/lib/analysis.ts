// Core analysis logic for the AI Transparency Tool
// This file handles three seperate things:
//   1. Citation detection (regex-based, APA and IEEE)
//   2. Unsupported claim detection (dataset-driven classifier)
//   3. UU compliance checking and statement generation
//
// All of this runs client-side in the browser. No data is sent to a server.

import type {
  AnalysisResult,
  CitationMatch,
  ClaimIndicator,
  FlaggedClaim,
  ParagraphAnalysis,
  QuestionnaireAnswers,
  ComplianceResult,
  UULevel
} from './types.js';
import { UU_LEVELS } from './types.js';
import rawIndicators from './data/claim-indicators.json';

const indicators = rawIndicators as ClaimIndicator[];

// ---------------------------------------------------------------------------
// Citation detection
// ---------------------------------------------------------------------------

// APA in-text format: (Smith, 2021) or (Smith et al., 2021) or (Smith & Jones, 2021)
const APA_INTEXT =
  /\((?:[A-ZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖÜ][a-záéíóúàèìòùâêîôûäëïöü'\-]+(?:\s+et\s+al\.|\s*[,&]\s*[A-ZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖÜ][a-záéíóúàèìòùâêîôûäëïöü'\-]+)?),\s*\d{4}[a-z]?\)/g;

// IEEE numeric format: [1] or [1, 2] or [1-3]
// Much simpler than APA thankfully:)
const IEEE_INTEXT = /\[\d+(?:[,\s\-]\d+)*\]/g;

// Finds all citations in a block of text and returns them sorted by position.
function extractCitations(text: string): CitationMatch[] {
  const results: CitationMatch[] = [];

  for (const match of text.matchAll(new RegExp(APA_INTEXT.source, 'g'))) {
    results.push({ text: match[0], format: 'apa', index: match.index ?? 0 });
  }
  for (const match of text.matchAll(new RegExp(IEEE_INTEXT.source, 'g'))) {
    results.push({ text: match[0], format: 'ieee', index: match.index ?? 0 });
  }
  // Sort by position so the output makes sense when displayed
  return results.sort((a, b) => a.index - b.index);
}

// Figures out what citation style the paper uses overall.
// If someone mixes APA and IEEE we just say 'mixed'
function detectFormat(citations: CitationMatch[]): AnalysisResult['citationFormat'] {
  if (citations.length === 0) return 'none';
  const hasAPA = citations.some((c) => c.format === 'apa');
  const hasIEEE = citations.some((c) => c.format === 'ieee');
  if (hasAPA && hasIEEE) return 'mixed';
  if (hasAPA) return 'apa';
  return 'ieee';
}

// ---------------------------------------------------------------------------
// Citation proximity check
// ---------------------------------------------------------------------------

// Checks whether a citation appears close to a given sentance.
function hasCitationNearby(sentence: string, prev: string, next: string): boolean {
  const context = `${prev} ${sentence} ${next}`;
  return APA_INTEXT.test(context) || IEEE_INTEXT.test(context);
}

// IMPORTANT: call this after every use of APA_INTEXT.test() or IEEE_INTEXT.test()
// The 'g' flag makes regex objects remember where they left off (lastIndex),
// so not resetting them causes every other call to return false. Took a while to debug this!
function resetRegex() {
  APA_INTEXT.lastIndex = 0;
  IEEE_INTEXT.lastIndex = 0;
}

// ---------------------------------------------------------------------------
// Claim classifier (dataset-driven)
// ---------------------------------------------------------------------------

// Sentences with a combined indicator score above this treshold get flagged.
const SCORE_THRESHOLD = 0.50;

// Scores a single sentance using the claim-indicators.json dataset.
// Returns a FlaggedClaim if the score is high enough AND there's no nearby citation,
// otherwise returns null (no flag needed)
function classifySentence(
  sentence: string,
  prev: string,
  next: string
): FlaggedClaim | null {
  const lower = sentence.toLowerCase();
  let score = 0;
  const matchedPhrases: string[] = [];
  let dominantCategory = '';
  let highestWeight = 0;

  // Scan every indicator phrase from the dataset against this sentance.
  for (const indicator of indicators) {
    if (lower.includes(indicator.phrase) && indicator.requires_citation) {
      score += indicator.weight;
      matchedPhrases.push(indicator.phrase);
      // Track whichever indicator contributed the most weight. Thats the category
      // we show to the user in the analysis view
      if (indicator.weight > highestWeight) {
        highestWeight = indicator.weight;
        dominantCategory = indicator.category;
      }
    }
  }

  // Terminateif score is too low
  if (score < SCORE_THRESHOLD) return null;

  // Check the context window for a nearby citation before flagging
  resetRegex();
  const nearby = hasCitationNearby(sentence, prev, next);
  resetRegex();

  if (nearby) return null;

  return {
    sentence,
    matchedPhrases,
    score: Math.min(score, 1.0), // cap at 1.0 so the UI score display makes sense
    category: dominantCategory
  };
}

// ---------------------------------------------------------------------------
// Sentence splitting
// ---------------------------------------------------------------------------

// Splits a paragraph into individual sentences for the classifier
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10); // skip very short fragments, they're usually not real sentences
}

// ---------------------------------------------------------------------------
// Main analysis function
// ---------------------------------------------------------------------------

// Runs the full analysis pipeline on a piece of text.
// Called when the user moves from step 2 to step 3 in the wizard.
export function analyzeText(text: string): AnalysisResult {
  // Split into paragraphs on blank lines (standard for academic text)
  const rawParagraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Get all citations from the full text first
  const allCitations = extractCitations(text);
  const citationFormat = detectFormat(allCitations);

  const paragraphs: ParagraphAnalysis[] = rawParagraphs.map((paraText, index) => {
    const paraCitations = extractCitations(paraText);
    const sentences = splitSentences(paraText);

    const flaggedClaims: FlaggedClaim[] = [];
    for (let i = 0; i < sentences.length; i++) {
      const result = classifySentence(
        sentences[i],
        sentences[i - 1] ?? '', // empty string if this is the first sentance
        sentences[i + 1] ?? ''  // empty string if this is the last sentance
      );
      if (result) flaggedClaims.push(result);
    }

    return {
      index,
      text: paraText,
      citationCount: paraCitations.length,
      citationDensity: paraCitations.length,
      flaggedClaims,
      // A paragraph is "flagged" only if it has unsupported claims AND zero citations.
      isFlagged: flaggedClaims.length > 0 && paraCitations.length === 0
    };
  });

  const totalCitations = allCitations.length;
  const averageDensity =
    paragraphs.length > 0
      ? Math.round((totalCitations / paragraphs.length) * 10) / 10
      : 0;

  const totalFlaggedClaims = paragraphs.reduce(
    (sum, p) => sum + p.flaggedClaims.length,
    0
  );

  return {
    totalCitations,
    citationFormat,
    averageDensity,
    paragraphs,
    totalFlaggedClaims,
    allCitations
  };
}

// ---------------------------------------------------------------------------
// UU compliance check
// ---------------------------------------------------------------------------

// Maps each UU level to what's allowed and what should trigger a warning.
// Based on the UU AI Index document (July 2025).
const LEVEL_PURPOSE_RULES: Record<UULevel, { disallowed: string[]; warnings: string[] }> = {
  1: {
    // At level 1 basically nothing is allowed except spellcheck
    disallowed: [
      'concept_explanation',
      'text_generation',
      'grammar_support',
      'brainstorming',
      'programming_support',
      'finding_references',
      'feedback_on_writing'
    ],
    warnings: []
  },
  2: {
    // Planning/brainstorming only. Generating actual text is not allowed
    disallowed: ['text_generation'],
    warnings: ['finding_references', 'feedback_on_writing']
  },
  3: {
    // Editing and feedback is fine, but text generation should be flagged as a note
    disallowed: [],
    warnings: ['text_generation']
  },
  4: { disallowed: [], warnings: [] }, // pretty open at this level
  5: { disallowed: [], warnings: [] }  // anything goes
};

// Mesaages
const PURPOSE_DISPLAY: Record<string, string> = {
  concept_explanation: 'understanding/explaining concepts',
  text_generation: 'writing or revising text',
  grammar_support: 'grammar & language support',
  brainstorming: 'brainstorming',
  programming_support: 'programming support',
  finding_references: 'finding references',
  feedback_on_writing: 'feedback on writing'
};

// Compares the student's reported AI use against the rules for their selected UU level.
export function checkCompliance(answers: QuestionnaireAnswers): ComplianceResult {
  if (!answers.uuLevel) return { status: 'compliant', violations: [] };

  // If the only selected tool is 'None', theres nothing to check
  const usedNone = answers.tools.includes('None') && answers.tools.length === 1;
  if (usedNone) return { status: 'no_ai', violations: [] };

  const rules = LEVEL_PURPOSE_RULES[answers.uuLevel];
  const violations: string[] = [];

  // Check each reported purpose against the disallowed list for this level
  for (const purpose of answers.purposes) {
    if (rules.disallowed.includes(purpose)) {
      violations.push(
        `"${PURPOSE_DISPLAY[purpose]}" is not permitted at Level ${answers.uuLevel}`
      );
    }
  }

  // At levels 1 and 2, having any AI percentage > 0 is a problem
  // because AI content is not allowed in the final work at all
  if (answers.uuLevel <= 2 && answers.aiPercentage > 0) {
    violations.push(
      `At Level ${answers.uuLevel}, AI-generated content must not appear in the final work. ` +
        `You reported ~${answers.aiPercentage}% AI-assisted content.`
    );
  }

  for (const purpose of answers.purposes) {
    if (rules.warnings.includes(purpose) && !violations.some((v) => v.includes(PURPOSE_DISPLAY[purpose]))) {
      violations.push(
        `Note: "${PURPOSE_DISPLAY[purpose]}" at Level ${answers.uuLevel}. Ensure AI did not substantially alter your own work.`
      );
    }
  }

  return {
    status: violations.length > 0 ? 'attention' : 'compliant',
    violations
  };
}

// ---------------------------------------------------------------------------
// Statement generator
// ---------------------------------------------------------------------------

// Builds the final AI usage statement that the student will review and export
export function generateStatement(
  answers: QuestionnaireAnswers,
  analysis: AnalysisResult,
  compliance: ComplianceResult
): string {
  const level = answers.uuLevel ?? 1;
  const levelInfo = UU_LEVELS.find((l) => l.level === level)!;

  // 'None' means the student didnt use AI at all
  const usedAI = !answers.tools.includes('None') || answers.tools.length > 1;
  const toolsList = answers.tools.filter((t) => t !== 'None').join(', ');

  const purposeLines = answers.purposes
    .map((p) => `  - ${PURPOSE_DISPLAY[p] ?? p}`)
    .join('\n');

  const complianceLabel =
    compliance.status === 'compliant'
      ? 'Compliant'
      : compliance.status === 'no_ai'
        ? 'No AI used'
        : 'Attention: reported use may require review';

  // Format the UU requirements as a bullet list
  const requirementsBlock = levelInfo.requirementsNL.map((r) => `  • ${r}`).join('\n');

  const analysisBlock = [
    `  - ${analysis.totalCitations} citation(s) identified (format: ${analysis.citationFormat.toUpperCase()})`,
    `  - Average citation density: ${analysis.averageDensity} citation(s) per paragraph`,
    analysis.totalFlaggedClaims > 0
      ? `  - ${analysis.totalFlaggedClaims} statement(s) identified that may benefit from additional citations`
      : '  - No unsupported claims flagged'
  ].join('\n');

  // Build the AI usage paragraph depending on wether AI was used or not
  const aiBlock = usedAI
    ? [
        `In preparing this work, the author used ${toolsList || 'AI tools'} for the following purposes:`,
        purposeLines,
        `Approximately ${answers.aiPercentage}% of the content was written or substantially revised with AI assistance.`,
        // Only include these lines if the student answered positively
        answers.factChecked === 'yes' || answers.factChecked === 'partial'
          ? 'AI-generated claims were independently fact-checked before inclusion.'
          : '',
        answers.referencesVerified === 'yes'
          ? 'References suggested by AI tools were independently verified.'
          : ''
      ]
        .filter(Boolean)
        .join('\n')
    : 'The author did not use AI tools in preparing this work.';

  return `AI Use Transparency Statement
${'─'.repeat(40)}
UU AI Index Level: ${level} (${levelInfo.labelEN})
Compliance status: ${complianceLabel}
${compliance.violations.length > 0 ? '\nNotes:\n' + compliance.violations.map((v) => `  • ${v}`).join('\n') : ''}

${aiBlock}

Textual Analysis Summary:
${analysisBlock}

Required at Level ${level}:
${requirementsBlock}

${'─'.repeat(40)}
This statement was generated by the AI Transparency Tool based on self-reported
usage and automated textual analysis. The author has reviewed and approves this
statement as an accurate reflection of their AI use during the writing process.

Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

// ---------------------------------------------------------------------------
// Text statistics (used for the live counter on step 1)
// ---------------------------------------------------------------------------

export function getTextStats(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0).length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5).length;
  return { words, paragraphs, sentences };
}
