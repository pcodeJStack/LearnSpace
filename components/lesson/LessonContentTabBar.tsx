"use client";

import { FileText, ClipboardList, PlayCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type LessonContentTab = "preview" | "replay" | "materials" | "quiz";

type LessonContentTabBarProps = {
  activeTab: LessonContentTab;
  onChange: (tab: LessonContentTab) => void;
  materialsCount?: number;
  quizzesCount?: number;
};

const tabs: {
  key: LessonContentTab;
  label: string;
  shortLabel: string;
  icon: typeof PlayCircle;
}[] = [
  {
    key: "preview",
    label: "Video xem trước",
    shortLabel: "Xem trước",
    icon: Sparkles,
  },
  {
    key: "replay",
    label: "Video xem lại",
    shortLabel: "Xem lại",
    icon: PlayCircle,
  },
  {
    key: "materials",
    label: "Tài liệu buổi học",
    shortLabel: "Tài liệu",
    icon: FileText,
  },
  {
    key: "quiz",
    label: "Bài tập",
    shortLabel: "Bài tập",
    icon: ClipboardList,
  },
];

export function LessonContentTabBar({
  activeTab,
  onChange,
  materialsCount = 0,
  quizzesCount = 0,
}: LessonContentTabBarProps) {
  return (
    <div className="border-b border-slate-200/90 px-4 py-3 sm:px-6">
      <div
        role="tablist"
        aria-label="Nội dung buổi học"
        className="flex w-max min-w-full flex-nowrap items-center justify-end gap-2"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const countLabel =
            tab.key === "materials" && materialsCount > 0
              ? materialsCount
              : tab.key === "quiz" && quizzesCount > 0
                ? quizzesCount
                : null;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={cn(
                "inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold tracking-tight transition-all sm:px-4",
                isActive
                  ? "border-blue-900 bg-blue-900 text-white shadow-md"
                  : "border-blue-200/90 bg-white text-blue-950 hover:border-blue-300 hover:bg-blue-50/80",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-blue-100" : "text-blue-700",
                )}
              />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
              {countLabel !== null ? (
                <span
                  className={cn(
                    "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-800",
                  )}
                >
                  {countLabel}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
