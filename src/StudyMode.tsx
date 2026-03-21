import { useEffect, useMemo, useState } from "react";
import { buildStudyQuestions, scoreStudyAnswer } from "./utils/quizEngine";
import type {
  SlashCommand,
  StudyAttempt,
  StudyProgressRecord,
  StudySessionConfig,
  StudySessionState,
} from "./types";

const STORAGE_KEY = "slash-cards-study-progress";

interface StudyModeProps {
  commands: SlashCommand[];
  onExit: () => void;
}

function readProgress() {
  if (typeof window === "undefined") {
    return {} as Record<string, StudyProgressRecord>;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    return rawValue
      ? (JSON.parse(rawValue) as Record<string, StudyProgressRecord>)
      : {};
  } catch {
    return {} as Record<string, StudyProgressRecord>;
  }
}

function writeProgress(progress: Record<string, StudyProgressRecord>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getWeakCommandCount(progress: Record<string, StudyProgressRecord>) {
  return Object.values(progress).filter((record) => record.attempts > 0 && record.correct / record.attempts < 0.7).length;
}

export function StudyMode({ commands, onExit }: StudyModeProps) {
  const [config, setConfig] = useState<StudySessionConfig>({
    difficulty: "mixed",
    direction: "mixed",
    questionCount: 10,
  });
  const [session, setSession] = useState<StudySessionState | null>(null);
  const [progress, setProgress] = useState<Record<string, StudyProgressRecord>>({});
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    score: number;
    expected: string;
    answer: string;
  } | null>(null);

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  const currentQuestion = session?.questions[session.index] ?? null;
  const sessionAccuracy = useMemo(() => {
    if (!session || session.attempts.length === 0) {
      return 0;
    }

    const correct = session.attempts.filter((attempt) => attempt.isCorrect).length;
    return Math.round((correct / session.attempts.length) * 100);
  }, [session]);

  const masterySummary = useMemo(() => {
    const reviewed = Object.keys(progress).length;
    const weak = getWeakCommandCount(progress);
    return { reviewed, weak };
  }, [progress]);

  const startSession = () => {
    if (commands.length === 0) {
      return;
    }

    const questions = buildStudyQuestions(commands, {
      ...config,
      questionCount: Math.min(config.questionCount, commands.length),
    });

    setSession({
      config,
      questions,
      index: 0,
      attempts: [],
      startedAt: Date.now(),
    });
    setAnswer("");
    setFeedback(null);
  };

  const recordAttempt = (attempt: StudyAttempt) => {
    setProgress((current) => {
      const existing = current[attempt.commandId] ?? {
        commandId: attempt.commandId,
        attempts: 0,
        correct: 0,
        streak: 0,
        lastScore: 0,
      };
      const nextRecord: StudyProgressRecord = {
        ...existing,
        attempts: existing.attempts + 1,
        correct: existing.correct + (attempt.isCorrect ? 1 : 0),
        streak: attempt.isCorrect ? existing.streak + 1 : 0,
        lastReviewedAt: attempt.completedAt,
        lastScore: attempt.score,
      };
      const nextProgress = {
        ...current,
        [attempt.commandId]: nextRecord,
      };
      writeProgress(nextProgress);
      return nextProgress;
    });
  };

  const submitAnswer = (nextAnswer: string) => {
    if (!session || !currentQuestion || feedback) {
      return;
    }

    const result = scoreStudyAnswer(currentQuestion, nextAnswer);
    const attempt: StudyAttempt = {
      questionId: currentQuestion.id,
      commandId: currentQuestion.commandId,
      difficulty: currentQuestion.difficulty,
      direction: currentQuestion.direction,
      isCorrect: result.isCorrect,
      score: result.score,
      answer: nextAnswer,
      completedAt: Date.now(),
    };

    setSession((current) =>
      current
        ? {
            ...current,
            attempts: [...current.attempts, attempt],
          }
        : current
    );
    recordAttempt(attempt);
    setFeedback({ ...result, answer: nextAnswer });
  };

  const advance = () => {
    if (!session) {
      return;
    }

    if (session.index >= session.questions.length - 1) {
      setSession(null);
      setAnswer("");
      setFeedback(null);
      return;
    }

    setSession((current) =>
      current
        ? {
            ...current,
            index: current.index + 1,
          }
        : current
    );
    setAnswer("");
    setFeedback(null);
  };

  return (
    <section className="study-mode">
      <div className="panel study-mode__header">
        <div>
          <p className="eyebrow">Study Mode</p>
          <h2 className="comparison-view__title">Train command recall</h2>
          <p className="app-subtitle">
            Practice newest commands first, mix prompt directions, and track recall over time.
          </p>
        </div>
        <div className="study-mode__header-actions">
          <button type="button" className="back-button tap-target" onClick={onExit}>
            Back to gallery
          </button>
        </div>
      </div>

      {!session ? (
        <div className="study-mode__setup-grid">
          <section className="panel study-panel">
            <h3 className="section-title">Session setup</h3>
            {commands.length === 0 ? (
              <div className="study-empty-state">
                <strong>No commands in the current study scope</strong>
                <p className="helper-text">
                  Return to the gallery and broaden your filters before starting a session.
                </p>
              </div>
            ) : null}
            <label className="search-field">
              <span className="search-field__label">Difficulty</span>
              <select
                className="search-input tap-target"
                value={config.difficulty}
                onChange={(event) => {
                  const nextDifficulty =
                    event.currentTarget.value as StudySessionConfig["difficulty"];
                  setConfig((current) => ({
                    ...current,
                    difficulty: nextDifficulty,
                  }));
                }}
              >
                <option value="easy">Easy: true / false</option>
                <option value="medium">Medium: multiple choice</option>
                <option value="hard">Hard: typed answer</option>
                <option value="mixed">Mixed mastery run</option>
              </select>
            </label>

            <label className="search-field">
              <span className="search-field__label">Prompt direction</span>
              <select
                className="search-input tap-target"
                value={config.direction}
                onChange={(event) => {
                  const nextDirection =
                    event.currentTarget.value as StudySessionConfig["direction"];
                  setConfig((current) => ({
                    ...current,
                    direction: nextDirection,
                  }));
                }}
              >
                <option value="command-to-function">Command to function</option>
                <option value="function-to-command">Function to command</option>
                <option value="mixed">Mixed prompts</option>
              </select>
            </label>

            <label className="search-field">
              <span className="search-field__label">Question count</span>
              <select
                className="search-input tap-target"
                value={String(config.questionCount)}
                onChange={(event) => {
                  const nextQuestionCount = Number(event.currentTarget.value);
                  setConfig((current) => ({
                    ...current,
                    questionCount: nextQuestionCount,
                  }));
                }}
              >
                {[5, 10, 15, 20].map((value) => (
                  <option key={value} value={value}>
                    {Math.min(value, commands.length)} questions
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="toolbar-button tap-target"
              onClick={startSession}
              disabled={commands.length === 0}
            >
              Start study session
            </button>
          </section>

          <section className="panel study-panel">
            <h3 className="section-title">Retention snapshot</h3>
            <div className="study-stats">
              <div className="study-stat-card">
                <strong>{commands.length}</strong>
                <span>Commands in scope</span>
              </div>
              <div className="study-stat-card">
                <strong>{masterySummary.reviewed}</strong>
                <span>Reviewed commands</span>
              </div>
              <div className="study-stat-card">
                <strong>{masterySummary.weak}</strong>
                <span>Need review</span>
              </div>
            </div>
            <p className="helper-text">
              Progress is stored locally in this browser so repeated sessions can surface weak areas and confirm mastery.
            </p>
          </section>
        </div>
      ) : currentQuestion ? (
        <div className="study-mode__session-grid">
          <section className="panel study-panel study-panel--question">
            <div className="study-session__progress">
              <strong>
                Question {session.index + 1} of {session.questions.length}
              </strong>
              <span className="helper-text">Accuracy {sessionAccuracy}%</span>
            </div>

            <div className="study-prompt">
              <p className="section-title">{currentQuestion.direction.replaceAll("-", " ")}</p>
              <h3 className="study-prompt__label">{currentQuestion.prompt.label}</h3>
            </div>

            {currentQuestion.kind === "true-false" ? (
              <div className="study-choices">
                <div className="study-true-false panel">
                  <p className="helper-text">Does this match the correct answer?</p>
                  <strong>{currentQuestion.presentedAnswer}</strong>
                </div>
                <div className="study-choices__actions">
                  <button type="button" className="toolbar-button tap-target" onClick={() => submitAnswer("true")}>
                    True
                  </button>
                  <button type="button" className="toolbar-button tap-target" onClick={() => submitAnswer("false")}>
                    False
                  </button>
                </div>
              </div>
            ) : null}

            {currentQuestion.kind === "multiple-choice" ? (
              <div className="study-choices">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="study-choice tap-target"
                    onClick={() => submitAnswer(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}

            {currentQuestion.kind === "typed" ? (
              <div className="study-typed-answer">
                <input
                  className="search-input tap-target"
                  value={answer}
                  placeholder="Type your answer"
                  onChange={(event) => setAnswer(event.currentTarget.value)}
                />
                <button
                  type="button"
                  className="toolbar-button tap-target"
                  onClick={() => submitAnswer(answer)}
                  disabled={!answer.trim()}
                >
                  Check answer
                </button>
              </div>
            ) : null}

            {feedback ? (
              <div className={`study-feedback ${feedback.isCorrect ? "study-feedback--correct" : "study-feedback--incorrect"}`}>
                <strong>{feedback.isCorrect ? "Correct" : "Needs review"}</strong>
                <p>
                  Expected: <span>{feedback.expected}</span>
                </p>
                {currentQuestion.kind === "typed" ? (
                  <p>Closeness score: {Math.round(feedback.score * 100)}%</p>
                ) : null}
                <button type="button" className="back-button tap-target" onClick={advance}>
                  {session.index >= session.questions.length - 1 ? "Finish session" : "Next question"}
                </button>
              </div>
            ) : null}
          </section>

          <aside className="panel study-panel study-panel--summary">
            <h3 className="section-title">Session summary</h3>
            <div className="study-stats">
              <div className="study-stat-card">
                <strong>{session.attempts.length}</strong>
                <span>Answered</span>
              </div>
              <div className="study-stat-card">
                <strong>{session.attempts.filter((attempt) => attempt.isCorrect).length}</strong>
                <span>Correct</span>
              </div>
              <div className="study-stat-card">
                <strong>{session.questions.length - session.index - 1}</strong>
                <span>Remaining</span>
              </div>
            </div>
            <p className="helper-text">
              Difficulty: {session.config.difficulty}. Direction: {session.config.direction}.
            </p>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
