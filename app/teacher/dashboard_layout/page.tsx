"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  MessageSquareHeart,
  MonitorPlay,
  Sparkles,
  Upload,
  Video,
} from "lucide-react";

import { useGetTeacherClassrooms } from "@/app/hooks/teacher/useGetTeacherClassrooms";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useLogout } from "@/hooks/useLogout";
import VideoDocumentManagement from "../video-document/page";
import TeacherProfilePage from "../profile/page";
import TeacherChangePasswordPage from "../change-password/page";
import TeacherQuestionBankPage from "../question-bank/page";
import TeacherClassroomFeedbackPage from "../classroom_feedback/page";
import {
  teacherMenuGroups,
  teacherMenuLabels,
  teacherSidebarBranding,
  type TeacherMenuKey,
} from "../sidebarItems";

const contentMenuAliases = new Set([
  "content",
  "menu",
  "records",
  "lessonResources",
]);

const workflowSteps = [
  {
    step: "01",
    title: "Chọn lớp học",
    description: "Chọn lớp bạn đang phụ trách từ danh sách.",
  },
  {
    step: "02",
    title: "Chọn buổi học",
    description: "Mở chủ đề và chọn buổi cần cập nhật nội dung.",
  },
  {
    step: "03",
    title: "Upload video",
    description: "Tải bản ghi buổi học lên hệ thống.",
  },
  {
    step: "04",
    title: "Thêm tài liệu",
    description: "Đính kèm file hoặc liên kết cho học viên.",
  },
];

const TeacherDashboardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const logoutMutation = useLogout();
  const { data: classrooms = [], isLoading: isClassroomsLoading } =
    useGetTeacherClassrooms();

  const activeMenu = useMemo<TeacherMenuKey>(() => {
    const menuParam = searchParams.get("menu");
    if (menuParam && contentMenuAliases.has(menuParam)) {
      return "content";
    }

    const validKeys = Object.keys(teacherMenuLabels) as TeacherMenuKey[];
    if (menuParam && validKeys.includes(menuParam as TeacherMenuKey)) {
      return menuParam as TeacherMenuKey;
    }

    return "overview";
  }, [searchParams]);

  const handleMenuChange = (key: TeacherMenuKey | "logout") => {
    if (key === "logout") {
      logoutMutation.mutate();
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("menu", key);

    if (key === "overview") {
      params.delete("lessonId");
      params.delete("snapLessonId");
      params.delete("lessonTitle");
      params.delete("classTitle");
      params.delete("classId");
    }

    router.push(`/teacher/dashboard_layout?${params.toString()}`);
  };

  const totalClasses = classrooms.length;

  return (
    <div className="flex min-h-screen bg-[#f3f5f9]">
      <DashboardSidebar
        groups={teacherMenuGroups}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
        onLogout={() => logoutMutation.mutate()}
        isLogoutPending={logoutMutation.isPending}
        branding={teacherSidebarBranding}
      />

      <main className="m-4 flex min-h-[calc(100vh-2rem)] min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
       

        <div className="relative min-h-0 flex-1 overflow-hidden">
          {activeMenu === "overview" && (
            <div className="relative h-full overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[length:32px_32px]" />

              <div className="relative mx-auto max-w-5xl space-y-10">
                <section className="space-y-5 border-b border-slate-200 pb-8">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-sky-600 uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    Không gian giảng dạy
                  </span>
                  <div className="h-px w-full max-w-[120px] bg-gradient-to-r from-sky-400 to-transparent" />
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-xl space-y-2">
                      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        Quản lý nội dung lớp học
                      </h2>
                      <p className="text-sm leading-relaxed text-slate-500">
                        Upload video bài giảng và tài liệu buổi học cho các
                        lớp bạn đang phụ trách.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="h-10 shrink-0 cursor-pointer gap-2 rounded-none border-b-2 border-slate-900 px-0 text-slate-900 hover:bg-transparent hover:text-slate-700"
                      onClick={() => handleMenuChange("content")}
                    >
                      Vào quản lý nội dung
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </section>

                <section className="flex flex-col divide-y divide-slate-200 border-y border-slate-200 sm:flex-row sm:divide-x sm:divide-y-0">
                  {[
                    {
                      label: "Lớp phụ trách",
                      value: isClassroomsLoading ? "—" : totalClasses,
                      hint: "Lớp đang được gán",
                      icon: GraduationCap,
                    },
                    {
                      label: "Nội dung",
                      value: "Video & Tài liệu",
                      hint: "Upload và quản lý buổi học",
                      icon: MonitorPlay,
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="flex flex-1 items-center gap-4 py-6 sm:px-8 sm:first:pl-0 sm:last:pr-0"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                            {stat.label}
                          </p>
                          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            {stat.value}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {stat.hint}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </section>

                <section>
                  <div className="mb-6 space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Quy trình cập nhật buổi học
                    </h3>
                    <div className="h-px w-full max-w-[80px] bg-gradient-to-r from-sky-400/70 to-transparent" />
                    <p className="text-sm text-slate-500">
                      Thực hiện theo thứ tự để hoàn thiện nội dung cho học viên.
                    </p>
                  </div>

                  <div className="relative mx-auto max-w-3xl">
                    <div className="absolute top-3 bottom-3 left-[15px] w-px bg-gradient-to-b from-sky-400/70 via-sky-400/30 to-transparent sm:left-[19px]" />

                    <div className="space-y-8">
                      {workflowSteps.map((step) => (
                        <button
                          key={step.step}
                          type="button"
                          onClick={() => handleMenuChange("content")}
                          className="group relative flex w-full cursor-pointer gap-5 text-left sm:gap-6"
                        >
                          <div className="relative z-10 flex shrink-0 flex-col items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-sky-400/50 bg-white text-xs font-bold text-sky-600 shadow-sm transition group-hover:border-sky-500 group-hover:bg-sky-50 sm:h-10 sm:w-10">
                              {step.step}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 border-b border-slate-100 pb-6 group-last:border-b-0 group-hover:border-slate-200">
                            <div className="mb-2 h-px w-full max-w-[100px] bg-gradient-to-r from-slate-300 to-transparent transition group-hover:from-sky-400/60" />
                            <p className="font-semibold text-slate-900 transition group-hover:text-sky-700">
                              {step.title}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                              {step.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section>
                  <div className="mb-5 space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Truy cập nhanh
                    </h3>
                    <div className="h-px w-full max-w-[80px] bg-gradient-to-r from-slate-300 to-transparent" />
                  </div>

                  <div className="divide-y divide-slate-200 border-t border-slate-200">
                    {[
                      {
                        title: "Upload video bài giảng",
                        description:
                          "Tải bản ghi buổi học và xem lại video đã lưu.",
                        icon: Video,
                        lineColor: "bg-sky-400",
                        menu: "content" as const,
                      },
                      {
                        title: "Tài liệu buổi học",
                        description:
                          "Thêm file hoặc liên kết tài liệu cho từng buổi.",
                        icon: BookOpen,
                        lineColor: "bg-amber-400",
                        menu: "content" as const,
                      },
                      {
                        title: "Feedback học viên",
                        description:
                          "Xem rating và nhận xét theo từng lớp phụ trách.",
                        icon: MessageSquareHeart,
                        lineColor: "bg-rose-400",
                        menu: "feedback" as const,
                      },
                      {
                        title: "Quản lý theo lớp",
                        description:
                          "Chọn lớp, chủ đề và buổi học từ một giao diện.",
                        icon: Upload,
                        lineColor: "bg-violet-400",
                        menu: "content" as const,
                      },
                    ].map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.title}
                          type="button"
                          onClick={() => handleMenuChange(action.menu)}
                          className="group flex w-full cursor-pointer items-center gap-4 py-5 text-left transition hover:bg-slate-50/80 sm:gap-5"
                        >
                          <div
                            className={`h-10 w-1 shrink-0 rounded-full ${action.lineColor} opacity-70 transition group-hover:opacity-100`}
                          />
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition group-hover:border-slate-300 group-hover:text-slate-900">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900">
                              {action.title}
                            </p>
                            <p className="mt-0.5 text-sm text-slate-500">
                              {action.description}
                            </p>
                          </div>
                          <ArrowRight className="mr-2 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeMenu === "content" && (
            <div className="relative h-full min-h-0">
              <VideoDocumentManagement />
            </div>
          )}

          {activeMenu === "questionBank" && (
            <div className="relative h-full min-h-0">
              <TeacherQuestionBankPage />
            </div>
          )}

          {activeMenu === "feedback" && (
            <div className="relative h-full min-h-0">
              <TeacherClassroomFeedbackPage />
            </div>
          )}

          {activeMenu === "profile" && (
            <div className="relative h-full min-h-0">
              <TeacherProfilePage />
            </div>
          )}

          {activeMenu === "password" && (
            <div className="relative h-full min-h-0">
              <TeacherChangePasswordPage />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default function TeacherDashboardLayout() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f3f5f9] text-sm text-slate-500">
          Đang tải dashboard...
        </div>
      }
    >
      <TeacherDashboardContent />
    </Suspense>
  );
}
