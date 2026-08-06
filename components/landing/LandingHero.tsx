import Link from "next/link";

import { landingLoginHref } from "@/constants/landing-nav";

export function LandingHero() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/landing-hero.jpg)" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-linear-to-br from-[#4c3dcc]/94 via-[#6c5ce7]/88 to-[#a78bfa]/75"
        aria-hidden
      />
      <div
        className="absolute -top-24 left-1/4 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute right-0 bottom-0 h-[360px] w-[360px] rounded-full bg-[#c4b5fd]/20 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-center px-6 pt-24 pb-20 lg:px-8 lg:pt-28 lg:pb-24">
        <div className="max-w-2xl motion-safe:animate-[fade-up_700ms_ease-out_both]">
          <p className="text-sm font-semibold tracking-[0.08em] text-[#ddd6fe] uppercase">
            Course Learning
          </p>

          <h1 className="mt-4 text-[clamp(2.6rem,6vw,4.25rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-white">
            Học theo buổi.
            <br />
            Gọn trên một hệ thống.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
            Video, tài liệu và quiz gắn đúng từng buổi học — dành cho giáo viên
            và học sinh.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href={landingLoginHref}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-7 text-sm font-bold text-[#6c5ce7] shadow-[0_14px_32px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f4f2f8]"
            >
              Đăng nhập
            </Link>
            <a
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              Xem cách hoạt động
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
