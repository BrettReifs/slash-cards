import type {
  SlashCommand,
  StudyDifficulty,
  StudyDirection,
  StudyQuestion,
  StudySessionConfig,
} from "../types";
import { fuzzyMatchScore } from "./fuzzyMatcher";

function shuffle<T>(items: T[]) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[randomIndex]] = [nextItems[randomIndex], nextItems[index]];
  }

  return nextItems;
}

function sampleUnique(values: string[], count: number, exclude: string) {
  const uniqueValues = [...new Set(values.filter((value) => value && value !== exclude))];
  return shuffle(uniqueValues).slice(0, count);
}

function getPromptLabel(command: SlashCommand, direction: Exclude<StudyDirection, "mixed">) {
  return direction === "command-to-function"
    ? command.command
    : command.description;
}

function getPromptAnswer(command: SlashCommand, direction: Exclude<StudyDirection, "mixed">) {
  return direction === "command-to-function"
    ? command.description
    : command.command;
}

function getDistractors(
  command: SlashCommand,
  commands: SlashCommand[],
  direction: Exclude<StudyDirection, "mixed">,
  count: number
) {
  const pool = commands
    .filter((candidate) => candidate.id !== command.id)
    .filter((candidate) => candidate.category === command.category || candidate.platform === command.platform)
    .map((candidate) => getPromptAnswer(candidate, direction));

  const distractors = sampleUnique(pool, count, getPromptAnswer(command, direction));
  if (distractors.length >= count) {
    return distractors;
  }

  const fallbackPool = commands
    .filter((candidate) => candidate.id !== command.id)
    .map((candidate) => getPromptAnswer(candidate, direction));

  return [...distractors, ...sampleUnique(fallbackPool, count - distractors.length, getPromptAnswer(command, direction))];
}

function resolveDirection(direction: StudyDirection): Exclude<StudyDirection, "mixed"> {
  if (direction !== "mixed") {
    return direction;
  }

  return Math.random() > 0.5 ? "command-to-function" : "function-to-command";
}

function resolveDifficulty(difficulty: StudyDifficulty): Exclude<StudyDifficulty, "mixed"> {
  if (difficulty !== "mixed") {
    return difficulty;
  }

  const difficulties: Array<Exclude<StudyDifficulty, "mixed">> = ["easy", "medium", "hard"];
  return difficulties[Math.floor(Math.random() * difficulties.length)];
}

function createQuestion(
  command: SlashCommand,
  commands: SlashCommand[],
  difficulty: StudyDifficulty,
  direction: StudyDirection,
  index: number
): StudyQuestion {
  const resolvedDirection = resolveDirection(direction);
  const resolvedDifficulty = resolveDifficulty(difficulty);
  const answer = getPromptAnswer(command, resolvedDirection);
  const distractors = getDistractors(command, commands, resolvedDirection, 3);

  if (resolvedDifficulty === "easy") {
    const isPresentedAnswerCorrect = Math.random() > 0.5 || distractors.length === 0;
    return {
      id: `${command.id}:easy:${resolvedDirection}:${index}`,
      commandId: command.id,
      command: command.command,
      platform: command.platform,
      difficulty: resolvedDifficulty,
      direction: resolvedDirection,
      kind: "true-false",
      prompt: {
        label: getPromptLabel(command, resolvedDirection),
        answer,
        distractors,
      },
      presentedAnswer: isPresentedAnswerCorrect ? answer : distractors[0] ?? answer,
      isPresentedAnswerCorrect,
    };
  }

  if (resolvedDifficulty === "medium") {
    return {
      id: `${command.id}:medium:${resolvedDirection}:${index}`,
      commandId: command.id,
      command: command.command,
      platform: command.platform,
      difficulty: resolvedDifficulty,
      direction: resolvedDirection,
      kind: "multiple-choice",
      prompt: {
        label: getPromptLabel(command, resolvedDirection),
        answer,
        distractors,
      },
      options: shuffle([answer, ...distractors]).slice(0, 4),
    };
  }

  return {
    id: `${command.id}:hard:${resolvedDirection}:${index}`,
    commandId: command.id,
    command: command.command,
    platform: command.platform,
    difficulty: resolvedDifficulty,
    direction: resolvedDirection,
    kind: "typed",
    prompt: {
      label: getPromptLabel(command, resolvedDirection),
      answer,
      distractors,
    },
  };
}

export function buildStudyQuestions(commands: SlashCommand[], config: StudySessionConfig) {
  return shuffle(commands)
    .slice(0, Math.min(config.questionCount, commands.length))
    .map((command, index) => createQuestion(command, commands, config.difficulty, config.direction, index));
}

export function scoreStudyAnswer(question: StudyQuestion, answer: string) {
  if (question.kind === "true-false") {
    const normalizedAnswer = answer.trim().toLowerCase();
    const guessedTrue = normalizedAnswer === "true";
    const isCorrect = guessedTrue === question.isPresentedAnswerCorrect;
    const score = isCorrect ? 1 : 0;
    return {
      isCorrect,
      score,
      expected: question.prompt.answer,
    };
  }

  if (question.kind === "multiple-choice") {
    const isCorrect = answer === question.prompt.answer;
    return {
      isCorrect,
      score: isCorrect ? 1 : 0,
      expected: question.prompt.answer,
    };
  }

  const score = fuzzyMatchScore(answer, question.prompt.answer);
  return {
    isCorrect: score >= 0.72,
    score,
    expected: question.prompt.answer,
  };
}
