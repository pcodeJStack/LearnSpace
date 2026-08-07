"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  GraduationCap,
  Loader2,
  SendHorizontal,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { useCreateReviewReplyMutation } from "@/app/hooks/feedback/useCreateReviewReplyMutation";
import { useGetClassroomFeedbackQuery } from "@/app/hooks/feedback/useGetClassroomFeedback";
import { useSubmitTeacherFeedbackMutation } from "@/app/hooks/feedback/useSubmitTeacherFeedbackMutation";
import { useGetMyClassesQuery } from "@/app/hooks/classes/useGetMyClasses";
import type { ClassroomFeedbackItem } from "@/app/service/feedback.service";
import { type MyClass } from "@/app/service/classroom.service";
import {
  FeedbackReviewPanel,
  countFeedbackReplies,
} from "@/components/feedback/FeedbackReviewPanel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ratingLabels: Record<number, string> = {
  1: "Cần cải thiện nhiều",
  2: "Chưa đạt kỳ vọng",
  3: "Ổn, tạm hài lòng",
  4: "Tốt, đáng ghi nhận",
  5: "Xuất sắc, rất ấn tượng",
};

const ratingHints: Record<number, string> = {
  1: "Chia sẻ rõ điểm cần thay đổi",
  2: "Góp ý cụ thể sẽ rất hữu ích",
  3: "Điều gì làm bạn thấy ổn?",
  4: "Điểm mạnh nào đáng giữ lại?",
  5: "Kể thêm khoảnh khắc đáng nhớ",
};

