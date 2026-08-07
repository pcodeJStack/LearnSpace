"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  GraduationCap,
  Loader2,
  MessageSquareHeart,
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
import { useAuthStore } from "@/app/store/auth.store";
import {
  FeedbackReviewPanel,
  countFeedbackReplies,
} from "@/components/feedback/FeedbackReviewPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const normalizeName = (name: string) => name.trim().toLowerCase();

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
        className={`h-3.5 w-3.5 ${
          value <= rating
            ? "fill-orange-400 text-orange-400"
            : "text-slate-300"
        }`}
      />
    ))}
  </div>
);

const FeedbackComposeForm = ({
  reduceMotion,
  teacherId,
  displayRating,
  rating,
  feedback,
  feedbackLength,
  justSubmitted,
  canSubmit,
  isPending,
  onHoverRating,
  onSetRating,
  onSetFeedback,
  onSubmit,
}: {
  reduceMotion: boolean | null;
  teacherId: string | null;
  displayRating: number;
  rating: number;
  feedback: string;
  feedbackLength: number;
  justSubmitted: boolean;
  canSubmit: boolean;
  isPending: boolean;
  onHoverRating: (value: number) => void;
  onSetRating: (value: number) => void;
  onSetFeedback: (value: string) => void;
  onSubmit: () => void;
}) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
          Mức hài lòng
        </p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">Chọn số sao</h3>
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
                  whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.92 }}
                  className="cursor-pointer rounded-xl p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                  onMouseEnter={() => onHoverRating(value)}
                  onMouseLeave={() => onHoverRating(0)}
                  onFocus={() => onHoverRating(value)}
                  onBlur={() => onHoverRating(0)}
                  onClick={() => onSetRating(value)}
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
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="min-w-35 text-right"
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
            Nội dung
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Feedback của bạn
          </h3>
        </div>
        <p className="text-xs text-slate-400">{feedbackLength} ký tự</p>
      </div>

      <p className="text-xs text-slate-500">
        {rating > 0
          ? ratingHints[rating]
          : "Chọn số sao để nhận gợi ý viết feedback phù hợp."}
      </p>

      <Textarea
        value={feedback}
        onChange={(e) => onSetFeedback(e.target.value)}
        placeholder="Ví dụ: Giảng viên giải thích dễ hiểu, tempo buổi học hợp lý..."
        className="min-h-32 resize-none rounded-2xl border-slate-200 bg-slate-50/70 px-4 py-3 text-sm leading-relaxed shadow-none focus-visible:bg-white"
        disabled={!teacherId}
      />
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <AnimatePresence mode="wait">
        {justSubmitted ? (
          <motion.p
            key="sent"
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
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
        onClick={onSubmit}
        className="h-12 cursor-pointer gap-2 rounded-2xl bg-slate-900 px-6 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
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
  </div>
);

const PeerFeedbackDetail = ({ item }: { item: ClassroomFeedbackItem }) => {
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
    if (!parentReplyId) {
      toast.error("Vui lòng chọn tin nhắn cần trả lời.");
      return;
    }

    try {
      const response = await createReply.mutateAsync({
        reviewId: item.id,
        payload: { content: trimmed, parentReplyId },
      });
      closeComposer();
      toast.success(response.message || "Đã gửi phản hồi.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
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
  );
};

const StudentTeacherFeedbackPage = () => {
  const reduceMotion = useReducedMotion();
  const authUser = useAuthStore((state) => state.user);
  const { data: myClasses = [], isLoading, isError } = useGetMyClassesQuery();
  const submitFeedback = useSubmitTeacherFeedbackMutation();

  const [classroomId, setClassroomId] = useState("");
  const [selectedFeedbackId, setSelectedFeedbackId] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const effectiveClassroomId = classroomId || myClasses[0]?.id || "";

  const selectedClass = useMemo(
    () => myClasses.find((item) => item.id === effectiveClassroomId) ?? null,
    [effectiveClassroomId, myClasses],
  );

  const {
    data: feedbackData,
    isLoading: isLoadingFeedback,
    isFetching: isFetchingFeedback,
    isError: isFeedbackError,
  } = useGetClassroomFeedbackQuery({
    classroomId: effectiveClassroomId || undefined,
    page: 0,
    size: 50,
  });

  const allItems = useMemo(
    () => feedbackData?.content ?? [],
    [feedbackData?.content],
  );
  const myName = normalizeName(authUser?.fullName || "");

  const peerFeedbacks = useMemo(() => {
    if (!myName) return allItems;
    return allItems.filter(
      (item) => normalizeName(item.studentName) !== myName,
    );
  }, [allItems, myName]);

  const hasSubmitted = useMemo(() => {
    if (!myName) return allItems.length > 0;
    return allItems.some(
      (item) => normalizeName(item.studentName) === myName,
    );
  }, [allItems, myName]);

  const selectedItem = useMemo(() => {
    if (peerFeedbacks.length === 0) return null;
    return (
      peerFeedbacks.find((item) => item.id === selectedFeedbackId) ??
      peerFeedbacks[0]
    );
  }, [peerFeedbacks, selectedFeedbackId]);

  const activeFeedbackId = selectedItem?.id ?? "";

  const teacherId = selectedClass?.teacherId || null;
  const teacherName = selectedClass?.teacherName?.trim() || "";
  const displayRating = hoverRating || rating;
  const feedbackLength = feedback.trim().length;

  const canSubmit =
    Boolean(effectiveClassroomId && teacherId && rating > 0 && feedback.trim()) &&
    !submitFeedback.isPending;

  const resetComposeForm = () => {
    setRating(0);
    setHoverRating(0);
    setFeedback("");
    setJustSubmitted(false);
  };

  const handleSelectClass = (classroom: MyClass) => {
    setClassroomId(classroom.id);
    setSelectedFeedbackId("");
    setFeedbackModalOpen(false);
    resetComposeForm();
  };

  const handleSubmit = () => {
    if (!effectiveClassroomId || !teacherId) {
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
        classroomId: effectiveClassroomId,
        rating,
        feedback: trimmed,
      },
      {
        onSuccess: (data) => {
          toast.success(data?.message || "Đã gửi đánh giá giảng viên.");
          resetComposeForm();
          setJustSubmitted(true);
          setFeedbackModalOpen(false);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  };

  const openFeedbackModal = () => {
    resetComposeForm();
    setFeedbackModalOpen(true);
  };

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_12%_-10%,rgba(251,146,60,0.16),transparent_55%),radial-gradient(ellipse_60%_50%_at_90%_0%,rgba(139,92,246,0.12),transparent_50%),linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#f8fafc_100%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-orange-600 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Feedback lớp học
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Feedback từ các học viên khác
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Xem đánh giá của bạn cùng lớp về giảng viên. Bạn cũng có thể gửi
              feedback của riêng mình.
            </p>
          </div>

          {selectedClass ? (
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                Đang xem lớp
              </p>
              <p className="font-bold text-slate-900">{selectedClass.name}</p>
              <p className="text-xs text-slate-500">
                {teacherName || "Chưa có giảng viên"}
              </p>
            </div>
          ) : null}
        </motion.div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white text-sm text-slate-500">
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
            <GraduationCap className="mb-3 h-5 w-5 text-slate-400" />
            Bạn chưa tham gia lớp nào.
          </div>
        ) : null}

        {!isLoading && myClasses.length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myClasses.map((classroom: MyClass) => {
                const active = classroom.id === effectiveClassroomId;
                return (
                  <button
                    key={classroom.id}
                    type="button"
                    onClick={() => handleSelectClass(classroom)}
                    className={`cursor-pointer rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-violet-300 bg-violet-50 ring-1 ring-violet-200"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
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

            {!effectiveClassroomId ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500">
                Chọn một lớp để xem feedback từ các học viên khác.
              </div>
            ) : (
              <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                      Feedback từ học viên 
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {peerFeedbacks.length} feedback trong lớp
                    </p>
                  </div>
                  <Button
                    type="button"
                    className="h-10 cursor-pointer gap-2 rounded-2xl border border-violet-200 bg-violet-50 text-violet-700 shadow-none transition hover:bg-violet-100 hover:text-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={openFeedbackModal}
                    disabled={!teacherId}
                  >
                    Gửi feedback
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {isLoadingFeedback ? (
                  <div className="flex h-72 items-center justify-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải feedback...
                  </div>
                ) : isFeedbackError ? (
                  <div className="px-5 py-10 text-center text-sm text-rose-600">
                    Không thể tải feedback của lớp này.
                  </div>
                ) : peerFeedbacks.length === 0 ? (
                  <div className="flex h-72 flex-col items-center justify-center gap-2 px-4 text-center">
                    <MessageSquareHeart className="h-8 w-8 text-slate-300" />
                    <p className="font-medium text-slate-900">
                      Chưa có feedback từ học viên khác
                    </p>
                    <p className="text-sm text-slate-500">
                      {hasSubmitted
                        ? "Bạn đã gửi feedback. Khi có đánh giá từ bạn cùng lớp, chúng sẽ hiện tại đây."
                        : "Hãy là người đầu tiên gửi feedback cho giảng viên."}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`grid h-[min(40rem,70vh)] min-h-112 lg:grid-cols-[18rem_minmax(0,1fr)] ${
                      isFetchingFeedback ? "opacity-80" : ""
                    }`}
                  >
                    <aside className="flex h-full min-h-0 flex-col border-b border-slate-100 lg:border-r lg:border-b-0">
                      <div
                        className="min-h-0 flex-1 space-y-1 overflow-y-scroll overscroll-y-contain p-2 scrollbar-gutter-stable"
                        onWheel={(event) => event.stopPropagation()}
                      >
                        {peerFeedbacks.map((item) => {
                          const active = item.id === activeFeedbackId;
                          const replyCount = countFeedbackReplies(
                            item.replies ?? [],
                          );
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedFeedbackId(item.id)}
                              className={`w-full cursor-pointer rounded-2xl border px-3 py-3 text-left transition ${
                                active
                                  ? "border-violet-300 bg-violet-50"
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
                                    {replyCount} phản hồi ·{" "}
                                    {formatDateTime(item.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </aside>

                    <section className="h-full min-h-0 min-w-0 overflow-hidden">
                      <AnimatePresence mode="wait">
                        {selectedItem ? (
                          <motion.div
                            key={selectedItem.id}
                            initial={reduceMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full min-h-0"
                          >
                            <PeerFeedbackDetail item={selectedItem} />
                          </motion.div>
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-slate-500">
                            Chọn một feedback từ học viên khác để xem.
                          </div>
                        )}
                      </AnimatePresence>
                    </section>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <Dialog
        open={feedbackModalOpen}
        onOpenChange={(open) => {
          setFeedbackModalOpen(open);
          if (!open) resetComposeForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Gửi feedback</DialogTitle>
          </DialogHeader>
          <FeedbackComposeForm
            reduceMotion={reduceMotion}
            teacherId={teacherId}
            displayRating={displayRating}
            rating={rating}
            feedback={feedback}
            feedbackLength={feedbackLength}
            justSubmitted={justSubmitted}
            canSubmit={canSubmit}
            isPending={submitFeedback.isPending}
            onHoverRating={setHoverRating}
            onSetRating={(value) => {
              setRating(value);
              setJustSubmitted(false);
            }}
            onSetFeedback={(value) => {
              setFeedback(value);
              setJustSubmitted(false);
            }}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentTeacherFeedbackPage;
