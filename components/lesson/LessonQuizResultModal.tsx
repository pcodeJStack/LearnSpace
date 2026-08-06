"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import { AxiosError } from "axios";
import { useGetQuizResultQuery } from "@/app/hooks/lessonQuiz/useGetQuizResult";
import {
  mapAttemptToSubmissionResult,
  formatQuestionScoreLabel,
  getQuestionEarnedPoints,
  type QuizResultSummary,
  type QuizSubmissionResult,
} from "@/app/service/lessonQuiz.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { lessonNavyButton } from "./lessonTheme";

type LessonQuizResultModalProps = {
  snapLessonQuizId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MODAL_CLASS =
  "flex h-[min(90dvh,820px)] max-h-[90dvh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-0 shadow-xl sm:max-w-5xl lg:max-w-6xl max-sm:h-[92dvh] max-sm:max-h-[92dvh]";

const optionLabel = (index: number) => String.fromCharCode(65 + index);

const isPendingResult = (status?: string) => status === "PENDING";

const isEssayQuestion = (
  question: QuizSubmissionResult["questions"][number],
) => (question.options ?? []).length === 0;

const isEssayQuiz = (questions: QuizSubmissionResult["questions"]) =>
  questions.length > 0 && questions.every(isEssayQuestion);

const getQuestionStatusDotClass = (
  question: QuizSubmissionResult["questions"][number],
  _isActive: boolean,
  isPending: boolean,
  hasAnswer: boolean,
) => {
  if (isPending) {
    if (!hasAnswer) return "bg-slate-300";
    return "bg-[#6c5ce7]";
  }

  const earned = getQuestionEarnedPoints(question);
  const maxPoints = question.points;

  if (earned >= maxPoints) {
    return "bg-emerald-500";
  }

  if (earned > 0) {
    return "bg-amber-500";
  }

  return isActive ? "bg-rose-300" : "bg-rose-400";
};

const getStatusLabel = (status?: string) => {
  if (status === "GRADED") return "Đã chấm";
  if (status === "PENDING") return "Đang chờ chấm";
  return status;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    if (error.response?.status === 404) {
      return "Bạn chưa nộp bài hoặc chưa có kết quả cho bài tập này.";
    }
    const data = error.response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = data.message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  }
  return "Không thể tải kết quả. Vui lòng thử lại.";
};

const formatSubmittedAt = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getLatestAttemptIndex = (attempts: QuizResultSummary["attempts"]) => {
  if (attempts.length === 0) return 0;
  let latestIndex = 0;
  for (let index = 1; index < attempts.length; index += 1) {
    if (attempts[index].attemptNo >= attempts[latestIndex].attemptNo) {
      latestIndex = index;
    }
  }
  return latestIndex;
};

