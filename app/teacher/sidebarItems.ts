import {
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LibraryBig,
  MessageSquareHeart,
  MonitorPlay,
  UserRound,
} from "lucide-react";
import type { DashboardMenuGroup } from "@/components/dashboard/DashboardSidebar";

export type TeacherMenuKey =
  | "overview"
  | "content"
  | "questionBank"
  | "feedback"
  | "profile"
  | "password";

export const teacherMenuGroups: DashboardMenuGroup<TeacherMenuKey>[] = [
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
        accent: "from-sky-400 to-cyan-500",
        activeGlow: "shadow-[0_0_20px_rgba(56,189,248,0.22)]",
      },
    ],
  },
  {
    title: "Giảng dạy",
    subtitle: "video & tài liệu",
    items: [
      {
        key: "content",
        label: "Video & Tài liệu",
        hint: "upload buổi học",
        index: "02",
        icon: MonitorPlay,
        accent: "from-violet-400 to-fuchsia-500",
        activeGlow: "shadow-[0_0_20px_rgba(139,92,246,0.25)]",
      },
      {
        key: "questionBank",
        label: "Kho đề",
        hint: "ngân hàng câu hỏi",
        index: "03",
        icon: LibraryBig,
        accent: "from-amber-400 to-orange-500",
        activeGlow: "shadow-[0_0_20px_rgba(251,191,36,0.22)]",
      },
      {
        key: "feedback",
        label: "Feedback học viên",
        hint: "theo từng lớp",
        index: "04",
        icon: MessageSquareHeart,
        accent: "from-rose-400 to-orange-400",
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
        accent: "from-emerald-400 to-teal-500",
        activeGlow: "shadow-[0_0_20px_rgba(52,211,153,0.22)]",
      },
    ],
  },
];

export const teacherMenuLabels: Record<TeacherMenuKey, string> = {
  overview: "Tổng quan",
  content: "Video & Tài liệu",
  questionBank: "Kho đề",
  feedback: "Feedback học viên",
  profile: "Thông tin cá nhân",
  password: "Đổi mật khẩu",
};

export const teacherSidebarBranding = {
  title: "Course Teacher",
  tagline: "Không gian giảng dạy",  
  icon: GraduationCap,
  iconColor: "text-sky-400",
  radialGradient:
    "bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.14),transparent_60%)]",
  lineAccent: "from-sky-500/40",
  chevronActive: "text-sky-300/90",
};
