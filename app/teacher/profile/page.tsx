"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, useReducedMotion } from "framer-motion";
import {
  Briefcase,
  Camera,
  Clock3,
  Loader2,
  Mail,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { useGetTeacherProfileQuery } from "@/app/hooks/profile/useGetTeacherProfile";
import { useUpdateTeacherProfileMutation } from "@/app/hooks/profile/useUpdateTeacherProfile";
import { uploadAvatarToCloudinary } from "@/app/service/upload-avatar.service";
import { useAuthStore } from "@/app/store/auth.store";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type ProfileFormValues = {
  fullName: string;
  email: string;
  specialization: string;
  yearsExperience: string;
  avatar: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return "Không thể cập nhật thông tin.";
};

const TeacherProfilePage = () => {
  const reduceMotion = useReducedMotion();
  const authUser = useAuthStore((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profile, isLoading, isError } = useGetTeacherProfileQuery();
  const updateProfile = useUpdateTeacherProfileMutation();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      specialization: "",
      yearsExperience: "",
      avatar: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      fullName: profile.fullName || authUser?.fullName || "",
      email: profile.email || "",
      specialization: profile.specialization || "",
      yearsExperience:
        profile.yearsExperience != null ? String(profile.yearsExperience) : "",
      avatar: profile.avatar || "",
    });
  }, [profile, authUser?.fullName, form]);

  const displayName =
    form.watch("fullName") || profile?.fullName || authUser?.fullName || "—";
  const avatarUrl = form.watch("avatar") || profile?.avatar || "";
  const emailValue = form.watch("email") || profile?.email || "";
  const specializationValue =
    form.watch("specialization") || profile?.specialization || "";
  const isSaving = updateProfile.isPending || isUploadingAvatar;

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      setIsUploadingAvatar(true);

      try {
        const uploadedUrl = await uploadAvatarToCloudinary(file);
        form.setValue("avatar", uploadedUrl, { shouldDirty: true });
        toast.success("Tải ảnh lên thành công.");
      } catch (error: unknown) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [form],
  );

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleAvatarUpload(file);
    }
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleAvatarUpload(file);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    const yearsExperience = values.yearsExperience.trim();

    try {
      const response = await updateProfile.mutateAsync({
        fullName: values.fullName.trim(),
        specialization: values.specialization.trim(),
        yearsExperience: yearsExperience ? Number(yearsExperience) : 0,
        avatar: values.avatar.trim(),
      });
      toast.success(response.message || "Cập nhật thông tin thành công.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 p-8 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải hồ sơ...
      </div>
    );
  }

  if (isError && !profile) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center">
          <p className="text-sm font-medium text-slate-900">
            Không thể tải thông tin cá nhân
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Vui lòng thử lại sau hoặc liên hệ quản trị viên.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_12%_-10%,rgba(108,92,231,0.14),transparent_55%),radial-gradient(ellipse_60%_50%_at_90%_0%,rgba(167,139,250,0.12),transparent_50%),linear-gradient(180deg,#faf9fc_0%,#ffffff_42%,#f4f2f8_100%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:py-10">
        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="flex flex-col justify-between gap-8 lg:sticky lg:top-8 lg:self-start"
        >
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-[#6c5ce7] uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Tài khoản
            </span>

            <div className="space-y-5">
              <h2 className="max-w-md text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                <span className="block leading-[1.15]">Hồ sơ</span>
                <span className="mt-2 block leading-[1.2] bg-linear-to-r from-[#6c5ce7] to-[#a78bfa] bg-clip-text text-transparent">
                  giảng viên của bạn
                </span>
              </h2>
              <p className="max-w-sm pt-1 text-sm leading-7 text-slate-500">
                Quản lý ảnh đại diện, chuyên môn và kinh nghiệm — thông tin
                hiển thị với học viên và quản trị.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6c5ce7]" />
                Ảnh đại diện
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
                Chuyên môn
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Lưu thay đổi
              </span>
            </div>
          </div>

          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragActive(false);
            }}
            onDrop={handleDrop}
            className={`relative overflow-hidden rounded-3xl border bg-white/70 p-5 shadow-[0_20px_50px_-28px_rgba(108,92,231,0.28)] backdrop-blur-sm transition ${
              isDragActive
                ? "border-[#c4b5fd] ring-2 ring-[rgba(108,92,231,0.15)]"
                : "border-white/70"
            }`}
          >
            <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-linear-to-br from-[#6c5ce7]/25 to-[#a78bfa]/20 blur-2xl" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div className="relative flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="group relative shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[#ebe7ff] ring-1 ring-[#d5ceff]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#6c5ce7] to-[#a78bfa] text-lg font-bold text-white">
                      {getInitials(displayName)}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition group-hover:bg-slate-900/45">
                    <Camera className="h-4 w-4 text-white opacity-0 transition group-hover:opacity-100" />
                  </div>
                </div>
              </button>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                  Hồ sơ giảng viên
                </p>
                <p className="truncate text-lg font-bold text-slate-900">
                  {displayName}
                </p>
                <p className="truncate text-sm text-slate-500">
                  {specializationValue || emailValue}
                </p>
              </div>
            </div>

            <div className="relative mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 cursor-pointer rounded-xl border-[#ebe7ff] text-[#6c5ce7] hover:bg-[#ebe7ff]/60"
                disabled={isUploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Camera className="mr-1.5 h-3.5 w-3.5" />
                    Đổi ảnh
                  </>
                )}
              </Button>
              {avatarUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 cursor-pointer gap-1.5 text-slate-500 hover:text-rose-600"
                  onClick={() =>
                    form.setValue("avatar", "", { shouldDirty: true })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Gỡ ảnh
                </Button>
              ) : null}
            </div>
          </div>
        </motion.aside>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.08, ease }}
          className="min-w-0"
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-7 rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_24px_60px_-40px_rgba(108,92,231,0.35)] sm:p-7"
            >
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                  Chi tiết hồ sơ
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Thông tin chuyên môn
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Email không thể chỉnh sửa. Cập nhật chuyên môn và kinh nghiệm
                  khi cần.
                </p>
              </div>

              <div className="h-px w-full bg-linear-to-r from-transparent via-[#ebe7ff] to-transparent" />

              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="fullName"
                  rules={{ required: "Vui lòng nhập họ tên." }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-800">
                        Họ và tên
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-[#ebe7ff] bg-white pl-10 focus-visible:border-[#6c5ce7] focus-visible:ring-[rgba(108,92,231,0.2)]"
                            placeholder="Nguyễn Văn A"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-800">
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            {...field}
                            readOnly
                            className="h-11 cursor-not-allowed rounded-xl border-[#ebe7ff] bg-[#f4f2f8]/80 pl-10 text-slate-600"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-800">
                        Chuyên môn
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Briefcase className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-[#ebe7ff] bg-white pl-10 focus-visible:border-[#6c5ce7] focus-visible:ring-[rgba(108,92,231,0.2)]"
                            placeholder="Ví dụ: Lập trình Web, Tiếng Anh..."
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearsExperience"
                  rules={{
                    validate: (value) => {
                      if (!value.trim()) return true;
                      const parsed = Number(value);
                      if (Number.isNaN(parsed) || parsed < 0) {
                        return "Số năm kinh nghiệm không hợp lệ.";
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="max-w-xs">
                      <FormLabel className="text-sm font-semibold text-slate-800">
                        Số năm kinh nghiệm
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock3 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            className="h-11 rounded-xl border-[#ebe7ff] bg-white pl-10 focus-visible:border-[#6c5ce7] focus-visible:ring-[rgba(108,92,231,0.2)]"
                            placeholder="Ví dụ: 3"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <input type="hidden" {...form.register("avatar")} />

              <div className="flex justify-end border-t border-[#ebe7ff] pt-5">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 min-w-[148px] cursor-pointer rounded-2xl bg-[#6c5ce7] px-6 text-white shadow-[0_10px_24px_rgba(108,92,231,0.28)] hover:bg-[#5b4bd1]"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.section>
      </div>
    </div>
  );
};

export default TeacherProfilePage;
