export type Platform =
  | "copilot-vscode"
  | "copilot-cli"
  | "copilot-github"
  | "copilot-vs"
  | "copilot-jetbrains"
  | "copilot-xcode"
  | "claude-code"
  | "claude-sdk";

export type Category =
  | "session"
  | "code-action"
  | "planning"
  | "config"
  | "permissions"
  | "directory"
  | "integration"
  | "collaboration"
  | "scaffolding"
  | "auth"
  | "telemetry"
  | "help"
  | "customization"
  | "unique";

export interface SlashCommand {
  id: string;
  command: string;
  platform: Platform | string;
  category: Category | string;
  description: string;
  aliases: string[];
  whenToUse: string;
  example: string;
  equivalents: string[];
  docUrl: string;
  tags: string[];
  behavior?: string;
  releasedAt?: string;
  updatedAt?: string;
  releaseVersion?: string;
  priority?: "new" | "essential" | "common" | "niche";
  workspaceWeight?: number;
  isNew?: boolean;
  isRecentlyUpdated?: boolean;
  catalogIndex?: number;
}

export type SlashCardsSort =
  | "relevance"
  | "newest"
  | "workspace-relevance"
  | "alphabetical-asc"
  | "alphabetical-desc";

export interface CommandGroup {
  command: string;
  topEntry: SlashCommand;
  entries: SlashCommand[];
  platforms: string[];
  isAvailableInSession: boolean;
}

export interface SlashCardsFilters {
  platforms: string[];
  category: string | null;
  search: string;
  sort: SlashCardsSort;
}

export type SlashCardsView = "gallery" | "study";

export type StudyDifficulty = "easy" | "medium" | "hard" | "mixed";

export type StudyDirection =
  | "command-to-function"
  | "function-to-command"
  | "mixed";

export type StudyQuestionKind =
  | "true-false"
  | "multiple-choice"
  | "typed";

export interface StudyPrompt {
  label: string;
  answer: string;
  distractors: string[];
}

export interface StudyQuestion {
  id: string;
  commandId: string;
  command: string;
  platform: string;
  difficulty: Exclude<StudyDifficulty, "mixed">;
  direction: Exclude<StudyDirection, "mixed">;
  kind: StudyQuestionKind;
  prompt: StudyPrompt;
  options?: string[];
  presentedAnswer?: string;
  isPresentedAnswerCorrect?: boolean;
}

export interface StudyAttempt {
  questionId: string;
  commandId: string;
  difficulty: Exclude<StudyDifficulty, "mixed">;
  direction: Exclude<StudyDirection, "mixed">;
  isCorrect: boolean;
  score: number;
  answer: string;
  completedAt: number;
}

export interface StudyProgressRecord {
  commandId: string;
  attempts: number;
  correct: number;
  lastReviewedAt?: number;
  streak: number;
  lastScore: number;
}

export interface StudySessionConfig {
  difficulty: StudyDifficulty;
  direction: StudyDirection;
  questionCount: number;
}

export interface StudySessionState {
  config: StudySessionConfig;
  questions: StudyQuestion[];
  index: number;
  attempts: StudyAttempt[];
  startedAt: number;
}

export interface HostContext {
  [key: string]: unknown;
  theme?: "light" | "dark";
  displayMode?: "inline" | "fullscreen" | "pip";
  availableDisplayModes?: Array<"inline" | "fullscreen" | "pip">;
  platform?: "web" | "desktop" | "mobile";
  locale?: string;
  containerDimensions?: {
    height?: number;
    maxHeight?: number;
    width?: number;
    maxWidth?: number;
  };
  styles?: {
    variables?: Record<string, string | undefined>;
    css?: {
      fonts?: string;
    };
  };
  safeAreaInsets?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export const PLATFORM_LABELS: Record<string, string> = {
  "copilot-vscode": "Copilot VS Code",
  "copilot-cli": "Copilot CLI",
  "copilot-github": "Copilot GitHub.com",
  "copilot-vs": "Copilot Visual Studio",
  "copilot-jetbrains": "Copilot JetBrains",
  "copilot-xcode": "Copilot Xcode",
  "claude-code": "Claude Code",
  "claude-sdk": "Claude Agent SDK",
};

export const CATEGORY_LABELS: Record<string, string> = {
  "session": "Session Management",
  "code-action": "Code Actions",
  "planning": "Planning",
  "config": "Configuration",
  "permissions": "Permissions",
  "directory": "Directory Access",
  "integration": "Integration",
  "collaboration": "Collaboration",
  "scaffolding": "Scaffolding",
  "auth": "Authentication",
  "telemetry": "Telemetry",
  "help": "Help",
  "customization": "Customization",
  "unique": "Unique Features",
};

export interface SlashCardsContent extends Record<string, unknown> {
  commands: SlashCommand[];
}

export interface CommandComparisonContent extends Record<string, unknown> {
  commandName: string;
  commands: SlashCommand[];
}
