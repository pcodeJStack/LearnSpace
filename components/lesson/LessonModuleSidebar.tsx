"use client";

import { useEffect, useState } from "react";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import {
  HiClipboardDocumentCheck,
  HiMiniDocumentChartBar,
  HiVideoCamera,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";
import type { LessonContentTab } from "./LessonContentTabBar";

export type LessonSidebarQuiz = {
  quizId: string;
  title: string;
};

export type LessonSidebarSession = {
  id: string;
  title: string;
  lessonOrder?: number;
  hasMaterials: boolean;
  hasPreviewVideo: boolean;
  hasReplayVideo: boolean;
  hasQuiz: boolean;
  quizzes?: LessonSidebarQuiz[];
};

export type LessonSidebarModule = {
  id: string;
  title: string;
  sessions: LessonSidebarSession[];
};

type SessionChildItem = {
  id: string;
  tab: LessonContentTab;
  label: string;
  quizId: string;
};

type LessonModuleSidebarProps = {
  modules: LessonSidebarModule[];
  activeSessionId: string;
  activeTab: LessonContentTab;
  activeQuizId?: string | null;
  onSelectContent: (
    sessionId: string,
    tab: LessonContentTab,
    quizId?: string,
  ) => void;
  isLoading?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
};

function sessionHasQuizzes(session: LessonSidebarSession) {
  return session.hasQuiz || (session.quizzes?.length ?? 0) > 0;
}

function getSessionChildren(session: LessonSidebarSession): SessionChildItem[] {
  return (session.quizzes ?? []).map((quiz) => ({
    id: `quiz-${quiz.quizId}`,
    tab: "quiz" as const,
    label: quiz.title,
    quizId: quiz.quizId,
  }));
}

function SessionContentIcons({ session }: { session: LessonSidebarSession }) {
  const hasQuizzes = sessionHasQuizzes(session);

  if (
    !session.hasMaterials &&
    !session.hasPreviewVideo &&
    !session.hasReplayVideo &&
    !hasQuizzes
  ) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5 pr-1.5">
      {session.hasMaterials ? (
        <HiMiniDocumentChartBar
          className="h-[18px] w-[18px] text-[#6c5ce7]"
          aria-label="Có tài liệu"
        />
      ) : null}
      {session.hasPreviewVideo ? (
        <HiVideoCamera
          className="h-[18px] w-[18px] text-amber-600"
          aria-label="Có video xem trước"
        />
      ) : null}
      {session.hasReplayVideo ? (
        <HiVideoCamera
          className="h-5 w-5 text-red-600"
          aria-label="Có video xem lại"
        />
      ) : null}
      {hasQuizzes ? (
        <HiClipboardDocumentCheck
          className="h-[18px] w-[18px] text-[#6c5ce7]"
          aria-label="Có bài tập"
        />
      ) : null}
    </div>
  );
}

