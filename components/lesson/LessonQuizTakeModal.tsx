"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardList,
  Clock,
  FileText,
  KeyRound,
  Loader2,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useGetLessonQuizQuery } from "@/app/hooks/lessonQuiz/useGetLessonQuiz";
import { useCheckLessonQuizCodeMutation } from "@/app/hooks/lessonQuiz/useCheckLessonQuizCode";
import { useSubmitLessonQuizMutation } from "@/app/hooks/lessonQuiz/useSubmitLessonQuiz";
import {
  buildSubmitQuizPayload,
  resolveSubmitQuizResult,
  type LessonQuizDetail,
  type SubmitQuizResponse,
} from "@/app/service/lessonQuiz.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { lessonNavyButton, lessonNavyOutlineButton } from "./lessonTheme";

type QuizPhase = "ready" | "taking" | "finished" | "timeout";

type LessonQuizTakeModalProps = {
  lessonQuizId: string | null;
  snapLessonQuizId: string | null;
  fallbackTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewResult?: (snapLessonQuizId: string) => void;
};

type QuizResult = {
  earnedPoints: number;
  totalPoints: number;
  passed: boolean;
};

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const resolveResult = (
  quiz: LessonQuizDetail,
  data: SubmitQuizResponse,
  answers: Record<string, string>,
): QuizResult => resolveSubmitQuizResult(quiz, data, answers);

const optionLabel = (index: number) => String.fromCharCode(65 + index);

const MODAL_CLASS =
  "fixed inset-0 flex h-dvh max-h-dvh w-full max-w-full translate-none flex-col gap-0 overflow-hidden rounded-none border-slate-200 bg-white p-0 shadow-xl sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[92vh] sm:w-[calc(100%-1.5rem)] sm:max-w-[min(96vw,72rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl lg:max-w-6xl xl:max-w-7xl";

const getSubmitErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = data.message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  }

  return "Không thể nộp bài. Vui lòng thử lại.";
};

const getCheckCodeErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = data.message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  }

  return "Mã đề không đúng. Vui lòng thử lại.";
};

