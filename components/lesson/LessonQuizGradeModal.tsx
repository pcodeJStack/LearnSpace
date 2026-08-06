"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  UserRound,
  XCircle,
} from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { useGetGradedQuizSubmissionsQuery } from "@/app/hooks/lessonQuiz/useGetGradedQuizSubmissions";
import { useGetPendingQuizSubmissionsQuery } from "@/app/hooks/lessonQuiz/useGetPendingQuizSubmissions";
import { useGradeQuizSubmissionMutation } from "@/app/hooks/lessonQuiz/useGradeQuizSubmission";
import type {
  GradedQuizSubmission,
  PendingQuizSubmission,
} from "@/app/service/lessonQuiz.service";
import {
  getAnswerMaxPoints,
  getGradedSubmissionScore,
} from "@/app/service/lessonQuiz.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { lessonNavyButton } from "./lessonTheme";

type LessonQuizGradeModalProps = {
  snapLessonQuizId: string | null;
  quizTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type GradeTab = "pending" | "graded";

const MODAL_CLASS =
  "flex h-[min(90dvh,820px)] max-h-[90dvh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-0 shadow-xl sm:max-w-5xl lg:max-w-6xl max-sm:h-[92dvh] max-sm:max-h-[92dvh]";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = data.message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  }
  return fallback;
};

const getGradeErrorMessage = (error: unknown) =>
  getErrorMessage(error, "Không thể lưu điểm. Vui lòng thử lại.");