function AttemptPickerSidebar({
  attempts,
  activeIndex,
  onChange,
}: {
  attempts: QuizResultSummary["attempts"];
  activeIndex: number;
  onChange: (index: number) => void;
}) {
  return (
    <div className="flex max-h-[min(42%,220px)] min-h-[88px] shrink-0 flex-col overflow-hidden border-b border-slate-200/80 bg-slate-100/40">
      <p className="shrink-0 px-4 pt-3 pb-2 text-[11px] font-medium tracking-wide text-slate-400 uppercase">
        Các lần làm ({attempts.length})
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
        <div className="flex flex-col gap-1.5">
        {attempts.map((attempt, index) => {
          const isActive = index === activeIndex;
          const submittedLabel = formatSubmittedAt(attempt.submittedAt);

          return (
            <button
              key={attempt.submissionId}
              type="button"
              onClick={() => onChange(index)}
              className={cn(
                "w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-xs transition ring-1",
                isActive
                  ? "bg-[rgba(108,92,231,0.08)] text-slate-900 ring-[rgba(108,92,231,0.22)] shadow-sm"
                  : "bg-white text-slate-700 ring-slate-200 hover:ring-[#d5ceff]",
              )}
            >
              <span className="font-semibold">Lần {attempt.attemptNo}</span>
              {submittedLabel ? (
                <span
                  className={cn(
                    "mt-0.5 block truncate",
                    isActive ? "text-slate-500" : "text-slate-400",
                  )}
                >
                  {submittedLabel}
                </span>
              ) : null}
              {!isPendingResult(attempt.status) ? (
                <span
                  className={cn(
                    "mt-1 block font-medium",
                    attempt.passed ? "text-emerald-600" : "text-amber-600",
                  )}
                >
                  {attempt.score}đ · {attempt.passed ? "Đạt" : "Chưa đạt"}
                </span>
              ) : (
                <span
                  className={cn(
                    "mt-1 block",
                    isActive ? "text-[#6c5ce7]" : "text-amber-600",
                  )}
                >
                  Chờ chấm
                </span>
              )}
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}

// function AttemptSwitchBar({
//   attempts,
//   activeIndex,
//   onChange,
// }: {
//   attempts: QuizResultSummary["attempts"];
//   activeIndex: number;
//   onChange: (index: number) => void;
// }) {
//   if (attempts.length <= 1) return null;

//   return (
//     <div className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 sm:px-6">
//       <p className="mb-2 text-[11px] font-medium text-slate-400">
//         Chọn lần làm bài
//       </p>
//       <div className="flex gap-2 overflow-x-auto overscroll-contain pb-0.5">
//         {attempts.map((attempt, index) => {
//           const isActive = index === activeIndex;
//           const submittedLabel = formatSubmittedAt(attempt.submittedAt);

//           return (
//             <button
//               key={attempt.submissionId}
//               type="button"
//               onClick={() => onChange(index)}
//               className={cn(
//                 "shrink-0 cursor-pointer rounded-lg px-3 py-2 text-left text-xs transition ring-1",
//                 isActive
//                   ? "bg-[#6c5ce7] text-white ring-[#6c5ce7] shadow-sm"
//                   : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-300",
//               )}
//             >
//               <span className="font-semibold">Lần {attempt.attemptNo}</span>
//               {submittedLabel ? (
//                 <span
//                   className={cn(
//                     "mt-0.5 block whitespace-nowrap",
//                     isActive ? "text-white/90" : "text-slate-400",
//                   )}
//                 >
//                   {submittedLabel}
//                 </span>
//               ) : null}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

function QuestionListSidebar({
  result,
  activeIndex,
  onChange,
  isPending,
}: {
  result: QuizSubmissionResult;
  activeIndex: number;
  onChange: (index: number) => void;
  isPending: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <p className="shrink-0 px-4 pt-3 pb-2 text-[11px] font-medium text-slate-400">
        Danh sách câu ({result.questions.length})
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
        <div className="flex flex-col gap-1.5">
          {result.questions.map((question, index) => {
            const isActive = index === activeIndex;
            const hasAnswer =
              Boolean(question.essayAnswer?.trim()) ||
              Boolean(question.selectedOptionId);
            const essayQuestion = isEssayQuestion(question);

            return (
              <button
                key={question.questionId}
                type="button"
                onClick={() => onChange(index)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all",
                  isActive
                    ? "bg-[rgba(108,92,231,0.08)] text-slate-900 ring-1 ring-[rgba(108,92,231,0.22)] shadow-sm"
                    : "bg-white text-slate-700 ring-1 ring-slate-200/80 hover:ring-[#d5ceff]",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    essayQuestion
                      ? getQuestionStatusDotClass(
                          question,
                          isActive,
                          isPending,
                          hasAnswer,
                        )
                      : isPending
                        ? hasAnswer
                          ? "bg-[#6c5ce7]"
                          : "bg-slate-300"
                        : question.correct
                          ? "bg-emerald-500"
                          : "bg-rose-400",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-900">
                    Câu {index + 1}
                  </span>
                  <span className="mt-0.5 block line-clamp-2 text-[11px] leading-snug text-slate-500">
                    {question.questionContent}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function QuizResultContent({ summary }: { summary: QuizResultSummary }) {
  const attempts = [...summary.attempts].sort(
    (a, b) => a.attemptNo - b.attemptNo,
  );
  const latestAttemptIndex = getLatestAttemptIndex(attempts);
  const [activeAttemptIndex, setActiveAttemptIndex] =
    useState(latestAttemptIndex);

  if (attempts.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="font-medium text-slate-800">Chưa có lần làm bài</p>
        <p className="mt-1 text-sm text-slate-500">
          Bạn chưa nộp bài hoặc chưa có kết quả cho bài tập này.
        </p>
      </div>
    );
  }

  const safeAttemptIndex = Math.min(
    activeAttemptIndex,
    Math.max(0, attempts.length - 1),
  );
  const resolvedAttempt = attempts[safeAttemptIndex] ?? attempts[0];

  const result = mapAttemptToSubmissionResult(
    { ...summary, attempts },
    resolvedAttempt,
  );

  return (
    <ResultWorkspace
      result={result}
      attempts={attempts}
      activeAttemptIndex={safeAttemptIndex}
      onAttemptChange={setActiveAttemptIndex}
    />
  );
}

function ResultWorkspace({
  result,
  attempts,
  activeAttemptIndex,
  onAttemptChange,
}: {
  result: QuizSubmissionResult;
  attempts: QuizResultSummary["attempts"];
  activeAttemptIndex: number;
  onAttemptChange: (index: number) => void;
}) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const isPending = isPendingResult(result.status);
  const questions = result.questions;
  const essayQuiz = isEssayQuiz(questions);
  const correctCount = questions.filter((q) => q.correct).length;
  const submittedCount = countSubmittedQuestions(questions);

  const safeQuestionIndex =
    questions.length === 0
      ? 0
      : Math.min(activeQuestionIndex, questions.length - 1);
  const activeQuestion = questions[safeQuestionIndex];

  const handleAttemptChange = (index: number) => {
    onAttemptChange(index);
    setActiveQuestionIndex(0);
  };

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(220px,280px)_minmax(0,1fr)] overflow-hidden max-md:grid-cols-1 max-md:grid-rows-[minmax(0,38%)_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col overflow-hidden border-r border-slate-200/80 bg-slate-50/50 max-md:border-r-0 max-md:border-b">
        <AttemptPickerSidebar
          attempts={attempts}
          activeIndex={activeAttemptIndex}
          onChange={handleAttemptChange}
        />
        <QuestionListSidebar
          key={`${result.submissionId}-${result.attemptNo}`}
          result={result}
          activeIndex={safeQuestionIndex}
          onChange={setActiveQuestionIndex}
          isPending={isPending}
        />
      </aside>

      <div className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] overflow-hidden bg-white">
          {/* <AttemptSwitchBar
            attempts={attempts}
            activeIndex={activeAttemptIndex}
            onChange={onAttemptChange}
          /> */}

        {/* {isPending ? (
          <PendingBanner
            passScore={result.passScore}
            totalCount={questions.length}
            submittedCount={submittedCount}
          />
        ) : ( */}
          <ScoreStrip
            score={result.score}
            passScore={result.passScore}
            passed={result.passed}
            correctCount={correctCount}
            submittedCount={submittedCount}
            totalCount={questions.length}
            status={result.status}
            isEssayQuiz={essayQuiz}
          />
        {/* )} */}

        <section
          key={`${result.submissionId}-${result.attemptNo}`}
          aria-label="Nội dung bài làm"
          className="min-h-0 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5"
        >
          {activeQuestion ? (
            <QuestionDetail
              question={activeQuestion}
              index={safeQuestionIndex}
              total={questions.length}
              isPending={isPending}
            />
          ) : (
            <div className="flex h-full min-h-[120px] items-center justify-center text-center">
              <p className="text-sm text-slate-500">
                Không có dữ liệu câu hỏi cho lần làm này.
              </p>
            </div>
          )}
        </section>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-3 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-pointer text-slate-500"
            onClick={() =>
              setActiveQuestionIndex((i) => Math.max(0, i - 1))
            }
            disabled={safeQuestionIndex === 0 || questions.length === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Câu trước
          </Button>
          <span className="text-xs text-slate-400 tabular-nums">
            {questions.length === 0
              ? "0 / 0"
              : `${safeQuestionIndex + 1} / ${questions.length}`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-pointer text-slate-500"
            onClick={() =>
              setActiveQuestionIndex((i) =>
                Math.min(questions.length - 1, i + 1),
              )
            }
            disabled={
              questions.length === 0 ||
              safeQuestionIndex >= questions.length - 1
            }
          >
            Câu sau
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// function PendingBanner({
//   passScore,
//   totalCount,
//   submittedCount,
// }: {
//   passScore: number;
//   totalCount: number;
//   submittedCount: number;
// }) {
//   return (
//     <div className="border-b border-amber-100 bg-amber-50/60 px-6 py-4">
//       <div className="flex items-start gap-3">
//         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-amber-600 ring-1 ring-amber-200">
//           <Clock className="h-4 w-4" />
//         </div>
//         <div>
//           <p className="text-sm font-semibold text-amber-900">
//             Bài làm đang chờ giáo viên chấm
//           </p>
//           <p className="mt-1 text-sm leading-relaxed text-amber-800/80">
//             Bạn có thể xem lại câu trả lời đã nộp. Điểm số và đáp án đúng/sai
//             sẽ hiển thị sau khi được chấm.
//           </p>
//           <p className="mt-2 text-xs text-amber-700/70">
//             Đã nộp {submittedCount}/{totalCount} câu · Yêu cầu đạt ≥ {passScore}{" "}
//             điểm
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

function ScoreStrip({
  score,
  passScore,
  passed,
  correctCount,
  submittedCount,
  totalCount,
  status,
  isEssayQuiz: essayQuiz,
}: {
  score: number;
  passScore: number;
  passed: boolean;
  correctCount: number;
  submittedCount: number;
  totalCount: number;
  status?: string;
  isEssayQuiz: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-100 bg-white px-6 py-3.5 text-sm">
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {score}
        </span>
        <span className="text-slate-400">điểm</span>
      </div>

      <span className="hidden h-4 w-px bg-slate-200 sm:block" />

      <span
        className={cn(
          "font-medium",
          passed ? "text-emerald-600" : "text-amber-600",
        )}
      >
        {passed ? "Đạt" : "Chưa đạt"}
        <span className="font-normal text-slate-400"> · cần {passScore}</span>
      </span>

      <span className="hidden h-4 w-px bg-slate-200 sm:block" />

      <span className="text-slate-600">
        {essayQuiz ? (
          <>
            Đã nộp{" "}
            <span className="font-medium text-slate-900 tabular-nums">
              {submittedCount}/{totalCount}
            </span>{" "}
            câu
          </>
        ) : (
          <>
            <span className="font-medium text-slate-900 tabular-nums">
              {correctCount}/{totalCount}
            </span>{" "}
            câu đúng
          </>
        )}
      </span>

      {status ? (
        <>
          <span className="hidden h-4 w-px bg-slate-200 sm:block" />
          <span className="font-medium text-emerald-600">
            {getStatusLabel(status)}
          </span>
        </>
      ) : null}
    </div>
  );
}

function OptionItem({
  label,
  content,
  isSelected,
  isCorrect,
  isPending,
}: {
  label: string;
  content: string;
  isSelected: boolean;
  isCorrect: boolean;
  isPending: boolean;
}) {
  if (isPending) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl px-1 py-2 transition-colors",
          isSelected && "bg-[rgba(108,92,231,0.06)]",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[9px] font-semibold",
            isSelected
              ? "border-[#6c5ce7] bg-[#6c5ce7] text-white"
              : "border-slate-200 bg-white text-slate-400",
          )}
        >
          {label}
        </span>
        <div className="min-w-0 flex-1 pt-px">
          <p className="text-sm leading-relaxed text-slate-700">{content}</p>
          {isSelected ? (
            <p className="mt-1 text-xs text-[#6c5ce7]">Bạn đã chọn</p>
          ) : null}
        </div>
      </div>
    );
  }

  const showMarker = isSelected || isCorrect;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl px-1 py-2 transition-colors",
        showMarker && "bg-slate-50/80",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          isCorrect
            ? "border-emerald-500 bg-emerald-500 text-white"
            : isSelected
              ? "border-rose-400 bg-rose-400 text-white"
              : "border-slate-200 bg-white",
        )}
      >
        {isCorrect ? (
          <Check className="h-3 w-3" strokeWidth={3} />
        ) : isSelected ? (
          <X className="h-3 w-3" strokeWidth={3} />
        ) : (
          <span className="text-[9px] font-semibold text-slate-400">{label}</span>
        )}
      </span>

      <div className="min-w-0 flex-1 pt-px">
        <p className="text-sm leading-relaxed text-slate-700">{content}</p>
        {showMarker ? (
          <p className="mt-1 text-xs text-slate-400">
            {[isSelected ? "Bạn chọn" : null, isCorrect ? "Đáp án đúng" : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function QuestionDetail({
  question,
  index,
  total,
  isPending,
}: {
  question: QuizSubmissionResult["questions"][number];
  index: number;
  total: number;
  isPending: boolean;
}) {
  const options = question.options ?? [];
  const essayQuestion = isEssayQuestion(question);
  const hasAnswer =
    Boolean(question.essayAnswer?.trim()) ||
    Boolean(question.selectedOptionId);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
          Câu {index + 1} / {total}
        </p>
        {isPending ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            <Clock className="h-3 w-3" />
            Chờ chấm
          </span>
        ) : essayQuestion ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ebe7ff] px-2.5 py-1 text-xs font-medium text-[#6c5ce7]">
            Đã chấm
            <span className="text-slate-300">·</span>
            {formatQuestionScoreLabel(question)}
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              question.correct
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-600",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                question.correct ? "bg-emerald-500" : "bg-rose-400",
              )}
            />
            {question.correct ? "Trả lời đúng" : "Trả lời sai"}
            <span className="text-slate-300">·</span>
            {formatQuestionScoreLabel(question)}
          </span>
        )}
      </div>

      <p className="text-[15px] leading-relaxed font-medium text-slate-900">
        {question.questionContent}
      </p>

      <div className="mt-5">
        {essayQuestion ? (
          <div className="rounded-xl bg-slate-50 px-4 py-3.5">
            <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
              Bài làm của bạn
            </p>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
              {question.essayAnswer?.trim() || "Không có nội dung"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {options.map((option, optionIndex) => (
              <OptionItem
                key={option.optionId}
                label={optionLabel(optionIndex)}
                content={option.content}
                isSelected={option.optionId === question.selectedOptionId}
                isCorrect={option.correct}
                isPending={isPending}
              />
            ))}
          </div>
        )}
        {isPending && !hasAnswer ? (
          <p className="mt-3 text-xs text-slate-400">Bạn chưa trả lời câu này</p>
        ) : null}
      </div>
    </div>
  );
}

function countSubmittedQuestions(questions: QuizSubmissionResult["questions"]) {
  return questions.filter(
    (question) =>
      Boolean(question.essayAnswer?.trim()) ||
      Boolean(question.selectedOptionId),
  ).length;
}

export function LessonQuizResultModal({
  snapLessonQuizId,
  open,
  onOpenChange,
}: LessonQuizResultModalProps) {
  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetQuizResultQuery(
    open ? (snapLessonQuizId ?? undefined) : undefined,
    open,
  );

  const latestAttempt =
    summary?.attempts[getLatestAttemptIndex(summary.attempts ?? [])];
  const isPending = latestAttempt
    ? isPendingResult(latestAttempt.status)
    : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MODAL_CLASS}>
        <div className="shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ebe7ff] text-[#6c5ce7]">
              <ClipboardList className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-semibold tracking-tight text-slate-900">
                {summary?.quizTitle ?? "Kết quả bài tập"}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm text-slate-500">
                {summary && summary.attempts.length > 1
                  ? `${summary.attempts.length} lần làm · chọn lần để xem chi tiết`
                  : summary && isPending
                    ? "Xem lại bài làm đã nộp — đang chờ chấm"
                    : "Xem lại điểm số và từng câu trả lời"}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
              Đang tải...
            </div>
          ) : isError ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
              <AlertCircle className="mb-3 h-6 w-6 text-slate-300" />
              <p className="font-medium text-slate-800">Không thể tải kết quả</p>
              <p className="mt-1 text-sm text-slate-500">
                {getErrorMessage(error)}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-5 cursor-pointer"
                onClick={() => refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : summary ? (
            <QuizResultContent key={summary.quizId} summary={summary} />
          ) : null}
        </div>

        <div className="shrink-0 border-t border-slate-100 px-6 py-4">
          <Button
            type="button"
            className={cn("h-10 w-full cursor-pointer rounded-xl", lessonNavyButton)}
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