const ease = [0.22, 1, 0.36, 1] as const;

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getErrorMessage = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Không thể gửi đánh giá. Vui lòng thử lại.";
};

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} sao`}>
    {[1, 2, 3, 4, 5].map((value) => (
      <Star
        key={value}
        className={`h-5 w-5 ${
          value <= rating
            ? "fill-orange-400 text-orange-400"
            : "text-slate-300"
        }`}
      />
    ))}
  </div>
);

const SubmittedFeedbackView = ({
  item,
}: {
  item: ClassroomFeedbackItem;
}) => {
  const createReply = useCreateReviewReplyMutation();
  const [isReplying, setIsReplying] = useState(false);
  const [content, setContent] = useState("");
  const [parentReplyId, setParentReplyId] = useState<string | null>(null);

  const replyCount = countFeedbackReplies(item.replies ?? []);

  const closeComposer = () => {
    setIsReplying(false);
    setContent("");
    setParentReplyId(null);
  };

  const handleSubmitReply = async () => {
    const trimmed = content.trim();
    if (!trimmed || createReply.isPending) return;

    if (!parentReplyId) {
      toast.error("Vui lòng chọn tin nhắn cần trả lời.");
      return;
    }

    try {
      const response = await createReply.mutateAsync({
        reviewId: item.id,
        payload: {
          content: trimmed,
          parentReplyId,
        },
      });
      closeComposer();
      toast.success(response.message || "Đã gửi phản hồi.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Đánh giá của bạn
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Feedback đã gửi
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Xem đánh giá và các phản hồi từ giảng viên bên dưới.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Đã gửi · {replyCount} phản hồi
        </span>
      </div>

      <div className="min-h-[28rem] overflow-hidden rounded-[24px] border border-slate-200/80 bg-white lg:h-[min(40rem,70vh)]">
        <FeedbackReviewPanel
          item={item}
          viewerRole="STUDENT"
          accent="violet"
          parentReplyId={parentReplyId}
          content={content}
          isReplying={isReplying}
          isPending={createReply.isPending}
          onContentChange={setContent}
          onOpenReply={(id) => {
            if (!id) return;
            setParentReplyId(id);
            setIsReplying(true);
          }}
          onCloseReply={closeComposer}
          onSubmit={() => void handleSubmitReply()}
        />
      </div>
    </div>
  );
};

const StudentTeacherFeedbackPage = () => {
  const reduceMotion = useReducedMotion();
  const { data: myClasses = [], isLoading, isError } = useGetMyClassesQuery();
  const submitFeedback = useSubmitTeacherFeedbackMutation();

  const [classroomId, setClassroomId] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  const selectedClass = useMemo(
    () => myClasses.find((item) => item.id === classroomId) ?? null,
    [classroomId, myClasses],
  );

  const {
    data: feedbackData,
    isLoading: isLoadingFeedback,
    isFetching: isFetchingFeedback,
    isError: isFeedbackError,
  } = useGetClassroomFeedbackQuery({
    classroomId: classroomId || undefined,
    page: 0,
    size: 10,
  });

  const existingFeedback = feedbackData?.content?.[0] ?? null;
  const hasSubmitted = Boolean(existingFeedback);

  const teacherId = selectedClass?.teacherId || null;
  const teacherName = selectedClass?.teacherName?.trim() || "";
  const displayRating = hoverRating || rating;
  const feedbackLength = feedback.trim().length;

  const canSubmit =
    Boolean(classroomId && teacherId && rating > 0 && feedback.trim()) &&
    !submitFeedback.isPending &&
    !hasSubmitted;

  const handleSelectClass = (classroom: MyClass) => {
    setClassroomId(classroom.id);
    setJustSubmitted(false);
    setRating(0);
    setHoverRating(0);
    setFeedback("");
    if (!classroom.teacherId) {
      setRating(0);
    }
  };

  const handleSubmit = () => {
    if (hasSubmitted) {
      toast.error("Bạn đã gửi feedback cho lớp này rồi.");
      return;
    }

    if (!classroomId || !teacherId) {
      toast.error("Lớp học chưa có giảng viên để đánh giá.");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Vui lòng chọn mức đánh giá từ 1 đến 5 sao.");
      return;
    }

    const trimmed = feedback.trim();
    if (!trimmed) {
      toast.error("Vui lòng nhập nội dung feedback.");
      return;
    }

    submitFeedback.mutate(
      {
        teacherId,
        classroomId,
        rating,
        feedback: trimmed,
      },
      {
        onSuccess: (data) => {
          toast.success(data?.message || "Đã gửi đánh giá giảng viên.");
          setRating(0);
          setHoverRating(0);
          setFeedback("");
          setJustSubmitted(true);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  };

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_12%_-10%,rgba(251,146,60,0.16),transparent_55%),radial-gradient(ellipse_60%_50%_at_90%_0%,rgba(139,92,246,0.12),transparent_50%),linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#f8fafc_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.025)_1px,transparent_1px)] bg-size-[28px_28px] [mask-image:linear-gradient(180deg,black,transparent_92%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:py-10">
        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="flex flex-col justify-between gap-8 lg:sticky lg:top-8 lg:self-start"
        >
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-orange-600 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Feedback giảng viên
            </span>

            <div className="space-y-5">
              <h2 className="max-w-md text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                <span className="block leading-[1.15]">Chia sẻ trải nghiệm</span>
                <span className="mt-2 block leading-[1.2] bg-linear-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent">
                  học cùng giảng viên
                </span>
              </h2>
              <p className="max-w-sm pt-1 text-sm leading-7 text-slate-500">
                Mỗi lớp chỉ gửi feedback một lần. Sau đó bạn và giảng viên có
                thể trao đổi phản hồi qua lại.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                Chọn lớp
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                Gửi đánh giá
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Trao đổi phản hồi
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedClass && teacherName ? (
              <motion.div
                key={selectedClass.id}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
                className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm"
              >
                <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-linear-to-br from-violet-400/25 to-orange-300/20 blur-2xl" />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-orange-400 text-lg font-bold text-white">
                    {getInitials(teacherName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                      {hasSubmitted ? "Đã đánh giá" : "Đang đánh giá"}
                    </p>
                    <p className="truncate text-lg font-bold text-slate-900">
                      {teacherName}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {selectedClass.name}
                    </p>
                  </div>
                </div>
                {!teacherId ? (
                  <p className="relative mt-4 text-xs text-amber-700">
                    Lớp này chưa được gán giảng viên nên chưa gửi được đánh giá.
                  </p>
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                key="empty-teacher"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border border-dashed border-slate-200 bg-white/40 px-5 py-6 text-sm text-slate-500"
              >
                <GraduationCap className="mb-3 h-5 w-5 text-slate-400" />
                Chọn một lớp ở bên phải để hiện thông tin giảng viên.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.08, ease }}
          className="min-w-0"
        >
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-2 rounded-3xl border border-slate-200/80 bg-white/80 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải danh sách lớp...
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">
              Không thể tải danh sách lớp học. Vui lòng thử lại sau.
            </div>
          ) : null}

          {!isLoading && !isError && myClasses.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-500">
              Bạn chưa tham gia lớp nào. Hãy tham gia lớp trước khi gửi đánh giá.
            </div>
          ) : null}

          {!isLoading && myClasses.length > 0 ? (
            <div className="space-y-7 rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] sm:p-7">
              <div className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                      Bước 01
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                      Chọn lớp học
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    {myClasses.length} lớp
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {myClasses.map((classroom: MyClass) => {
                    const active = classroom.id === classroomId;
                    return (
                      <button
                        key={classroom.id}
                        type="button"
                        onClick={() => handleSelectClass(classroom)}
                        className={`group relative cursor-pointer overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition duration-300 ${
                          active
                            ? "border-violet-300 bg-violet-50/80 ring-1 ring-violet-200"
                            : "border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        {active ? (
                          <motion.span
                            layoutId={reduceMotion ? undefined : "class-glow"}
                            className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-violet-500 to-orange-400"
                          />
                        ) : null}
                        <p
                          className={`truncate text-sm font-semibold ${
                            active ? "text-violet-900" : "text-slate-800"
                          }`}
                        >
                          {classroom.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {classroom.teacherName || "Chưa có giảng viên"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent" />

              {!classroomId ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-12 text-center text-sm text-slate-500">
                  Chọn một lớp để gửi hoặc xem feedback đã gửi.
                </div>
              ) : isLoadingFeedback ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải feedback...
                </div>
              ) : isFeedbackError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
                  Không thể tải feedback của lớp này. Vui lòng thử lại.
                </div>
              ) : hasSubmitted && existingFeedback ? (
                <div
                  className={
                    isFetchingFeedback ? "opacity-70 transition" : undefined
                  }
                >
                  <SubmittedFeedbackView item={existingFeedback} />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                        Bước 02
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">
                        Mức hài lòng
                      </h3>
                    </div>

                    <div
                      className={`rounded-2xl border px-4 py-5 transition sm:px-5 ${
                        displayRating
                          ? "border-orange-200 bg-linear-to-br from-orange-50/80 to-violet-50/40"
                          : "border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {[1, 2, 3, 4, 5].map((value) => {
                            const active = displayRating >= value;
                            return (
                              <motion.button
                                key={value}
                                type="button"
                                whileHover={
                                  reduceMotion ? undefined : { scale: 1.12 }
                                }
                                whileTap={
                                  reduceMotion ? undefined : { scale: 0.92 }
                                }
                                className="cursor-pointer rounded-xl p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                                onMouseEnter={() => setHoverRating(value)}
                                onMouseLeave={() => setHoverRating(0)}
                                onFocus={() => setHoverRating(value)}
                                onBlur={() => setHoverRating(0)}
                                onClick={() => {
                                  setRating(value);
                                  setJustSubmitted(false);
                                }}
                                aria-label={`${value} sao`}
                                disabled={!teacherId}
                              >
                                <Star
                                  className={`h-9 w-9 transition-colors duration-200 sm:h-10 sm:w-10 ${
                                    active
                                      ? "fill-orange-400 text-orange-400 drop-shadow-[0_6px_12px_rgba(251,146,60,0.35)]"
                                      : "text-slate-300"
                                  } ${!teacherId ? "opacity-40" : ""}`}
                                />
                              </motion.button>
                            );
                          })}
                        </div>

                        <AnimatePresence mode="wait">
                          <motion.div
                            key={displayRating || "none"}
                            initial={
                              reduceMotion ? false : { opacity: 0, y: 6 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="min-w-[140px] text-right"
                          >
                            <p className="text-2xl font-extrabold tracking-tight text-slate-900">
                              {displayRating ? `${displayRating}/5` : "—/5"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {displayRating
                                ? ratingLabels[displayRating]
                                : "Chạm để chọn sao"}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                          Bước 03
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                          Nội dung feedback
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400">
                        {feedbackLength} ký tự
                      </p>
                    </div>

                    <p className="text-xs text-slate-500">
                      {rating > 0
                        ? ratingHints[rating]
                        : "Chọn số sao để nhận gợi ý viết feedback phù hợp."}
                    </p>

                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => {
                        setFeedback(e.target.value);
                        setJustSubmitted(false);
                      }}
                      placeholder="Ví dụ: Giảng viên giải thích dễ hiểu, tempo buổi học hợp lý, có thể thêm ví dụ thực tế hơn..."
                      className="min-h-40 resize-none rounded-2xl border-slate-200 bg-slate-50/70 px-4 py-3 text-sm leading-relaxed shadow-none focus-visible:bg-white"
                      disabled={!teacherId}
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <AnimatePresence mode="wait">
                      {justSubmitted ? (
                        <motion.p
                          key="sent"
                          initial={
                            reduceMotion ? false : { opacity: 0, x: -8 }
                          }
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Đã gửi thành công
                        </motion.p>
                      ) : (
                        <motion.p
                          key="hint"
                          initial={reduceMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-xs text-slate-400"
                        >
                          Mỗi lớp chỉ gửi được một lần feedback.
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <Button
                      type="button"
                      disabled={!canSubmit}
                      onClick={handleSubmit}
                      className="h-12 cursor-pointer gap-2 rounded-2xl bg-slate-900 px-6 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitFeedback.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          Gửi đánh giá
                          <SendHorizontal className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </motion.section>
      </div>
    </div>
  );
};

export default StudentTeacherFeedbackPage;
