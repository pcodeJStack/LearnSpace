import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";

import { landingLoginHref } from "@/constants/landing-nav";

const aboutPoints = [
  {
    icon: Users,
    title: "Đúng vai trò",
    description:
      "Học sinh, giáo viên và quản trị viên mỗi người một không gian phù hợp.",
  },
  {
    icon: Sparkles,
    title: "Học theo buổi",
    description:
      "Nội dung gắn với session — video, tài liệu, quiz không bị lệch lịch học.",
  },
  {
    icon: ShieldCheck,
    title: "Quản trị tập trung",
    description:
      "Admin cấp lớp, theo dõi hệ thống; giáo viên tập trung giảng dạy.",
  },
];

export function LandingAboutSection() {
  return (
    <section id="about" className="bg-white px-6 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-[#6c5ce7] uppercase">
            Giới thiệu
          </p>
          <h2 className="mt-3 text-[1.85rem] font-extrabold leading-[1.15] tracking-[-0.03em] text-slate-900 sm:text-[2.35rem]">
            Course Learning
            <span className="block text-[#6c5ce7]">là gì?</span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-slate-500 sm:text-base">
            Nền tảng giúp lớp học trực tuyến vận hành gọn: giáo viên đăng nội
            dung theo buổi, học sinh học và làm bài đúng chỗ, quản trị viên kiểm
            soát lớp và tài khoản trên một hệ thống.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500 sm:text-base">
            Mục tiêu đơn giản — ít công cụ phụ, nhiều thời gian cho việc dạy và
            học thực sự.
          </p>

          <Link
            href={landingLoginHref}
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#6c5ce7] px-6 text-sm font-bold text-white shadow-[0_10px_24px_rgba(108,92,231,0.28)] transition hover:bg-[#5b4bd1]"
          >
            Vào hệ thống
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="border-t border-[#ebe7ff]">
          {aboutPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="grid grid-cols-[auto_1fr] gap-4 border-b border-[#ebe7ff] py-7"
              >
                <Icon
                  className="mt-0.5 h-5 w-5 text-[#6c5ce7]"
                  strokeWidth={1.75}
                />
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900">
                    {point.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    {point.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
