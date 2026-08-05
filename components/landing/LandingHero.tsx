import Link from "next/link";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  Play,
  Users,
} from "lucide-react";

import { landingLoginHref } from "@/constants/landing-nav";

const mockApps = [
  { icon: Play, label: "Video", color: "bg-orange-100 text-orange-600" },
  { icon: FileText, label: "Tài liệu", color: "bg-teal-100 text-teal-700" },
  { icon: ClipboardList, label: "Quiz", color: "bg-sky-100 text-sky-600" },
  { icon: Calendar, label: "Lịch học", color: "bg-amber-100 text-amber-700" },
  { icon: Users, label: "Lớp học", color: "bg-rose-100 text-rose-600" },
  { icon: BookOpen, label: "Module", color: "bg-indigo-100 text-indigo-600" },
];

function DeviceMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      {/* Laptop */}
      <div className="relative z-10 overflow-hidden rounded-xl border-[6px] border-slate-800 bg-slate-800 shadow-[0_30px_60px_rgba(15,23,42,0.35)]">
        <div className="bg-white p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 sm:text-sm">
                Learning Hub
              </p>
              <p className="text-[10px] text-slate-400">Course Learning</p>
            </div>
            <div className="h-7 w-7 rounded-full bg-teal-500/20 ring-2 ring-teal-400/40" />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {mockApps.map((app) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.label}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-2 py-3"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${app.color}`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-600">
                    {app.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 rounded-full bg-teal-500" />
          </div>
        </div>
      </div>
      <div className="mx-auto h-2.5 w-[72%] rounded-b-md bg-slate-700" />
      <div className="mx-auto h-1.5 w-[85%] rounded-b-lg bg-slate-600" />

      {/* Phone */}
      <div className="absolute -right-2 bottom-6 z-20 w-[38%] overflow-hidden rounded-[1.1rem] border-[4px] border-slate-800 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.3)] sm:-right-4 sm:bottom-8 sm:rounded-[1.35rem] sm:border-[5px]">
        <div className="bg-teal-600 px-2.5 py-2">
          <p className="text-[9px] font-semibold text-white sm:text-[10px]">
            Buổi học hôm nay
          </p>
        </div>
        <div className="space-y-1.5 p-2 sm:p-2.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-1.5 py-1.5"
            >
              <div className="h-5 w-5 shrink-0 rounded-md bg-orange-100" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="h-1.5 w-full rounded-full bg-slate-200" />
                <div className="h-1 w-2/3 rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Play badge */}
      <Link
        href={landingLoginHref}
        className="absolute left-1/2 top-[42%] z-30 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-orange-500 shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition hover:scale-105 hover:text-orange-600"
        aria-label="Đăng nhập để bắt đầu"
      >
        <span className="ml-0.5 inline-block border-y-[8px] border-l-[14px] border-y-transparent border-l-current" />
      </Link>
    </div>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden rounded-br-[4.5rem] bg-teal-700 sm:rounded-br-[6rem] lg:rounded-br-[8rem]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/landing-hero.jpg)" }}
      />
      <div className="absolute inset-0 bg-linear-to-br from-teal-800/92 via-teal-600/88 to-cyan-600/80" />
      <div className="absolute -left-20 top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-32">
        <div className="motion-safe:animate-[fade-up_700ms_ease-out_both]">
          <span className="inline-flex items-center rounded-full bg-orange-500 px-3.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
            One stop solution
          </span>

          <h1 className="mt-5 text-[clamp(2.1rem,5vw,3.4rem)] font-extrabold leading-[1.12] tracking-[-0.03em] text-white">
            Học tập thông minh
            <br />
            <span className="text-orange-300">Course Learning</span>
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-teal-50/90 sm:text-lg">
            Video, tài liệu và quiz theo từng buổi — giải pháp gọn cho giáo viên
            và học sinh trên một hệ thống.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={landingLoginHref}
              className="inline-flex h-12 items-center justify-center rounded-full bg-orange-500 px-7 text-sm font-bold text-white shadow-[0_12px_28px_rgba(249,115,22,0.4)] transition hover:bg-orange-600"
            >
              Bắt đầu ngay
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-orange-200"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/10">
                <span className="ml-0.5 inline-block border-y-[5px] border-l-[8px] border-y-transparent border-l-current" />
              </span>
              Khám phá khóa học
            </a>
          </div>
        </div>

        <div className="motion-safe:animate-[fade-up_700ms_ease-out_both] motion-safe:[animation-delay:120ms]">
          <DeviceMockup />
        </div>
      </div>
    </section>
  );
}
