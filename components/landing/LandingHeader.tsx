"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { landingLoginHref, landingNavLinks } from "@/constants/landing-nav";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  label,
  onClick,
  className = "",
  light,
}: {
  href: string;
  label: string;
  onClick?: () => void;
  className?: string;
  light?: boolean;
}) {
  const baseClass = cn(
    "px-2.5 py-2 text-[13px] font-medium transition-colors",
    light
      ? "text-white/90 hover:text-white"
      : "text-slate-600 hover:text-teal-700",
  );

  if (href.startsWith("/")) {
    return (
      <Link href={href} onClick={onClick} className={cn(baseClass, className)}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} onClick={onClick} className={cn(baseClass, className)}>
      {label}
    </a>
  );
}

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const onHero = !scrolled && !mobileOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || mobileOpen
          ? "border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-4 px-6 lg:h-[4.25rem] lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-2.5"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className={cn(
              "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full",
              onHero
                ? "bg-white/15 ring-1 ring-white/30"
                : "bg-teal-50 ring-1 ring-teal-100",
            )}
          >
            <Image
              src="/icons/eduIcon02.png"
              alt="Course Learning"
              width={36}
              height={36}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <p
            className={cn(
              "truncate text-[15px] font-bold tracking-tight",
              onHero ? "text-white" : "text-slate-800",
            )}
          >
            Course Learning
          </p>
        </Link>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex"
          aria-label="Điều hướng chính"
        >
          {landingNavLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              light={onHero}
            />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={landingLoginHref}
            className="hidden h-10 items-center justify-center rounded-full bg-orange-500 px-5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(249,115,22,0.35)] transition hover:bg-orange-600 sm:inline-flex"
          >
            Đăng nhập
          </Link>

          <button
            type="button"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg transition lg:hidden",
              onHero
                ? "text-white hover:bg-white/15"
                : "text-slate-700 hover:bg-slate-100",
            )}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
            {landingNavLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                className="w-full px-2 py-3"
                onClick={() => setMobileOpen(false)}
              />
            ))}
            <Link
              href={landingLoginHref}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Đăng nhập
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
