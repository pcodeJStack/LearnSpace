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

const softGlow = "shadow-[0_8px_20px_rgba(108,92,231,0.12)]";

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
        accent: "from-[#6c5ce7] to-[#a78bfa]",
        activeGlow: softGlow,
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
        accent: "from-[#6c5ce7] to-[#00d97e]",
        activeGlow: softGlow,
      },
      {
        key: "schedule",
        label: "Lịch học",
        hint: "theo tuần",
        index: "03",
        icon: CalendarDays,
        accent: "from-[#00d97e] to-[#6c5ce7]",
        activeGlow: softGlow,
      },
      {
        key: "feedback",
        label: "Đánh giá giảng viên",
        hint: "feedback & rating",
        index: "04",
        icon: MessageSquareHeart,
        accent: "from-[#f472b6] to-[#6c5ce7]",
        activeGlow: softGlow,
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
        accent: "from-[#6c5ce7] to-[#c4b5fd]",
        activeGlow: softGlow,
      },
      {
        key: "password",
        label: "Đổi mật khẩu",
        hint: "bảo mật tài khoản",
        index: "06",
        icon: KeyRound,
        accent: "from-[#fbbf24] to-[#6c5ce7]",
        activeGlow: softGlow,
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
  theme: "light" as const,
  variant: "rail" as const,
  iconColor: "text-[#6c5ce7]",
  iconActive: "text-[#6c5ce7]",
  sidebarBg: "bg-white",
  footerBg: "bg-[#f7f5fb]",
  radialGradient:
    "bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(108,92,231,0.08),transparent_60%)]",
  lineAccent: "from-[#6c5ce7]/40",
  chevronActive: "text-[#6c5ce7]",
};
