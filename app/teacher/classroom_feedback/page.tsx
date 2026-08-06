"use client";

import { useMemo, useState } from "react";
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

import { useGetClassroomFeedbackQuery } from "@/app/hooks/feedback/useGetClassroomFeedback";
import { useGetTeacherClassrooms } from "@/app/hooks/teacher/useGetTeacherClassrooms";
import type { ClassroomFeedbackItem } from "@/app/service/feedback.service";
import type { TeacherClassroom } from "@/app/service/teacher.service";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;
const ease = [0.22, 1, 0.36, 1] as const;

const ratingLabels: Record<number, string> = {
  1: "Cần cải thiện nhiều",
  2: "Chưa đạt kỳ vọng",
  3: "Ổn, tạm hài lòng",
  4: "Tốt, đáng ghi nhận",
  5: "Xuất sắc, rất ấn tượng",
};

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

const RatingStars = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => (
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

const FeedbackCard = ({ item }: { item: ClassroomFeedbackItem }) => {
  const hasAvatar = Boolean(item.avatar);

  return (
    <article className="border-b border-slate-100 py-5 last:border-b-0">
      <div className="flex items-start gap-3 sm:gap-4">
        {hasAvatar ? (
          <img
            src={item.avatar!}
            alt={item.studentName}
            className="h-11 w-11 shrink-0 rounded-2xl object-cover"
          />
        ) : null}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                {item.studentName}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {formatDateTime(item.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <RatingStars rating={item.rating} />
              <p className="mt-1 text-[11px] text-slate-500">
                {ratingLabels[item.rating] || `${item.rating}/5`}
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {item.feedback}
          </p>
        </div>
      </div>
    </article>
  );
};

const TeacherClassroomFeedbackPage = () => {
  const reduceMotion = useReducedMotion();
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
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

  const averageRating = useMemo(() => {
    if (items.length === 0) return null;
    const sum = items.reduce((acc, item) => acc + (item.rating || 0), 0);
    return Number((sum / items.length).toFixed(1));
  }, [items]);

  const handleSelectClass = (classroom: TeacherClassroom) => {
    setSelectedClassroomId(classroom.classroomId);
    setPage(0);
  };

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_12%_-10%,rgba(56,189,248,0.16),transparent_55%),radial-gradient(ellipse_60%_50%_at_90%_0%,rgba(251,146,60,0.12),transparent_50%),linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#f8fafc_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.025)_1px,transparent_1px)] bg-size-[28px_28px] [mask-image:linear-gradient(180deg,black,transparent_92%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:py-10">
        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="flex flex-col justify-between gap-8 lg:sticky lg:top-8 lg:self-start"
        >
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-sky-600 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Feedback học viên
            </span>

            <div className="space-y-5">
              <h2 className="max-w-md text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                <span className="block leading-[1.15]">Lắng nghe tiếng nói</span>
                <span className="mt-2 block leading-[1.2] bg-linear-to-r from-sky-600 to-orange-500 bg-clip-text text-transparent">
                  từ học viên của bạn
                </span>
              </h2>
              <p className="max-w-sm pt-1 text-sm leading-7 text-slate-500">
                Chọn lớp phụ trách để xem rating và nhận xét — nắm nhanh điểm
                mạnh cùng góp ý cần cải thiện.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                Chọn lớp
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                Xem rating
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Đọc nhận xét
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedClassroom ? (
              <motion.div
                key={selectedClassroom.classroomId}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
                className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm"
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-linear-to-br from-sky-400/25 to-orange-300/20 blur-2xl" />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 to-orange-400 text-lg font-bold text-white">
                    {getInitials(selectedClassroom.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                      Đang xem lớp
                    </p>
                    <p className="truncate text-lg font-bold text-slate-900">
                      {selectedClassroom.name}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {selectedClassroom.code
                        ? `Mã lớp: ${selectedClassroom.code}`
                        : "Feedback học viên"}
                    </p>
                  </div>
                </div>

                <div className="relative mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50/80 px-3 py-3">
                    <p className="text-[10px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                      Tổng feedback
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">
                      {totalElements}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-orange-50/70 px-3 py-3">
                    <p className="text-[10px] font-semibold tracking-[0.12em] text-orange-400/80 uppercase">
                      TB trang này
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <p className="text-2xl font-extrabold text-slate-900">
                        {averageRating ?? "—"}
                      </p>
                      {averageRating ? (
                        <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-class"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border border-dashed border-slate-200 bg-white/40 px-5 py-6 text-sm text-slate-500"
              >
                <GraduationCap className="mb-3 h-5 w-5 text-slate-400" />
                Chọn một lớp ở bên phải để xem feedback học viên.
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
          {isLoadingClassrooms ? (
            <div className="flex h-64 items-center justify-center gap-2 rounded-3xl border border-slate-200/80 bg-white/80 text-sm text-slate-500">
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
              Bạn chưa được gán lớp nào. Khi có lớp phụ trách, feedback sẽ hiện
              tại đây.
            </div>
          ) : null}

          {!isLoadingClassrooms && classrooms.length > 0 ? (
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
                    {classrooms.length} lớp
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {classrooms.map((classroom) => {
                    const active =
                      classroom.classroomId === effectiveClassroomId;
                    return (
                      <button
                        key={classroom.classroomId}
                        type="button"
                        onClick={() => handleSelectClass(classroom)}
                        className={`group relative cursor-pointer overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition duration-300 ${
                          active
                            ? "border-sky-300 bg-sky-50/80 ring-1 ring-sky-200"
                            : "border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        {active ? (
                          <motion.span
                            layoutId={reduceMotion ? undefined : "teacher-class-glow"}
                            className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-sky-500 to-orange-400"
                          />
                        ) : null}
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
              </div>

              <div className="h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent" />

              <div className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                      Bước 02
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                      Danh sách feedback
                    </h3>
                  </div>
                  {averageRating ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50/70 px-3 py-1.5">
                      <RatingStars rating={Math.round(averageRating)} size="md" />
                      <span className="text-sm font-bold text-slate-800">
                        {averageRating}/5
                      </span>
                    </div>
                  ) : null}
                </div>

                <div
                  className={`rounded-2xl border px-4 transition sm:px-5 ${
                    items.length > 0
                      ? "border-sky-100 bg-linear-to-br from-sky-50/50 to-orange-50/30"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  {isLoadingFeedback ? (
                    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tải feedback...
                    </div>
                  ) : isFeedbackError ? (
                    <div className="py-16 text-center text-sm text-rose-600">
                      Không thể tải feedback của lớp này.
                    </div>
                  ) : items.length === 0 ? (
                    <div className="space-y-2 py-16 text-center">
                      <MessageSquareHeart className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="font-medium text-slate-900">
                        Chưa có feedback
                      </p>
                      <p className="text-sm text-slate-500">
                        Học viên chưa gửi đánh giá cho lớp này.
                      </p>
                    </div>
                  ) : (
                    <div className={isFetching ? "opacity-70 transition" : ""}>
                      {items.map((item) => (
                        <FeedbackCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  {totalElements > 0
                    ? `Hiển thị trang ${page + 1}/${totalPages} · ${totalElements} feedback`
                    : "Feedback giúp cải thiện chất lượng giảng dạy."}
                </p>

                {totalPages > 1 ? (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 cursor-pointer rounded-2xl"
                      disabled={page <= 0 || isFetching}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 cursor-pointer rounded-2xl"
                      disabled={page >= totalPages - 1 || isFetching}
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages - 1))
                      }
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </motion.section>
      </div>
    </div>
  );
};

export default TeacherClassroomFeedbackPage;
