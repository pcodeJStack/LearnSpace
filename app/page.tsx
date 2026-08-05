import Link from "next/link";
import { ArrowRight, FileText, ListChecks, Play } from "lucide-react";

import { LandingAboutSection } from "@/components/landing/LandingAboutSection";
import { LandingFeaturesSection } from "@/components/landing/LandingFeaturesSection";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingQuizSection } from "@/components/landing/LandingQuizSection";
import { landingLoginHref, landingNavLinks } from "@/constants/landing-nav";

export const metadata = {
  title: "Course Learning Platform",
  description:
    "Nền tảng quản lý lớp học, video bài giảng và tài liệu học tập.",
};

const footerExploreLinks = [
  ...landingNavLinks,
  { href: landingLoginHref, label: "Đăng nhập" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800">
      <LandingHeader />
      <LandingHero />
      <LandingFeaturesSection />
      <LandingQuizSection />
      <LandingAboutSection />

      <footer className="border-t border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <p className="text-lg font-bold">Course Learning</p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
                Giải pháp quản lý lớp học trực tuyến — tập trung video, tài liệu
                và đánh giá cho giáo viên, học sinh trên một hệ thống thống
                nhất.
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Play className="h-3 w-3 text-orange-400" />
                  Video bài giảng
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-orange-400" />
                  Tài liệu theo buổi
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ListChecks className="h-3 w-3 text-orange-400" />
                  Quiz
                </span>
              </div>
            </div>

            <div className="lg:col-span-3">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                Khám phá
              </p>
              <ul className="mt-5 space-y-3">
                {footerExploreLinks.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    {link.href.startsWith("/") ? (
                      <Link
                        href={link.href}
                        className="text-sm text-slate-300 transition hover:text-orange-400"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-slate-300 transition hover:text-orange-400"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4">
              <p className="text-base font-semibold">Sẵn sàng bắt đầu?</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Đăng nhập bằng tài khoản được cấp và truy cập nội dung học tập
                ngay.
              </p>
              <Link
                href={landingLoginHref}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-orange-500 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                Đăng nhập hệ thống
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Course Learning. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
