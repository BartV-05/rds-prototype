// Types and shared data for the AI Transparency Tool

// The UU AI Index has exactly 5 levels
export type UULevel = 1 | 2 | 3 | 4 | 5;

// Describes one level from the UU AI Index document (July 2025)
// We store both the Dutch label and an English one for the interface
export interface UULevelInfo {
  level: UULevel;
  labelNL: string;
  labelEN: string;
  // How much AI content is actually allowed in the final submitted work
  aiInFinalWork: 'not_allowed' | 'limited' | 'specific_parts' | 'fully_allowed';
  declarationRequired: boolean;
  promptLogRequired: boolean;
  citationRequired: boolean;
  /** Purposes that are NOT allowed at this level */
  disallowedPurposes: AIPurpose[];
  // The official requirements text from the UU document, kept in Dutch
  requirementsNL: string[];
}

// All the different ways a student could use AI during writing.
export type AIPurpose =
  | 'concept_explanation'
  | 'text_generation'
  | 'grammar_support'
  | 'brainstorming'
  | 'programming_support'
  | 'finding_references'
  | 'feedback_on_writing';

// Tools we ask about in the questionnaire. 'None' is a special case
// it disables the rest of the questions
export type AITool = 'ChatGPT' | 'Claude' | 'Copilot' | 'Gemini' | 'Other' | 'None';

// Everything the student fills in during step 2
export interface QuestionnaireAnswers {
  uuLevel: UULevel | null; // null means they havent selected one yet
  tools: AITool[];
  purposes: AIPurpose[];
  aiPercentage: number; // 0-100 slider
  factChecked: 'yes' | 'no' | 'partial' | null;
  referencesVerified: 'yes' | 'no' | 'na' | null;
}

// Result of comparing the questionnaire answers against the selected UU level.
// 'attention' means something is worth reviewing.
export type ComplianceStatus = 'compliant' | 'attention' | 'no_ai';

export interface ComplianceResult {
  status: ComplianceStatus;
  violations: string[]; // violations --> "notes"
}

// A single citation found in the text (either APA or IEEE format)
export interface CitationMatch {
  text: string;
  format: 'apa' | 'ieee';
  index: number;
}

// Analysis results for a single paragraph
export interface ParagraphAnalysis {
  index: number;
  text: string;
  citationCount: number;
  citationDensity: number;
  flaggedClaims: FlaggedClaim[];
  // isFlagged = true when there are claims AND no citations at all in the paragraph
  isFlagged: boolean;
}

// A sentance that the classifier thinks needs a citation but doesnt have one nearby
export interface FlaggedClaim {
  sentence: string;
  matchedPhrases: string[];
  score: number;
  category: string;
}

// The full output of analyzeText(). Passed to the analysis step component
export interface AnalysisResult {
  totalCitations: number;
  citationFormat: 'apa' | 'ieee' | 'mixed' | 'none';
  averageDensity: number;
  paragraphs: ParagraphAnalysis[];
  totalFlaggedClaims: number;
  allCitations: CitationMatch[];
}

export interface ClaimIndicator {
  phrase: string;
  category: 'epistemic_generalization' | 'statistical_claim' | 'attribution' | 'causal_claim' | 'consensus_claim';
  weight: number;          // 0.0 to 1.0, higher = more likely to need a citation
  requires_citation: boolean;
}

// The five UU AI Index levels, taken directly from the official document.
export const UU_LEVELS: UULevelInfo[] = [
  {
    level: 1,
    labelNL: 'Geen AI',
    labelEN: 'No AI allowed',
    aiInFinalWork: 'not_allowed',
    declarationRequired: false,
    promptLogRequired: false,
    citationRequired: false,
    disallowedPurposes: [
      'concept_explanation', 'text_generation', 'grammar_support',
      'brainstorming', 'programming_support', 'finding_references', 'feedback_on_writing'
    ],
    requirementsNL: ['Geen AI-verklaring vereist.']
  },
  {
    level: 2,
    labelNL: 'Planning & brainstormen',
    labelEN: 'AI for planning & brainstorming only',
    // AI can only be used before writing. Nothing ends up in the final text
    aiInFinalWork: 'not_allowed',
    declarationRequired: true,
    promptLogRequired: false,
    citationRequired: false,
    disallowedPurposes: ['text_generation'],
    requirementsNL: [
      'Voeg een AI-verklaring toe (welke tools en waarom).',
      'Bewaar een overzicht van gebruikte AI-prompts (aanbevolen).'
    ]
  },
  {
    level: 3,
    labelNL: 'Bewerking & feedback',
    labelEN: 'AI for editing & feedback',
    // Some AI editing is allowed but the core content must be the students own
    aiInFinalWork: 'limited',
    declarationRequired: true,
    promptLogRequired: true,
    citationRequired: true,
    disallowedPurposes: [],
    requirementsNL: [
      'Voeg een AI-verklaring toe (welke tools en waarom).',
      'Houd een logboek bij van alle gebruikte AI-prompts (verplicht op verzoek).',
      'Vermeld gebruikte AI-tools in de bronnenlijst of bijlage.'
    ]
  },
  {
    level: 4,
    labelNL: 'Contentgeneratie (specifieke taken)',
    labelEN: 'AI content generation for specific tasks',
    aiInFinalWork: 'specific_parts',
    declarationRequired: true,
    promptLogRequired: true,
    citationRequired: true,
    disallowedPurposes: [],
    requirementsNL: [
      'Voeg een AI-verklaring toe (welke tools en waarom).',
      'Houd een logboek bij van alle gebruikte AI-prompts (verplicht op verzoek).',
      'Vermeld AI-tools in bronnenlijst en citeer AI-gegenereerde inhoud in de tekst.'
    ]
  },
  {
    level: 5,
    labelNL: 'Volledig gebruik van AI',
    labelEN: 'Full AI use allowed',
    aiInFinalWork: 'fully_allowed',
    declarationRequired: false,
    promptLogRequired: false,
    citationRequired: true,
    disallowedPurposes: [],
    requirementsNL: [
      'Vermeld AI-tools in de lopende tekst of als voetnoot.',
      'Studenten zijn volledig verantwoordelijk voor kwaliteit en waarheidsgetrouwheid.'
    ]
  }
];

// Human-readable labels for the UI, seperate from the type keys
// so we can change the display text without touching the logic
export const PURPOSE_LABELS: Record<AIPurpose, string> = {
  concept_explanation: 'Understanding / explaining concepts',
  text_generation: 'Writing or revising text',
  grammar_support: 'Grammar & language support',
  brainstorming: 'Brainstorming ideas',
  programming_support: 'Programming / technical support',
  finding_references: 'Finding or suggesting references',
  feedback_on_writing: 'Feedback on writing'
};

export const TOOL_LABELS: Record<AITool, string> = {
  ChatGPT: 'ChatGPT',
  Claude: 'Claude',
  Copilot: 'GitHub Copilot / Microsoft Copilot',
  Gemini: 'Gemini',
  Other: 'Other',
  None: 'I did not use AI'
};