export function LessonModuleSidebar({
  modules,
  activeSessionId,
  activeTab,
  activeQuizId = null,
  onSelectContent,
  isLoading = false,
  errorMessage,
  emptyMessage = "Chưa có dữ liệu.",
}: LessonModuleSidebarProps) {
  const [expandedSessionIds, setExpandedSessionIds] = useState<Set<string>>(
    () => new Set(activeSessionId ? [activeSessionId] : []),
  );

  useEffect(() => {
    if (!activeSessionId) return;
    setExpandedSessionIds((prev) => {
      if (prev.has(activeSessionId)) return prev;
      const next = new Set(prev);
      next.add(activeSessionId);
      return next;
    });
  }, [activeSessionId]);

  const toggleExpanded = (sessionId: string) => {
    setExpandedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải dữ liệu...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
        {errorMessage}
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#ebe7ff] bg-white/80 px-4 py-8 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="mb-4 flex items-center gap-2 px-1">
        <BookOpen className="h-4 w-4 text-[#6c5ce7]" />
        <p className="text-xs font-semibold tracking-wide text-[#6c5ce7] uppercase">
          Chương trình học
        </p>
      </div>

      <div className="relative">
        <div className="absolute top-3 bottom-3 left-[15px] w-px bg-slate-200" />

        <div className="space-y-5">
          {modules.map((courseModule, moduleIndex) => (
            <div key={courseModule.id} className="relative pl-10">
              <div className="absolute top-1 left-0 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#6c5ce7] bg-white shadow-[0_6px_16px_rgba(108,92,231,0.18)]">
                <span className="text-[11px] font-bold text-[#6c5ce7]">
                  {moduleIndex + 1}
                </span>
              </div>

              <div className="pb-2 pt-0.5">
                <p className="text-sm font-semibold leading-snug text-slate-900">
                  {courseModule.title}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {courseModule.sessions.length} buổi học
                </p>
              </div>

              <div className="relative space-y-1.5 pl-1">
                {courseModule.sessions.map((session, sessionIndex) => {
                  const isActiveSession = session.id === activeSessionId;
                  const isExpanded = expandedSessionIds.has(session.id);
                  const orderLabel = session.lessonOrder ?? sessionIndex + 1;
                  const children = getSessionChildren(session);
                  const hasQuizzes = sessionHasQuizzes(session);
                  const hasQuizChildren = children.length > 0;

                  return (
                    <div key={session.id} className="space-y-0.5">
                      <div
                        className={cn(
                          "group relative flex w-full items-center gap-1 rounded-xl transition",
                          isActiveSession
                            ? "bg-[rgba(108,92,231,0.06)] ring-1 ring-[rgba(108,92,231,0.14)]"
                            : "hover:bg-slate-50",
                        )}
                      >
                        <span className="absolute top-5 -left-3 h-px w-3 bg-[#c4b5fd]/50" />

                        {hasQuizChildren ? (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(session.id)}
                            aria-expanded={isExpanded}
                            aria-label={
                              isExpanded
                                ? `Thu gọn quiz buổi ${orderLabel}`
                                : `Mở quiz buổi ${orderLabel}`
                            }
                            className={cn(
                              "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#6c5ce7]/10 hover:text-[#6c5ce7]",
                              isExpanded && "text-[#6c5ce7]",
                            )}
                          >
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 transition-transform duration-200",
                                isExpanded && "rotate-90",
                              )}
                            />
                          </button>
                        ) : (
                          <span className="h-8 w-8 shrink-0" aria-hidden />
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (hasQuizzes) {
                              if (hasQuizChildren && !isExpanded) {
                                toggleExpanded(session.id);
                              }
                              onSelectContent(session.id, "quiz");
                            } else {
                              onSelectContent(session.id, "materials");
                            }
                          }}
                          className="flex min-h-9 min-w-0 flex-1 cursor-pointer items-center gap-2 py-1.5 pr-1 text-left"
                        >
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold",
                              isActiveSession
                                ? "bg-[#6c5ce7] text-white shadow-[0_4px_12px_rgba(108,92,231,0.28)]"
                                : "bg-slate-100 text-slate-500 group-hover:bg-[#6c5ce7]/12 group-hover:text-[#6c5ce7]",
                            )}
                          >
                            {orderLabel}
                          </span>
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-sm leading-snug",
                              isActiveSession
                                ? "font-semibold text-slate-900"
                                : "font-medium text-slate-700",
                            )}
                          >
                            {session.title}
                          </span>
                        </button>
                        <SessionContentIcons session={session} />
                      </div>

                      {isExpanded && hasQuizChildren ? (
                        <div className="ml-3 space-y-0.5 border-l border-slate-200 py-0.5 pl-2">
                          {children.map((child) => {
                            const isActiveChild =
                              isActiveSession &&
                              activeTab === "quiz" &&
                              activeQuizId === child.quizId;

                            return (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() =>
                                  onSelectContent(
                                    session.id,
                                    child.tab,
                                    child.quizId,
                                  )
                                }
                                className={cn(
                                  "flex min-h-7 w-full cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-left text-xs leading-snug transition",
                                  isActiveChild
                                    ? "bg-[#6c5ce7] font-semibold text-white shadow-[0_8px_18px_rgba(108,92,231,0.22)]"
                                    : "text-slate-600 hover:bg-slate-50",
                                )}
                              >
                                <HiClipboardDocumentCheck
                                  className={cn(
                                    "h-3 w-3 shrink-0",
                                    isActiveChild
                                      ? "text-white"
                                      : "text-[#6c5ce7]",
                                  )}
                                />
                                <span className="min-w-0 flex-1 truncate">
                                  {child.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