export function LessonQuizTakeModal({
  lessonQuizId,
  snapLessonQuizId,
  fallbackTitle,
  open,
  onOpenChange,
  onViewResult,
}: LessonQuizTakeModalProps) {
  const [codeVerified, setCodeVerified] = useState(false);
  const [lessonQuizCodeInput, setLessonQuizCodeInput] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const {
    data: quiz,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetLessonQuizQuery(
    codeVerified ? (lessonQuizId ?? undefined) : undefined,
  );

  const { mutateAsync: checkLessonQuizCode, isPending: isCheckingCode } =
    useCheckLessonQuizCodeMutation();

  const { mutateAsync: submitQuiz, isPending: isSubmitting } =
    useSubmitLessonQuizMutation();

  const submittedRef = useRef(false);
  const sessionInitializedRef = useRef(false);

  const [phase, setPhase] = useState<QuizPhase>("ready");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const resetSession = useCallback(() => {
    setCodeVerified(false);
    setLessonQuizCodeInput("");
    setCodeError(null);
    setPhase("ready");
    setSecondsLeft(0);
    setActiveQuestionIndex(0);
    setAnswers({});
    setResult(null);
    submittedRef.current = false;
    sessionInitializedRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) {
      resetSession();
    }
  }, [open, resetSession]);

  useEffect(() => {
    if (!open) return;
    setCodeVerified(false);
    setLessonQuizCodeInput("");
    setCodeError(null);
    sessionInitializedRef.current = false;
  }, [open, lessonQuizId]);

  const startTakingSession = useCallback(() => {
    if (!quiz || quiz.questions.length === 0) return;

    sessionInitializedRef.current = true;
    submittedRef.current = false;
    setActiveQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setPhase("taking");
    setSecondsLeft(Math.max(1, quiz.durationMinutes) * 60);
  }, [quiz]);

  useEffect(() => {
    if (!open || !quiz || !codeVerified || sessionInitializedRef.current) return;
    startTakingSession();
  }, [
    open,
    codeVerified,
    quiz,
    quiz?.quizId,
    quiz?.questions.length,
    quiz?.durationMinutes,
    startTakingSession,
  ]);

  useEffect(() => {
    if (!open || !quiz || phase !== "taking") return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open, quiz?.quizId, phase, quiz]);

  useEffect(() => {
    if (!quiz || phase !== "taking" || secondsLeft > 0) return;
    setPhase("timeout");
  }, [quiz, phase, secondsLeft]);

  const performSubmit = useCallback(
    async (
      nextPhase: "finished" | "timeout",
      requireAllAnswers: boolean,
      submitAnswers: Record<string, string> = answers,
    ) => {
      if (!quiz || !snapLessonQuizId || isSubmitting || submittedRef.current)
        return false;

      if (requireAllAnswers) {
        const unanswered = quiz.questions.filter(
          (question) => !submitAnswers[question.questionId]?.trim(),
        );

        if (unanswered.length > 0) {
          toast.error(`Còn ${unanswered.length} câu chưa trả lời`);
          return false;
        }
      }

      submittedRef.current = true;

      try {
        const data = await submitQuiz({
          snapLessonQuizId,
          payload: buildSubmitQuizPayload(quiz, submitAnswers),
        });

        if (quiz.quizType === "MULTIPLE_CHOICE") {
          setResult(resolveResult(quiz, data, submitAnswers));
        }

        setPhase(nextPhase);
        toast.success(
          data.message ??
            (nextPhase === "timeout"
              ? "Đã nộp bài khi hết giờ"
              : "Nộp bài thành công"),
        );
        return true;
      } catch (submitError) {
        submittedRef.current = false;
        toast.error(getSubmitErrorMessage(submitError));
        return false;
      }
    },
    [quiz, snapLessonQuizId, isSubmitting, answers, submitQuiz],
  );

  const submitAbandoned = useCallback(async () => {
    if (!quiz || !snapLessonQuizId || submittedRef.current) return;

    submittedRef.current = true;

    try {
      await submitQuiz({
        snapLessonQuizId,
        payload: buildSubmitQuizPayload(quiz, {}),
      });
      toast.info("Đã thoát bài làm. Bài được nộp với điểm 0.");
    } catch (submitError) {
      submittedRef.current = false;
      toast.error(getSubmitErrorMessage(submitError));
    }
  }, [quiz, snapLessonQuizId, submitQuiz]);

  useEffect(() => {
    if (
      phase !== "timeout" ||
      !quiz ||
      !snapLessonQuizId ||
      submittedRef.current
    ) {
      return;
    }

    void performSubmit("timeout", false);
  }, [phase, quiz, snapLessonQuizId, performSubmit]);

  const activeQuestion = quiz?.questions[activeQuestionIndex];
  const answeredCount = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.filter((question) =>
      Boolean(answers[question.questionId]?.trim()),
    ).length;
  }, [quiz, answers]);

  const progressPercent = quiz
    ? Math.round((answeredCount / Math.max(quiz.questions.length, 1)) * 100)
    : 0;

  const handleClose = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    if (isSubmitting || isCheckingCode) return;

    if (phase === "taking" && quiz && snapLessonQuizId) {
      void submitAbandoned().finally(() => onOpenChange(false));
      return;
    }

    onOpenChange(false);
  };

  const handleSubmit = () => {
    void performSubmit("finished", true);
  };

  const handleVerifyCode = async () => {
    const code = lessonQuizCodeInput.trim();
    if (!code) {
      setCodeError("Vui lòng nhập mã đề");
      return;
    }

    if (!lessonQuizId) {
      setCodeError("Không xác định được bài quiz");
      return;
    }

    setCodeError(null);

    try {
      await checkLessonQuizCode({
        quizId: lessonQuizId,
        lessonQuizCode: code,
      });
      sessionInitializedRef.current = false;
      setCodeVerified(true);
    } catch (checkError) {
      setCodeError(getCheckCodeErrorMessage(checkError));
    }
  };

  const isUrgent = secondsLeft > 0 && secondsLeft <= 60;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={MODAL_CLASS}>
        <div className="shrink-0 border-b border-slate-200 bg-linear-to-r from-slate-50 via-white to-slate-50/80 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6c5ce7] text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 pr-6 sm:pr-0">
                <DialogTitle className="text-base font-semibold text-slate-900 sm:text-lg">
                  {!codeVerified
                    ? "Nhập mã đề"
                    : isLoading
                      ? "Đang mở bài làm..."
                      : (quiz?.title ?? fallbackTitle ?? "Bài quiz")}
                </DialogTitle>
                <DialogDescription className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {!codeVerified
                    ? "Nhập đúng mã đề để vào làm bài ngay"
                    : isLoading
                      ? "Vui lòng đợi trong giây lát"
                      : (quiz?.description ?? "Làm bài trắc nghiệm buổi học")}
                </DialogDescription>
              </div>
            </div>

            {phase === "taking" && quiz ? (
              <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold tabular-nums shadow-sm ring-1",
                    isUrgent
                      ? "bg-rose-50 text-rose-700 ring-rose-200"
                      : "bg-white text-slate-800 ring-slate-200",
                  )}
                >
                  <Clock className={cn("h-4 w-4", isUrgent && "animate-pulse")} />
                  {formatTime(secondsLeft)}
                </div>
                <span className="hidden rounded-full bg-[#ebe7ff] px-2.5 py-1 text-xs font-semibold text-[#6c5ce7] ring-1 ring-[#ebe7ff] md:inline">
                  {answeredCount}/{quiz.questions.length} câu
                </span>
              </div>
            ) : null}
          </div>

          {phase === "taking" && quiz ? (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Tiến độ làm bài</span>
                <span>{progressPercent}% hoàn thành</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className="h-full rounded-full bg-[#6c5ce7] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/40 px-4 py-4 sm:px-6 sm:py-5">
          {!codeVerified ? (
            <div className="mx-auto flex min-h-[280px] max-w-xl flex-col justify-center py-6 sm:min-h-[320px]">
              <div className="rounded-2xl border border-amber-200/80 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Xác nhận mã đề
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                      {fallbackTitle
                        ? `Nhập mã để vào làm bài "${fallbackTitle}"`
                        : "Nhập mã đề do giáo viên cung cấp"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <label
                    htmlFor="lesson-quiz-code"
                    className="text-xs font-semibold tracking-wide text-slate-600 uppercase"
                  >
                    Mã đề
                  </label>
                  <Input
                    id="lesson-quiz-code"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-center font-mono text-base tracking-[0.2em] uppercase sm:text-left"
                    placeholder="LQ-XXXXXX"
                    value={lessonQuizCodeInput}
                    onChange={(e) => {
                      setLessonQuizCodeInput(e.target.value.toUpperCase());
                      if (codeError) setCodeError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleVerifyCode();
                      }
                    }}
                    autoComplete="off"
                    autoFocus
                  />
                  {codeError ? (
                    <p className="text-sm text-rose-600">{codeError}</p>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Nhập đúng mã sẽ vào làm bài ngay
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-sm text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              Đang mở bài làm...
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <AlertCircle className="mx-auto mb-3 h-6 w-6 text-slate-400" />
              <p className="font-medium text-slate-900">
                Không thể tải bài quiz
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {error instanceof Error ? error.message : "Vui lòng thử lại"}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 cursor-pointer"
                onClick={() => refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : isSubmitting ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-sm text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              Đang nộp bài...
            </div>
          ) : quiz && (phase === "finished" || phase === "timeout") ? (
            <div className="mx-auto max-w-lg py-6 text-center sm:py-8">
              <div
                className={cn(
                  "mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full shadow-sm ring-1",
                  result?.passed
                    ? "bg-emerald-50 text-emerald-600 ring-emerald-200"
                    : "bg-white text-slate-500 ring-slate-200",
                )}
              >
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h3 className="text-xl font-semibold text-slate-900">
                {phase === "timeout" ? "Hết giờ" : "Đã nộp bài"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {quiz.quizType === "ESSAY"
                  ? "Bài tự luận đã được ghi nhận. Giáo viên sẽ chấm sau."
                  : phase === "timeout"
                    ? "Bài làm đã được nộp tự động khi hết thời gian."
                    : "Bài làm của bạn đã được ghi nhận."}
              </p>

              {quiz.quizType === "MULTIPLE_CHOICE" && result ? (
                <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                  <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm">
                    <p className="text-xs text-slate-400">Điểm</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">
                      {result.earnedPoints}
                      <span className="text-sm font-normal text-slate-400">
                        /{result.totalPoints}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm">
                    <p className="text-xs text-slate-400">Kết quả</p>
                    <p
                      className={cn(
                        "mt-1 text-xl font-semibold",
                        result.passed ? "text-emerald-700" : "text-amber-700",
                      )}
                    >
                      {result.passed ? "Đạt" : "Chưa đạt"}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  className={cn(
                    "h-10 cursor-pointer rounded-lg px-8",
                    lessonNavyButton,
                  )}
                  onClick={startTakingSession}
                >
                  Làm tiếp
                </Button>
                {onViewResult && snapLessonQuizId ? (
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-10 cursor-pointer rounded-lg px-6",
                      lessonNavyOutlineButton,
                    )}
                    onClick={() => {
                      onViewResult(snapLessonQuizId);
                      onOpenChange(false);
                    }}
                  >
                    Xem chi tiết kết quả
                  </Button>
                ) : null}
                <Button
                  type="button"
                  className={cn(
                    "h-10 cursor-pointer rounded-lg px-8",
                    lessonNavyButton,
                  )}
                  onClick={() => onOpenChange(false)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          ) : quiz && quiz.questions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="font-medium text-slate-800">Chưa có câu hỏi</p>
              <p className="mt-1 text-sm text-slate-500">
                Liên hệ giáo viên để cập nhật nội dung bài quiz.
              </p>
            </div>
          ) : quiz && activeQuestion ? (
            <div className="grid min-h-0 gap-5 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6c5ce7] text-sm font-bold text-white shadow-sm">
                      {activeQuestionIndex + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-900">
                          Câu {activeQuestionIndex + 1} / {quiz.questions.length}
                        </p>
                        {answers[activeQuestion.questionId]?.trim() ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                            <Check className="h-3 w-3" />
                            Đã trả lời
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                            <Circle className="h-2.5 w-2.5" />
                            Chưa trả lời
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {activeQuestion.points} điểm
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                  <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
                    <p className="text-base leading-relaxed font-medium text-slate-900 sm:text-[17px]">
                      {activeQuestion.content}
                    </p>
                  </div>

                  <div className="px-5 py-5 sm:px-6">
                    {quiz.quizType === "ESSAY" ? (
                      <Textarea
                        className="min-h-[180px] resize-y rounded-xl border-slate-200 bg-slate-50/30 text-sm leading-relaxed focus-visible:ring-[#6c5ce7]/20 sm:min-h-[220px]"
                        placeholder="Viết câu trả lời của bạn..."
                        value={answers[activeQuestion.questionId] ?? ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [activeQuestion.questionId]: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {activeQuestion.options.map((option, optionIndex) => {
                          const isSelected =
                            answers[activeQuestion.questionId] ===
                            option.optionId;

                          return (
                            <button
                              key={option.optionId}
                              type="button"
                              onClick={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [activeQuestion.questionId]: option.optionId,
                                }))
                              }
                              className={cn(
                                "flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-4 text-left text-sm transition-all",
                                isSelected
                                  ? "border-[#6c5ce7] bg-[#ebe7ff] shadow-md ring-1 ring-[#6c5ce7]/10"
                                  : "border-slate-200 bg-white hover:border-[#d5ceff] hover:bg-[#ebe7ff]/40",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                                  isSelected
                                    ? "bg-[#6c5ce7] text-white"
                                    : "bg-slate-100 text-slate-600",
                                )}
                              >
                                {optionLabel(optionIndex)}
                              </span>
                              <span className="pt-0.5 leading-relaxed text-slate-800">
                                {option.content}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <aside className="w-full shrink-0 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm xl:sticky xl:top-0">
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Bảng câu hỏi
                  </p>
                  <p className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {answeredCount}/{quiz.questions.length}
                  </p>
                </div>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 xl:grid-cols-5">
                  {quiz.questions.map((question, index) => {
                    const isActive = index === activeQuestionIndex;
                    const isAnswered = Boolean(
                      answers[question.questionId]?.trim(),
                    );

                    return (
                      <button
                        key={question.questionId}
                        type="button"
                        onClick={() => setActiveQuestionIndex(index)}
                        title={
                          isAnswered
                            ? `Câu ${index + 1} - Đã làm`
                            : `Câu ${index + 1} - Chưa làm`
                        }
                        className={cn(
                          "relative flex h-10 cursor-pointer items-center justify-center rounded-lg border text-xs font-semibold transition-colors",
                          isActive
                            ? "border-[#6c5ce7] bg-[#6c5ce7] text-white shadow-sm"
                            : isAnswered
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-400"
                              : "border-dashed border-slate-300 bg-white text-slate-400 hover:border-slate-400 hover:bg-slate-50",
                        )}
                      >
                        {isAnswered && !isActive ? (
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                        {isAnswered && isActive ? (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded border border-emerald-300 bg-emerald-50 text-emerald-700">
                      <Check className="h-3 w-3" />
                    </span>
                    Đã trả lời
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded border border-dashed border-slate-300 text-slate-400">
                      <Circle className="h-2.5 w-2.5" />
                    </span>
                    Chưa trả lời
                  </span>
                </div>
              </aside>
            </div>
          ) : null}
        </div>

        {!codeVerified ? (
          <div className="flex shrink-0 items-center gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 cursor-pointer rounded-xl border-slate-200 bg-white"
              onClick={() => onOpenChange(false)}
              disabled={isCheckingCode}
            >
              Huỷ
            </Button>
            <Button
              type="button"
              className={cn(
                "h-11 flex-1 cursor-pointer rounded-xl",
                lessonNavyButton,
              )}
              onClick={() => void handleVerifyCode()}
              disabled={isCheckingCode || !lessonQuizCodeInput.trim()}
            >
              {isCheckingCode ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang kiểm tra...
                </>
              ) : (
                "Vào làm bài"
              )}
            </Button>
          </div>
        ) : null}

        {quiz && phase === "taking" && !isLoading && !isError ? (
          <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center justify-between gap-2 sm:justify-start">
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 cursor-pointer rounded-xl border-slate-200 bg-white"
                  onClick={() =>
                    setActiveQuestionIndex((index) => Math.max(0, index - 1))
                  }
                  disabled={activeQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 cursor-pointer rounded-xl border-slate-200 bg-white"
                  onClick={() =>
                    setActiveQuestionIndex((index) =>
                      Math.min(quiz.questions.length - 1, index + 1),
                    )
                  }
                  disabled={activeQuestionIndex >= quiz.questions.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm font-medium text-slate-500 sm:ml-3">
                <Timer className="mr-1.5 inline h-4 w-4" />
                {formatTime(secondsLeft)} còn lại
              </span>
            </div>
            <Button
              type="button"
              className={cn(
                "h-11 w-full cursor-pointer rounded-xl px-8 sm:w-auto",
                lessonNavyButton,
              )}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang nộp...
                </>
              ) : (
                "Nộp bài"
              )}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
