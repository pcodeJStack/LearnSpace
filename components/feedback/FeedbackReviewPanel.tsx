"use client";

import { Loader2, MessageSquareText, Reply, SendHorizontal, Star } from "lucide-react";

import type {
  ClassroomFeedbackItem,
  ClassroomFeedbackReply,
} from "@/app/service/feedback.service";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type FeedbackViewerRole = "TEACHER" | "STUDENT";
export type FeedbackReplyAccent = "sky" | "violet";

const accentMap: Record<
  FeedbackReplyAccent,
  {
    reviewWash: string;
    reviewBorder: string;
    teacherWash: string;
    teacherBorder: string;
    studentWash: string;
    studentBorder: string;
    replyBtn: string;
    sendBtn: string;
    active: string;
    badgeTeacher: string;
    badgeStudent: string;
  }
> = {
  sky: {
    reviewWash: "from-sky-50/80 to-orange-50/40",
    reviewBorder: "border-sky-100",
    teacherWash: "bg-sky-50/80",
    teacherBorder: "border-sky-100",
    studentWash: "bg-slate-50",
    studentBorder: "border-slate-100",
    replyBtn: "text-sky-700 hover:bg-sky-50",
    sendBtn: "bg-sky-600 hover:bg-sky-700",
    active: "ring-2 ring-sky-200",
    badgeTeacher: "bg-sky-100 text-sky-700",
    badgeStudent: "bg-slate-100 text-slate-600",
  },
  violet: {
    reviewWash: "from-orange-50/80 to-violet-50/40",
    reviewBorder: "border-orange-100",
    teacherWash: "bg-violet-50/80",
    teacherBorder: "border-violet-100",
    studentWash: "bg-slate-50",
    studentBorder: "border-slate-100",
    replyBtn: "text-violet-700 hover:bg-violet-50",
    sendBtn: "bg-violet-600 hover:bg-violet-700",
    active: "ring-2 ring-violet-200",
    badgeTeacher: "bg-violet-100 text-violet-700",
    badgeStudent: "bg-slate-100 text-slate-600",
  },
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

export const countFeedbackReplies = (
  replies: ClassroomFeedbackReply[] = [],
): number =>
  replies.reduce(
    (total, reply) => total + 1 + countFeedbackReplies(reply.children ?? []),
    0,
  );

export const findFeedbackReplyById = (
  replies: ClassroomFeedbackReply[] = [],
  replyId: string,
): ClassroomFeedbackReply | null => {
  for (const reply of replies) {
    if (reply.id === replyId) return reply;
    const nested = findFeedbackReplyById(reply.children ?? [], replyId);
    if (nested) return nested;
  }
  return null;
};

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} sao`}>
    {[1, 2, 3, 4, 5].map((value) => (
      <Star
        key={value}
        className={`h-4 w-4 ${
          value <= rating
            ? "fill-orange-400 text-orange-400"
            : "text-slate-300"
        }`}
      />
    ))}
  </div>
);

type ComposerProps = {
  accent: FeedbackReplyAccent;
  content: string;
  placeholder: string;
  isPending: boolean;
  canSubmit: boolean;
  onContentChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  hint?: string;
};

const InlineComposer = ({
  accent,
  content,
  placeholder,
  isPending,
  canSubmit,
  onContentChange,
  onCancel,
  onSubmit,
  hint,
}: ComposerProps) => {
  const styles = accentMap[accent];
  const trimmed = content.trim();

  return (
    <div className="mt-3 space-y-2.5 rounded-xl border border-slate-200 bg-white p-3">
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      <Textarea
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        placeholder={placeholder}
        className="max-h-36 min-h-20 w-full resize-y rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:bg-white"
        maxLength={1000}
        autoFocus
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-400">{trimmed.length}/1000</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 cursor-pointer rounded-xl"
            disabled={isPending}
            onClick={onCancel}
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            className={`h-8 cursor-pointer gap-1.5 rounded-xl text-white ${styles.sendBtn}`}
            disabled={!canSubmit}
            onClick={onSubmit}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <SendHorizontal className="h-3.5 w-3.5" />
                Gửi phản hồi
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

type CommentProps = {
  reply: ClassroomFeedbackReply;
  viewerRole: FeedbackViewerRole;
  accent: FeedbackReplyAccent;
  depth?: number;
  activeParentId: string | null;
  isReplying: boolean;
  content: string;
  isPending: boolean;
  onOpenReply: (parentReplyId: string) => void;
  onContentChange: (value: string) => void;
  onCloseReply: () => void;
  onSubmit: () => void;
};

const FeedbackComment = ({
  reply,
  viewerRole,
  accent,
  depth = 0,
  activeParentId,
  isReplying,
  content,
  isPending,
  onOpenReply,
  onContentChange,
  onCloseReply,
  onSubmit,
}: CommentProps) => {
  const styles = accentMap[accent];
  const isTeacher = reply.type === "TEACHER";
  const canReply =
    (viewerRole === "TEACHER" && reply.type === "STUDENT") ||
    (viewerRole === "STUDENT" && reply.type === "TEACHER");
  const isActive = isReplying && activeParentId === reply.id;
  const children = reply.children ?? [];

  return (
    <div className="w-full min-w-0">
      <div
        className={`rounded-2xl border px-3.5 py-3 ${
          isTeacher
            ? `${styles.teacherBorder} ${styles.teacherWash}`
            : `${styles.studentBorder} ${styles.studentWash}`
        } ${isActive ? styles.active : ""}`}
      >
        <div className="flex min-w-0 items-start gap-3">
          {reply.avatar ? (
            <img
              src={reply.avatar}
              alt={reply.authorName}
              className="h-9 w-9 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${
                isTeacher ? "bg-sky-500" : "bg-slate-400"
              }`}
            >
              {getInitials(reply.authorName)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-sm font-semibold text-slate-900">
                {reply.authorName}
              </p>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                  isTeacher ? styles.badgeTeacher : styles.badgeStudent
                }`}
              >
                {isTeacher ? "Giảng viên" : "Học viên"}
              </span>
              <span className="text-[11px] text-slate-400">
                {formatDateTime(reply.createdAt)}
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-slate-700">
              {reply.content}
            </p>

            {isActive ? (
              <InlineComposer
                accent={accent}
                content={content}
                placeholder={`Phản hồi tới ${reply.authorName}...`}
                isPending={isPending}
                canSubmit={Boolean(content.trim()) && !isPending}
                onContentChange={onContentChange}
                onCancel={onCloseReply}
                onSubmit={onSubmit}
                hint={`Đang phản hồi ${reply.authorName}`}
              />
            ) : canReply ? (
              <button
                type="button"
                onClick={() => onOpenReply(reply.id)}
                className={`mt-2 inline-flex cursor-pointer items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-medium transition ${styles.replyBtn}`}
              >
                <Reply className="h-3 w-3" />
                Phản hồi
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {children.length > 0 ? (
        <div
          className={`mt-2 space-y-2 ${
            depth === 0 ? "border-l border-slate-200 pl-3 sm:pl-4" : "pl-2"
          }`}
        >
          {children.map((child) => (
            <FeedbackComment
              key={child.id}
              reply={child}
              viewerRole={viewerRole}
              accent={accent}
              depth={depth + 1}
              activeParentId={activeParentId}
              isReplying={isReplying}
              content={content}
              isPending={isPending}
              onOpenReply={onOpenReply}
              onContentChange={onContentChange}
              onCloseReply={onCloseReply}
              onSubmit={onSubmit}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

type FeedbackReviewPanelProps = {
  item: ClassroomFeedbackItem;
  viewerRole: FeedbackViewerRole;
  accent?: FeedbackReplyAccent;
  parentReplyId: string | null;
  content: string;
  isReplying: boolean;
  isPending?: boolean;
  onContentChange: (value: string) => void;
  onOpenReply: (parentReplyId: string | null) => void;
  onCloseReply: () => void;
  onSubmit: () => void;
};

/** Panel dạng review + phản hồi (không phải chat). */
export const FeedbackReviewPanel = ({
  item,
  viewerRole,
  accent = "sky",
  parentReplyId,
  content,
  isReplying,
  isPending = false,
  onContentChange,
  onOpenReply,
  onCloseReply,
  onSubmit,
}: FeedbackReviewPanelProps) => {
  const styles = accentMap[accent];
  const replies = item.replies ?? [];
  const replyCount = countFeedbackReplies(replies);
  const isReplyingToReview = isReplying && parentReplyId === null;
  const trimmed = content.trim();
  const canSubmit =
    Boolean(trimmed) &&
    !isPending &&
    (viewerRole === "TEACHER" || Boolean(parentReplyId));

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-5">
        <article
          className={`rounded-3xl border bg-linear-to-br p-4 sm:p-5 ${styles.reviewBorder} ${styles.reviewWash}`}
        >
          <div className="flex items-start gap-3">
            {item.avatar ? (
              <img
                src={item.avatar}
                alt={item.studentName}
                className="h-12 w-12 shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-sm font-bold text-slate-600">
                {getInitials(item.studentName)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                    Feedback học viên
                  </p>
                  <h3 className="mt-0.5 truncate text-lg font-bold text-slate-900">
                    {item.studentName}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <RatingStars rating={item.rating} />
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {item.rating}/5
                  </p>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap wrap-break-word text-sm leading-7 text-slate-700">
                {item.feedback}
              </p>

              {viewerRole === "TEACHER" ? (
                isReplyingToReview ? (
                  <InlineComposer
                    accent={accent}
                    content={content}
                    placeholder={`Phản hồi tới ${item.studentName}...`}
                    isPending={isPending}
                    canSubmit={canSubmit}
                    onContentChange={onContentChange}
                    onCancel={onCloseReply}
                    onSubmit={onSubmit}
                    hint="Đang phản hồi trực tiếp vào feedback"
                  />
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`mt-3 h-8 cursor-pointer gap-1.5 px-2 ${styles.replyBtn}`}
                    onClick={() => onOpenReply(null)}
                  >
                    <Reply className="h-3.5 w-3.5" />
                    Phản hồi feedback
                  </Button>
                )
              ) : null}
            </div>
          </div>
        </article>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-slate-400" />
              <h4 className="text-sm font-bold text-slate-900">Phản hồi</h4>
            </div>
            <span className="text-xs text-slate-400">{replyCount} phản hồi</span>
          </div>

          {replies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-800">
                Chưa có phản hồi
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {viewerRole === "TEACHER"
                  ? "Hãy phản hồi feedback của học viên ở trên."
                  : "Khi giảng viên phản hồi, nội dung sẽ hiện tại đây."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {replies.map((reply) => (
                <FeedbackComment
                  key={reply.id}
                  reply={reply}
                  viewerRole={viewerRole}
                  accent={accent}
                  activeParentId={parentReplyId}
                  isReplying={isReplying}
                  content={content}
                  isPending={isPending}
                  onOpenReply={(id) => onOpenReply(id)}
                  onContentChange={onContentChange}
                  onCloseReply={onCloseReply}
                  onSubmit={onSubmit}
                />
              ))}
            </div>
          )}

          {viewerRole === "STUDENT" &&
          replies.length > 0 &&
          !isReplying ? (
            <p className="text-xs text-slate-400">
              Bấm Phản hồi trên ý kiến của giảng viên để tiếp tục trao đổi.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
};

/** @deprecated dùng FeedbackReviewPanel */
export const FeedbackChatPanel = FeedbackReviewPanel;
