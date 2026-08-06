import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  MessageSquareHeart,
  UserRound,
} from "lucide-react";

import type { DashboardMenuGroup } from "@/components/dashboard/DashboardSidebar";

export type StudentMenuKey =
  | "overview"
  | "content"
  | "schedule"
  | "feedback"
  | "profile"
  | "password";

export const studentMenuGroups: DashboardMenuGroup<StudentMenuKey>[] = [
  {
    title: "Điểm neo",
    subtitle: "bắt đầu từ đây",
    items: [
      {
        key: "overview",
        label: "Tổng quan",
        hint: "nhìn nhanh",
        index: "01",
        icon: LayoutDashboard,
        accent: "from-violet-400 to-indigo-500",
        activeGlow: "shadow-[0_0_20px_rgba(139,92,246,0.25)]",
      },
    ],
  },
  {
    title: "Hành trình",
    subtitle: "học & lịch",
    items: [
      {
        key: "content",
        label: "Nội dung học tập",
        hint: "video & tài liệu",
        index: "02",
        icon: BookOpen,
        accent: "from-sky-400 to-cyan-500",
        activeGlow: "shadow-[0_0_20px_rgba(56,189,248,0.22)]",
      },
      {
        key: "schedule",
        label: "Lịch học",
        hint: "theo tuần",
        index: "03",
        icon: CalendarDays,
        accent: "from-emerald-400 to-teal-500",
        activeGlow: "shadow-[0_0_20px_rgba(52,211,153,0.22)]",
      },
      {
        key: "feedback",
        label: "Đánh giá giảng viên",
        hint: "feedback & rating",
        index: "04",
        icon: MessageSquareHeart,
        accent: "from-rose-400 to-orange-500",
        activeGlow: "shadow-[0_0_20px_rgba(251,113,133,0.22)]",
      },
    ],
  },
  {
    title: "Bản thân",
    subtitle: "của bạn",
    items: [
      {
        key: "profile",
        label: "Thông tin cá nhân",
        hint: "cập nhật hồ sơ",
        index: "05",
        icon: UserRound,
        accent: "from-fuchsia-400 to-pink-500",
        activeGlow: "shadow-[0_0_20px_rgba(232,121,249,0.22)]",
      },
      {
        key: "password",
        label: "Đổi mật khẩu",
        hint: "bảo mật tài khoản",
        index: "06",
        icon: KeyRound,
        accent: "from-amber-400 to-orange-500",
        activeGlow: "shadow-[0_0_20px_rgba(251,191,36,0.22)]",
      },
    ],
  },
];

export const studentMenuLabels: Record<StudentMenuKey, string> = {
  overview: "Tổng quan",
  content: "Nội dung học tập",
  schedule: "Lịch học",
  feedback: "Đánh giá giảng viên",
  profile: "Thông tin cá nhân",
  password: "Đổi mật khẩu",
};

export const studentSidebarBranding = {
  title: "Course Student",
  tagline: "Không gian học tập",
  icon: GraduationCap,
  iconColor: "text-violet-400",
  radialGradient:
    "bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.14),transparent_60%)]",
  lineAccent: "from-violet-500/40",
  chevronActive: "text-violet-300/90",
};
