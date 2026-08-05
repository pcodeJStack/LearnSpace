"use client";

import {
  Download,
  ExternalLink,
  File,
  FileSpreadsheet,
  FileText,
  Globe,
  Link2,
  Loader2,
  Paperclip,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LessonResourceItem } from "@/app/service/lessonResource.service";
import { cn } from "@/lib/utils";

type LessonMaterialsListProps = {
  lessonTitle?: string;
  resources?: LessonResourceItem[];
  isLoading?: boolean;
  snapLessonId?: string;
};

function getFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split("/").filter(Boolean).pop();
    if (segment) return decodeURIComponent(segment);
  } catch {
    const fallback = url.split("/").filter(Boolean).pop();
    if (fallback) return decodeURIComponent(fallback.split("?")[0] ?? fallback);
  }
  return "Tệp đính kèm";
}

function getUrlVisual(
  url: string,
  type: string,
): { icon: LucideIcon; label: string } {
  if (type === "LINK") {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, "");
      return { icon: Globe, label: hostname || url };
    } catch {
      return { icon: Link2, label: url };
    }
  }

  const fileName = getFileNameFromUrl(url);
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (["xls", "xlsx", "csv"].includes(extension)) {
    return { icon: FileSpreadsheet, label: fileName };
  }
  if (["pdf", "doc", "docx", "ppt", "pptx", "txt"].includes(extension)) {
    return { icon: FileText, label: fileName };
  }
  return { icon: File, label: fileName };
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center px-4 text-center">
      <Paperclip className="mb-3 h-6 w-6 text-[#1e3a5f]/50" />
      <p className="text-base font-bold tracking-tight text-[#0c1e3a]">
        {title}
      </p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}

function MaterialRow({
  resource,
  index,
}: {
  resource: LessonResourceItem;
  index: number;
}) {
  const isLink = resource.type === "LINK";

  return (
    <article className="border-b border-[#0c1e3a]/10 py-5 last:border-b-0">
      <div className="flex items-start gap-4 sm:gap-5">
        <span className="w-8 shrink-0 pt-0.5 text-sm font-bold text-[#1e3a5f]/45">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span
              className={cn(
                "text-[11px] font-bold tracking-[0.12em] uppercase",
                isLink ? "text-[#c2410c]" : "text-[#1e3a5f]",
              )}
            >
              {isLink ? "Link" : "File"}
            </span>
            <h4 className="text-base font-bold tracking-tight text-[#0c1e3a]">
              {resource.title}
            </h4>
          </div>

          {resource.note?.trim() ? (
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              {resource.note.trim()}
            </p>
          ) : null}

          {resource.urls?.length > 0 ? (
            <ul className="mt-3 space-y-0">
              {resource.urls.map((resourceUrl, urlIndex) => {
                const urlVisual = getUrlVisual(resourceUrl, resource.type);
                const UrlIcon = urlVisual.icon;

                return (
                  <li key={`${resource.id}-${urlIndex}`}>
                    <a
                      href={resourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3 border-t border-[#0c1e3a]/6 py-2.5 first:border-t-0 first:pt-1"
                    >
                      <UrlIcon className="h-4 w-4 shrink-0 text-[#1e3a5f]" />
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-600 transition group-hover:text-[#0c1e3a]">
                        {urlVisual.label}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#1e3a5f] transition group-hover:text-[#0c1e3a]">
                        {isLink ? (
                          <>
                            Mở
                            <ExternalLink className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            Tải
                            <Download className="h-3.5 w-3.5" />
                          </>
                        )}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function LessonMaterialsList({
  lessonTitle,
  resources = [],
  isLoading = false,
  snapLessonId,
}: LessonMaterialsListProps) {
  if (!snapLessonId) {
    return (
      <section>
        <header className="mb-2 border-b border-[#0c1e3a]/15 pb-4">
          <p className="text-xs font-bold tracking-[0.16em] text-[#1e3a5f] uppercase">
            Tài liệu buổi học
          </p>
        </header>
        <EmptyState
          title="Chưa chọn buổi học"
          description="Chọn buổi ở sidebar — tài liệu sẽ hiện tại đây."
        />
      </section>
    );
  }

  if (isLoading) {
    return (
      <section>
        <header className="mb-2 border-b border-[#0c1e3a]/15 pb-4">
          <p className="text-xs font-bold tracking-[0.16em] text-[#1e3a5f] uppercase">
            Tài liệu buổi học
          </p>
          {lessonTitle ? (
            <h3 className="mt-1 text-xl font-extrabold tracking-tight text-[#0c1e3a]">
              {lessonTitle}
            </h3>
          ) : null}
        </header>
        <div className="flex min-h-[220px] items-center justify-center gap-3 text-sm font-medium text-[#1e3a5f]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải tài liệu...
        </div>
      </section>
    );
  }

  if (resources.length === 0) {
    return (
      <section>
        <header className="mb-2 border-b border-[#0c1e3a]/15 pb-4">
          <p className="text-xs font-bold tracking-[0.16em] text-[#1e3a5f] uppercase">
            Tài liệu buổi học
          </p>
          <h3 className="mt-1 text-xl font-extrabold tracking-tight text-[#0c1e3a]">
            {lessonTitle || "Tài liệu"}
          </h3>
        </header>
        <EmptyState
          title="Chưa có tài liệu"
          description="Giáo viên chưa đăng tài liệu nào cho buổi học này."
        />
      </section>
    );
  }

  return (
    <section>
      <header className="mb-1 flex flex-wrap items-end justify-between gap-3 border-b border-[#0c1e3a]/15 pb-4">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[#1e3a5f] uppercase">
            Tài liệu buổi học
          </p>
          <h3 className="mt-1 text-xl font-extrabold tracking-tight text-[#0c1e3a]">
            {lessonTitle || "Tài liệu"}
          </h3>
        </div>
        <span className="text-sm font-semibold text-[#1e3a5f]/70">
          {resources.length} mục
        </span>
      </header>

      <div>
        {resources.map((resource, index) => (
          <MaterialRow key={resource.id} resource={resource} index={index} />
        ))}
      </div>
    </section>
  );
}
