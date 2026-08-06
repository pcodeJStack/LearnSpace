"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useLogout } from "@/hooks/useLogout";
import ClassContentManagement from "../class_content/page";
import ScheduleStudent from "../schedule_student/page";
import StudentProfilePage from "../profile/page";
import StudentChangePasswordPage from "../change-password/page";
import StudentTeacherFeedbackPage from "../teacher_feedback/page";
import {
  studentMenuGroups,
  studentMenuLabels,
  studentSidebarBranding,
  type StudentMenuKey,
} from "../sidebarItems";

const contentMenuAliases = new Set(["content", "menu"]);

const workflowSteps = [
  {
    step: "01",
    title: "Tham gia lớp học",
    description: "Nhập mã lớp do giáo viên cung cấp.",
  },
  {
    step: "02",
    title: "Chọn lớp đang học",
    description: "Chuyển giữa các lớp bạn đã tham gia.",
  },
  {
    step: "03",
    title: "Chọn buổi học",
    description: "Mở chủ đề và chọn buổi cần xem.",
  },
  {
    step: "04",
    title: "Xem video & tài liệu",
    description: "Xem lại bài giảng và tải học liệu.",
  },
];

const StudentDashboardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const logoutMutation = useLogout();

  const activeMenu = useMemo<StudentMenuKey>(() => {
    const menuParam = searchParams.get("menu");
    if (menuParam && contentMenuAliases.has(menuParam)) {
      return "content";
    }

    const validKeys = Object.keys(studentMenuLabels) as StudentMenuKey[];
    if (menuParam && validKeys.includes(menuParam as StudentMenuKey)) {
      return menuParam as StudentMenuKey;
    }

    return "overview";
  }, [searchParams]);

  const handleMenuChange = (key: StudentMenuKey | "logout") => {
    if (key === "logout") {
      logoutMutation.mutate();
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("menu", key);
    router.push(`/student/dashboard_layout?${params.toString()}`);
  };

  return (
    <div className="flex h-screen w-full overflow-y-hidden bg-[#f4f2f8]">
      <DashboardSidebar
        groups={studentMenuGroups}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
        onLogout={() => logoutMutation.mutate()}
        isLogoutPending={logoutMutation.isPending}
        branding={studentSidebarBranding}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4 pl-3">
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-[#ebe7ff]/80 bg-[#faf9fc] shadow-[0_12px_40px_rgba(108,92,231,0.06)]">
          <div className="absolute inset-0 min-h-0 min-w-0 overflow-hidden">
            {activeMenu === "overview" && (
              <div className="relative h-full overflow-y-auto overflow-x-hidden">
                <div
                  className="pointer-events-none absolute inset-0"
                  aria-hidden
                >
                  <div className="absolute -top-24 -left-20 h-[420px] w-[420px] rounded-full bg-[#6c5ce7]/12 blur-3xl" />
                  <div className="absolute top-1/3 -right-16 h-[360px] w-[360px] rounded-full bg-[#a78bfa]/18 blur-3xl" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.85),_transparent_55%)]" />
                </div>

                <div className="relative mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center gap-14 px-6 py-10 sm:px-10 lg:py-14">
                  <section className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both">
                    <p className="text-sm font-semibold tracking-wide text-[#6c5ce7]">
                      Tổng quan
                    </p>
                    <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                      Học tập theo lớp & buổi học
                    </h2>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-500">
                      Xem video bài giảng và tài liệu buổi học từ các lớp bạn
                      đã tham gia.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <Button
                        className="h-12 cursor-pointer gap-2 rounded-2xl bg-[#6c5ce7] px-6 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(108,92,231,0.28)] transition hover:bg-[#5b4bd1] hover:shadow-[0_16px_34px_rgba(108,92,231,0.34)]"
                        onClick={() => handleMenuChange("content")}
                      >
                        Vào nội dung học tập
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-12 cursor-pointer rounded-2xl px-5 text-sm font-semibold text-[#6c5ce7] hover:bg-[#ebe7ff]/70 hover:text-[#5b4bd1]"
                        onClick={() => handleMenuChange("schedule")}
                      >
                        Xem lịch học
                      </Button>
                    </div>
                  </section>

                  <section className="animate-in fade-in slide-in-from-bottom-4 delay-100 duration-500 fill-mode-both">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-slate-900">
                        Quy trình học tập
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        4 bước để truy cập nội dung buổi học
                      </p>
                    </div>

                    <ol className="relative grid gap-0 sm:grid-cols-2 xl:grid-cols-4">
                      {workflowSteps.map((step, index) => (
                        <li key={step.step} className="relative">
                          {index < workflowSteps.length - 1 ? (
                            <span
                              className="pointer-events-none absolute top-5 left-[2.75rem] right-0 hidden h-px bg-linear-to-r from-[#c4b5fd] to-transparent xl:block"
                              aria-hidden
                            />
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleMenuChange("content")}
                            className="group flex w-full cursor-pointer flex-col items-start gap-3 rounded-2xl p-3 text-left transition hover:bg-white/60"
                          >
                            <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#6c5ce7] text-xs font-bold text-white shadow-[0_8px_20px_rgba(108,92,231,0.3)] transition group-hover:scale-105">
                              {step.step}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {step.title}
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                {step.description}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>
              </div>
            )}

            {activeMenu === "content" && (
              <div className="h-full min-h-0 overflow-hidden">
                <ClassContentManagement />
              </div>
            )}

            {activeMenu === "schedule" && (
              <div className="h-full min-h-0 overflow-hidden">
                <ScheduleStudent />
              </div>
            )}

            {activeMenu === "feedback" && (
              <div className="h-full min-h-0 overflow-hidden">
                <StudentTeacherFeedbackPage />
              </div>
            )}

            {activeMenu === "profile" && (
              <div className="h-full min-h-0 overflow-hidden">
                <StudentProfilePage />
              </div>
            )}

            {activeMenu === "password" && (
              <div className="h-full min-h-0 overflow-hidden">
                <StudentChangePasswordPage />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function StudentDashboardLayout() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f2f8] text-sm text-slate-500">
          Đang tải dashboard...
        </div>
      }
    >
      <StudentDashboardContent />
    </Suspense>
  );
}
