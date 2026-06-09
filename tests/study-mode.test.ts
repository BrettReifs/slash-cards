import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildStudyQuestions, scoreStudyAnswer } from "../src/utils/quizEngine.js";
import type { SlashCommand } from "../src/types.js";

function command(index: number, category = "session"): SlashCommand {
  return {
    id: `cmd-${index}`,
    command: `/cmd${index}`,
    platform: "copilot-cli",
    category,
    description: `Description ${index}`,
    aliases: [],
    whenToUse: `Use command ${index}.`,
    example: `/cmd${index}`,
    equivalents: [],
    docUrl: `https://example.test/cmd${index}`,
    tags: ["slash-command", category],
  };
}

function sequenceRandom(values: number[]) {
  let index = 0;
  return () => {
    const value = values[index % values.length] ?? 0;
    index += 1;
    return value;
  };
}

describe("study mode evals", () => {
  it("generates deterministic multiple-choice questions with unique distractors", () => {
    const commands = [command(1), command(2), command(3), command(4), command(5)];
    const config = {
      difficulty: "medium" as const,
      direction: "function-to-command" as const,
      questionCount: 2,
    };

    const firstRun = buildStudyQuestions(commands, config, sequenceRandom([0.1, 0.8, 0.3, 0.6]));
    const secondRun = buildStudyQuestions(commands, config, sequenceRandom([0.1, 0.8, 0.3, 0.6]));

    assert.deepEqual(secondRun, firstRun);
    for (const question of firstRun) {
      assert.equal(question.kind, "multiple-choice");
      assert.ok(question.options?.includes(question.prompt.answer));
      assert.equal(new Set(question.prompt.distractors).size, question.prompt.distractors.length);
      assert.equal(question.prompt.distractors.includes(question.prompt.answer), false);
    }
  });

  it("resolves mixed difficulty and direction through the injected random source", () => {
    const questions = buildStudyQuestions(
      [command(1), command(2), command(3)],
      {
        difficulty: "mixed",
        direction: "mixed",
        questionCount: 1,
      },
      sequenceRandom([0.1, 0.9, 0.8, 0.7]),
    );

    assert.equal(questions[0]?.direction, "command-to-function");
    assert.equal(questions[0]?.difficulty, "hard");
    assert.equal(questions[0]?.kind, "typed");
  });

  it("scores true-false, multiple-choice, and typed answers with meaningful thresholds", () => {
    const [trueFalse] = buildStudyQuestions(
      [command(1), command(2)],
      { difficulty: "easy", direction: "command-to-function", questionCount: 1 },
      sequenceRandom([0.1, 0.2, 0.9]),
    );
    assert.equal(
      scoreStudyAnswer(trueFalse!, String(trueFalse!.isPresentedAnswerCorrect)).isCorrect,
      true,
    );

    const [multipleChoice] = buildStudyQuestions(
      [command(1), command(2), command(3), command(4)],
      { difficulty: "medium", direction: "function-to-command", questionCount: 1 },
      sequenceRandom([0.1, 0.2, 0.3, 0.4]),
    );
    assert.equal(scoreStudyAnswer(multipleChoice!, multipleChoice!.prompt.answer).score, 1);

    const [typed] = buildStudyQuestions(
      [command(1), command(2)],
      { difficulty: "hard", direction: "function-to-command", questionCount: 1 },
      sequenceRandom([0.1, 0.2]),
    );
    assert.equal(scoreStudyAnswer(typed!, typed!.prompt.answer.toUpperCase()).isCorrect, true);
    assert.equal(scoreStudyAnswer(typed!, "/wrong").isCorrect, false);
  });
});
