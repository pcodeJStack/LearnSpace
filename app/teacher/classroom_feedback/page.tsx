"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
  MessageSquareHeart,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { useCreateReviewReplyMutation } from "@/app/hooks/feedback/useCreateReviewReplyMutation";
import { useGetClassroomFeedbackQuery } from "@/app/hooks/feedback/useGetClassroomFeedback";
import { useGetTeacherClassrooms } from "@/app/hooks/teacher/useGetTeacherClassrooms";
import type { ClassroomFeedbackItem } from "@/app/service/feedback.service";
import type { TeacherClassroom } from "@/app/service/teacher.service";
import {
  FeedbackReviewPanel,
  countFeedbackReplies,
} from "@/components/feedback/FeedbackReviewPanel";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;
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

const RatingStars = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} sao`}>
    {[1, 2, 3, 4, 5].map((value) => (
      <Star
        key={value}
        className={`${size === "md" ? "h-5 w-5" : "h-3.5 w-3.5"} ${
          value <= rating
            ? "fill-orange-400 text-orange-400"
            : "text-slate-300"
        }`}
      />
    ))}
  </div>
);

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

  return "Không thể gửi phản hồi. Vui lòng thử lại.";
};

const TeacherConversationPane = ({
  item,
}: {
  item: ClassroomFeedbackItem;
}) => {
  const createReply = useCreateReviewReplyMutation();
  const [isReplying, setIsReplying] = useState(false);
  const [content, setContent] = useState("");
  const [parentReplyId, setParentReplyId] = useState<string | null>(null);

  const closeComposer = () => {
    setIsReplying(false);
    setContent("");
    setParentReplyId(null);
  };

  const handleSubmitReply = async () => {
    const trimmed = content.trim();
    if (!trimmed || createReply.isPending) return;

    try {
      const response = await createReply.mutateAsync({
        reviewId: item.id,
        payload: {
          content: trimmed,
          parentReplyId,
        },
      });
      closeComposer();
      toast.success(response.message || "Đã gửi phản hồi cho học viên.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <FeedbackReviewPanel
      item={item}
      viewerRole="TEACHER"
      accent="sky"
      parentReplyId={parentReplyId}
      content={content}
      isReplying={isReplying}
      isPending={createReply.isPending}
      onContentChange={setContent}
      onOpenReply={(id) => {
        setParentReplyId(id);
        setIsReplying(true);
      }}
      onCloseReply={closeComposer}
      onSubmit={() => void handleSubmitReply()}
    />
  );
};

const TeacherClassroomFeedbackPage = () => {
  const reduceMotion = useReducedMotion();
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState("");
  const [page, setPage] = useState(0);

  const {
    data: classrooms = [],
    isLoading: isLoadingClassrooms,
    isError: isClassroomsError,
  } = useGetTeacherClassrooms();

  const effectiveClassroomId =
    selectedClassroomId || classrooms[0]?.classroomId || "";

  const {
    data: feedbackData,
    isLoading: isLoadingFeedback,
    isFetching,
    isError: isFeedbackError,
  } = useGetClassroomFeedbackQuery({
    classroomId: effectiveClassroomId || undefined,
    page,
    size: PAGE_SIZE,
  });

  const selectedClassroom = useMemo(
    () =>
      classrooms.find((item) => item.classroomId === effectiveClassroomId) ??
      null,
    [classrooms, effectiveClassroomId],
  );

  const items = feedbackData?.content ?? [];
  const totalElements = feedbackData?.page.totalElements ?? 0;
  const totalPages = Math.max(feedbackData?.page.totalPages ?? 1, 1);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedReviewId("");
      return;
    }
    if (!items.some((item) => item.id === selectedReviewId)) {
      setSelectedReviewId(items[0].id);
    }
  }, [items, selectedReviewId]);

  const selectedItem =
    items.find((item) => item.id === selectedReviewId) ?? null;

  const averageRating = useMemo(() => {
    if (items.length === 0) return null;
    const sum = items.reduce((acc, item) => acc + (item.rating || 0), 0);
    return Number((sum / items.length).toFixed(1));
  }, [items]);

  const handleSelectClass = (classroom: TeacherClassroom) => {
    setSelectedClassroomId(classroom.classroomId);
    setSelectedReviewId("");
    setPage(0);
  };

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_12%_-10%,rgba(56,189,248,0.16),transparent_55%),radial-gradient(ellipse_60%_50%_at_90%_0%,rgba(251,146,60,0.12),transparent_50%),linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#f8fafc_100%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-sky-600 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Feedback học viên
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Feedback theo từng học viên
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Chọn lớp, chọn feedback bên trái rồi đọc đánh giá và phản hồi bên
              phải.
            </p>
          </div>

          {selectedClassroom ? (
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                Đang xem lớp
              </p>
              <p className="font-bold text-slate-900">{selectedClassroom.name}</p>
            </div>
          ) : null}
        </motion.div>

        {isLoadingClassrooms ? (
          <div className="flex h-40 items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải danh sách lớp...
          </div>
        ) : null}

        {isClassroomsError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">
            Không thể tải danh sách lớp học. Vui lòng thử lại sau.
          </div>
        ) : null}

        {!isLoadingClassrooms && !isClassroomsError && classrooms.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-500">
            <GraduationCap className="mb-3 h-5 w-5 text-slate-400" />
            Bạn chưa được gán lớp nào.
          </div>
        ) : null}

        {!isLoadingClassrooms && classrooms.length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {classrooms.map((classroom) => {
                const active = classroom.classroomId === effectiveClassroomId;
                return (
                  <button
                    key={classroom.classroomId}
                    type="button"
                    onClick={() => handleSelectClass(classroom)}
                    className={`cursor-pointer rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-sky-300 bg-sky-50 ring-1 ring-sky-200"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p
                      className={`truncate text-sm font-semibold ${
                        active ? "text-sky-900" : "text-slate-800"
                      }`}
                    >
                      {classroom.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {classroom.code || "Lớp phụ trách"}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
              {isLoadingFeedback ? (
                <div className="flex h-[28rem] items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải feedback...
                </div>
              ) : isFeedbackError ? (
                <div className="flex h-64 items-center justify-center text-sm text-rose-600">
                  Không thể tải feedback của lớp này.
                </div>
              ) : items.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2 px-4 text-center">
                  <MessageSquareHeart className="h-8 w-8 text-slate-300" />
                  <p className="font-medium text-slate-900">Chưa có feedback</p>
                  <p className="text-sm text-slate-500">
                    Học viên chưa gửi đánh giá cho lớp này.
                  </p>
                </div>
              ) : (
                <div
                  className={`grid min-h-[32rem] lg:grid-cols-[20rem_minmax(0,1fr)] ${
                    isFetching ? "opacity-80" : ""
                  }`}
                >
                  <aside className="flex min-h-0 flex-col border-b border-slate-100 lg:border-r lg:border-b-0">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                      <div>
                        <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                          Reviews
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {totalElements} feedback
                        </p>
                      </div>
                      {averageRating ? (
                        <div className="flex items-center gap-1 rounded-xl bg-orange-50 px-2 py-1">
                          <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                          <span className="text-xs font-bold text-slate-800">
                            {averageRating}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
                      {items.map((item) => {
                        const active = item.id === selectedReviewId;
                        const replyCount = countFeedbackReplies(
                          item.replies ?? [],
                        );
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedReviewId(item.id)}
                            className={`w-full cursor-pointer rounded-2xl border px-3 py-3 text-left transition ${
                              active
                                ? "border-sky-300 bg-sky-50"
                                : "border-transparent hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {item.avatar ? (
                                <img
                                  src={item.avatar}
                                  alt={item.studentName}
                                  className="h-9 w-9 shrink-0 rounded-xl object-cover"
                                />
                              ) : (
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-xs font-bold text-slate-600">
                                  {getInitials(item.studentName)}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {item.studentName}
                                  </p>
                                  <RatingStars rating={item.rating} />
                                </div>
                                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                  {item.feedback}
                                </p>
                                <p className="mt-1.5 text-[11px] text-slate-400">
                                  {replyCount} tin ·{" "}
                                  {formatDateTime(item.createdAt)}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {totalPages > 1 ? (
                      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 cursor-pointer"
                          disabled={page <= 0 || isFetching}
                          onClick={() =>
                            setPage((prev) => Math.max(prev - 1, 0))
                          }
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-slate-400">
                          {page + 1}/{totalPages}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 cursor-pointer"
                          disabled={page >= totalPages - 1 || isFetching}
                          onClick={() =>
                            setPage((prev) =>
                              Math.min(prev + 1, totalPages - 1),
                            )
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </aside>

                  <section className="min-h-[28rem] min-w-0 lg:h-[min(40rem,70vh)]">
                    <AnimatePresence mode="wait">
                      {selectedItem ? (
                        <motion.div
                          key={selectedItem.id}
                          initial={reduceMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-full"
                        >
                          <TeacherConversationPane item={selectedItem} />
                        </motion.div>
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                          Chọn một feedback bên trái để xem chi tiết.
                        </div>
                      )}
                    </AnimatePresence>
                  </section>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TeacherClassroomFeedbackPage;