function GradeTabBar({
  activeTab,
  pendingCount,
  gradedCount,
  onChange,
}: {
  activeTab: GradeTab;
  pendingCount: number;
  gradedCount: number;
  onChange: (tab: GradeTab) => void;
}) {
  return (
    <div className="flex shrink-0 gap-2 border-b border-slate-100 px-6 pb-3">
      <button
        type="button"
        onClick={() => onChange("pending")}
        className={cn(
          "cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition",
          activeTab === "pending"
            ? "bg-[rgba(108,92,231,0.1)] text-[#6c5ce7]"
            : "text-slate-600 hover:bg-slate-100",
        )}
      >
        Chờ chấm
        {pendingCount > 0 ? (
          <span
            className={cn(
              "ml-1.5 rounded-md px-1.5 py-0.5 text-xs",
              activeTab === "pending"
                ? "bg-[#6c5ce7]/15 text-[#6c5ce7]"
                : "bg-amber-100 text-amber-700",
            )}
          >
            {pendingCount}
          </span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={() => onChange("graded")}
        className={cn(
          "cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition",
          activeTab === "graded"
            ? "bg-[rgba(108,92,231,0.1)] text-[#6c5ce7]"
            : "text-slate-600 hover:bg-slate-100",
        )}
      >
        Đã chấm
        {gradedCount > 0 ? (
          <span
            className={cn(
              "ml-1.5 rounded-md px-1.5 py-0.5 text-xs",
              activeTab === "graded"
                ? "bg-[#6c5ce7]/15 text-[#6c5ce7]"
                : "bg-emerald-100 text-emerald-700",
            )}
          >
            {gradedCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}

function PendingStudentListSidebar({
  submissions,
  activeSubmissionId,
  onChange,
}: {
  submissions: PendingQuizSubmission[];
  activeSubmissionId: string | null;
  onChange: (submissionId: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <p className="shrink-0 px-4 pt-3 pb-2 text-[11px] font-medium tracking-wide text-slate-400 uppercase">
        Học sinh ({submissions.length})
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
        <div className="flex flex-col gap-1.5">
          {submissions.map((submission) => {
            const isActive = submission.submissionId === activeSubmissionId;

            return (
              <button
                key={submission.submissionId}
                type="button"
                onClick={() => onChange(submission.submissionId)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all",
                  isActive
                    ? "bg-[rgba(108,92,231,0.08)] text-slate-900 ring-1 ring-[rgba(108,92,231,0.22)] shadow-sm"
                    : "bg-white text-slate-700 ring-1 ring-slate-200/80 hover:ring-[#d5ceff]",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isActive
                      ? "bg-[#6c5ce7] text-white"
                      : "bg-[#ebe7ff] text-[#6c5ce7]",
                  )}
                >
                  <UserRound className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-sm font-semibold",
                      isActive ? "text-slate-900" : "text-slate-900",
                    )}
                  >
                    {submission.studentName}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block text-[11px]",
                      isActive ? "text-slate-500" : "text-slate-400",
                    )}
                  >
                    {submission.answers.length} câu trả lời
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

function GradedStudentListSidebar({
  submissions,
  activeSubmissionId,
  onChange,
}: {
  submissions: GradedQuizSubmission[];
  activeSubmissionId: string | null;
  onChange: (submissionId: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <p className="shrink-0 px-4 pt-3 pb-2 text-[11px] font-medium tracking-wide text-slate-400 uppercase">
        Học sinh ({submissions.length})
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
        <div className="flex flex-col gap-1.5">
          {submissions.map((submission) => {
            const isActive = submission.submissionId === activeSubmissionId;

            return (
              <button
                key={submission.submissionId}
                type="button"
                onClick={() => onChange(submission.submissionId)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all",
                  isActive
                    ? "bg-[rgba(108,92,231,0.08)] text-slate-900 ring-1 ring-[rgba(108,92,231,0.22)] shadow-sm"
                    : "bg-white text-slate-700 ring-1 ring-slate-200/80 hover:ring-[#d5ceff]",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isActive
                      ? "bg-[#6c5ce7] text-white"
                      : "bg-[#ebe7ff] text-[#6c5ce7]",
                  )}
                >
                  <UserRound className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {submission.studentName}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block text-[11px] font-medium",
                      submission.passed ? "text-emerald-600" : "text-amber-600",
                    )}
                  >
                    {getGradedSubmissionScore(submission)}đ ·{" "}
                    {submission.passed ? "Đạt" : "Chưa đạt"}
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

function SubmissionGradePanel({
  submission,
  snapLessonQuizId,
  onGraded,
}: {
  submission: PendingQuizSubmission;
  snapLessonQuizId: string;
  onGraded: () => void;
}) {
  const [pointsByAnswer, setPointsByAnswer] = useState<Record<string, string>>(
    {},
  );
  const { mutateAsync: gradeSubmission, isPending } =
    useGradeQuizSubmissionMutation();

  useEffect(() => {
    const initial: Record<string, string> = {};
    submission.answers.forEach((answer) => {
      const existingScore =
        typeof answer.gradedPoints === "number" ? answer.gradedPoints : null;
      initial[answer.answerId] =
        existingScore !== null ? String(existingScore) : "";
    });
    setPointsByAnswer(initial);
  }, [submission.submissionId, submission.answers]);

  const totalPoints = useMemo(
    () =>
      submission.answers.reduce((sum, answer) => {
        const raw = pointsByAnswer[answer.answerId]?.trim();
        const value = raw ? Number(raw) : 0;
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0),
    [submission.answers, pointsByAnswer],
  );

  const handleSave = async () => {
    const answers = submission.answers.map((answer) => {
      const raw = pointsByAnswer[answer.answerId]?.trim() ?? "";
      const score = Number(raw);

      return {
        answerId: answer.answerId,
        score: Number.isFinite(score) && score >= 0 ? score : 0,
      };
    });

    try {
      await gradeSubmission({
        submissionId: submission.submissionId,
        snapLessonQuizId,
        payload: { answers },
      });
      toast.success(`Đã chấm bài của ${submission.studentName}`);
      onGraded();
    } catch (error) {
      console.error(error);
      toast.error(getGradeErrorMessage(error));
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
        <p className="text-sm font-semibold text-slate-900">
          {submission.studentName}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {submission.answers.length} câu · Tổng điểm tạm tính:{" "}
          <span className="font-medium text-[#6c5ce7]">{totalPoints}</span>
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
        <div className="space-y-4">
          {submission.answers.map((answer, index) => (
            <article
              key={answer.answerId}
              className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                    Câu {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {answer.questionContent}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <label
                    htmlFor={`points-${answer.answerId}`}
                    className="text-xs text-slate-500"
                  >
                    Chấm
                  </label>
                  <Input
                    id={`points-${answer.answerId}`}
                    type="number"
                    min={0}
                    max={
                      getAnswerMaxPoints(answer) !== undefined
                        ? getAnswerMaxPoints(answer)
                        : undefined
                    }
                    step={0.5}
                    inputMode="decimal"
                    placeholder="0"
                    value={pointsByAnswer[answer.answerId] ?? ""}
                    onChange={(event) =>
                      setPointsByAnswer((current) => ({
                        ...current,
                        [answer.answerId]: event.target.value,
                      }))
                    }
                    className="h-9 w-20 rounded-lg text-center"
                  />
                  {getAnswerMaxPoints(answer) !== undefined ? (
                    <span className="text-xs text-slate-400">
                      / {getAnswerMaxPoints(answer)}đ
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3.5">
                <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                  Bài làm
                </p>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                  {answer.essayAnswer?.trim() || "Không có nội dung"}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-100 px-5 py-3 sm:px-6">
        <Button
          type="button"
          className={cn("h-10 w-full cursor-pointer rounded-xl", lessonNavyButton)}
          disabled={isPending}
          onClick={() => void handleSave()}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu điểm...
            </>
          ) : (
            "Lưu điểm"
          )}
        </Button>
      </div>
    </div>
  );
}

function GradedSubmissionDetailPanel({
  submission,
}: {
  submission: GradedQuizSubmission;
}) {
  const totalMaxPoints = submission.answers.reduce(
    (sum, answer) => sum + answer.maxPoints,
    0,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {submission.studentName}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {submission.answers.length} câu · Tổng{" "}
              {getGradedSubmissionScore(submission)}/{totalMaxPoints}đ
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              submission.passed
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700",
            )}
          >
            {submission.passed ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            {submission.passed ? "Đạt" : "Chưa đạt"}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
        <div className="space-y-4">
          {submission.answers.map((answer, index) => {
            const isFullScore = answer.gradedPoints >= answer.maxPoints;
            const hasPartialScore =
              answer.gradedPoints > 0 && answer.gradedPoints < answer.maxPoints;

            return (
              <article
                key={answer.answerId}
                className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                      Câu {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {answer.questionContent}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-lg px-2.5 py-1 text-xs font-semibold tabular-nums",
                      isFullScore
                        ? "bg-emerald-50 text-emerald-700"
                        : hasPartialScore
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-600",
                    )}
                  >
                    {answer.gradedPoints}/{answer.maxPoints}đ
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function useActiveSubmissionId<T extends { submissionId: string }>(
  submissions: T[],
) {
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(
    submissions[0]?.submissionId ?? null,
  );

  useEffect(() => {
    if (submissions.length === 0) {
      setActiveSubmissionId(null);
      return;
    }

    const stillExists = submissions.some(
      (item) => item.submissionId === activeSubmissionId,
    );

    if (!stillExists) {
      setActiveSubmissionId(submissions[0].submissionId);
    }
  }, [submissions, activeSubmissionId]);

  const activeSubmission =
    submissions.find((item) => item.submissionId === activeSubmissionId) ??
    submissions[0] ??
    null;

  return { activeSubmission, setActiveSubmissionId };
}

function PendingGradeWorkspace({
  submissions,
  snapLessonQuizId,
  onGraded,
}: {
  submissions: PendingQuizSubmission[];
  snapLessonQuizId: string;
  onGraded: () => void;
}) {
  const { activeSubmission, setActiveSubmissionId } =
    useActiveSubmissionId(submissions);

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(220px,280px)_minmax(0,1fr)] overflow-hidden max-md:grid-cols-1 max-md:grid-rows-[minmax(0,38%)_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col overflow-hidden border-r border-slate-200/80 bg-slate-50/50 max-md:border-r-0 max-md:border-b">
        <PendingStudentListSidebar
          submissions={submissions}
          activeSubmissionId={activeSubmission?.submissionId ?? null}
          onChange={setActiveSubmissionId}
        />
      </aside>

      {activeSubmission ? (
        <SubmissionGradePanel
          key={activeSubmission.submissionId}
          submission={activeSubmission}
          snapLessonQuizId={snapLessonQuizId}
          onGraded={onGraded}
        />
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center text-sm text-slate-500">
          Chọn học sinh để xem bài làm
        </div>
      )}
    </div>
  );
}

function GradedResultsWorkspace({
  submissions,
}: {
  submissions: GradedQuizSubmission[];
}) {
  const { activeSubmission, setActiveSubmissionId } =
    useActiveSubmissionId(submissions);

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(220px,280px)_minmax(0,1fr)] overflow-hidden max-md:grid-cols-1 max-md:grid-rows-[minmax(0,38%)_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col overflow-hidden border-r border-slate-200/80 bg-slate-50/50 max-md:border-r-0 max-md:border-b">
        <GradedStudentListSidebar
          submissions={submissions}
          activeSubmissionId={activeSubmission?.submissionId ?? null}
          onChange={setActiveSubmissionId}
        />
      </aside>

      {activeSubmission ? (
        <GradedSubmissionDetailPanel
          key={activeSubmission.submissionId}
          submission={activeSubmission}
        />
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center text-sm text-slate-500">
          Chọn học sinh để xem kết quả
        </div>
      )}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <ClipboardCheck className="mb-3 h-8 w-8 text-slate-300" />
      <p className="font-medium text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <AlertCircle className="mb-3 h-6 w-6 text-slate-300" />
      <p className="font-medium text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-5 cursor-pointer"
        onClick={onRetry}
      >
        Thử lại
      </Button>
    </div>
  );
}

export function LessonQuizGradeModal({
  snapLessonQuizId,
  quizTitle,
  open,
  onOpenChange,
}: LessonQuizGradeModalProps) {
  const [activeTab, setActiveTab] = useState<GradeTab>("pending");

  const {
    data: pendingSubmissions = [],
    isLoading: isPendingLoading,
    isError: isPendingError,
    error: pendingError,
    refetch: refetchPending,
  } = useGetPendingQuizSubmissionsQuery(
    open ? (snapLessonQuizId ?? undefined) : undefined,
    open,
  );

  const {
    data: gradedSubmissions = [],
    isLoading: isGradedLoading,
    isError: isGradedError,
    error: gradedError,
    refetch: refetchGraded,
  } = useGetGradedQuizSubmissionsQuery(
    open ? (snapLessonQuizId ?? undefined) : undefined,
    open,
  );

  const handleGraded = () => {
    void refetchPending();
    void refetchGraded();
  };

  const isLoading =
    activeTab === "pending" ? isPendingLoading : isGradedLoading;
  const isError = activeTab === "pending" ? isPendingError : isGradedError;
  const error = activeTab === "pending" ? pendingError : gradedError;
  const refetch = activeTab === "pending" ? refetchPending : refetchGraded;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MODAL_CLASS}>
        <div className="shrink-0 px-6 pt-6 pb-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ebe7ff] text-[#6c5ce7]">
              <ClipboardCheck className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-semibold tracking-tight text-slate-900">
                Chấm bài tập
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm text-slate-500">
                {quizTitle
                  ? `${quizTitle} · chọn học sinh bên trái để xem chi tiết`
                  : "Chọn học sinh bên trái để xem chi tiết"}
              </DialogDescription>
            </div>
          </div>
        </div>

        <GradeTabBar
          activeTab={activeTab}
          pendingCount={pendingSubmissions.length}
          gradedCount={gradedSubmissions.length}
          onChange={setActiveTab}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-3">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
              {activeTab === "pending"
                ? "Đang tải danh sách bài chờ chấm..."
                : "Đang tải danh sách bài đã chấm..."}
            </div>
          ) : isError ? (
            <ErrorState
              title={
                activeTab === "pending"
                  ? "Không thể tải danh sách bài chờ chấm"
                  : "Không thể tải danh sách bài đã chấm"
              }
              message={getErrorMessage(
                error,
                activeTab === "pending"
                  ? "Không thể tải danh sách bài chờ chấm. Vui lòng thử lại."
                  : "Không thể tải danh sách bài đã chấm. Vui lòng thử lại.",
              )}
              onRetry={() => void refetch()}
            />
          ) : activeTab === "pending" ? (
            pendingSubmissions.length === 0 ? (
              <EmptyState
                title="Không có bài chờ chấm"
                description="Tất cả bài nộp đã được chấm hoặc chưa có bài nộp."
              />
            ) : snapLessonQuizId ? (
              <PendingGradeWorkspace
                key={`pending-${snapLessonQuizId}-${pendingSubmissions.length}`}
                submissions={pendingSubmissions}
                snapLessonQuizId={snapLessonQuizId}
                onGraded={handleGraded}
              />
            ) : null
          ) : gradedSubmissions.length === 0 ? (
            <EmptyState
              title="Chưa có bài đã chấm"
              description="Chưa có học sinh nào được chấm điểm cho bài tập này."
            />
          ) : (
            <GradedResultsWorkspace
              key={`graded-${snapLessonQuizId}-${gradedSubmissions.length}`}
              submissions={gradedSubmissions}
            />
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full cursor-pointer rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
