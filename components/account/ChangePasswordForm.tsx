"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, useReducedMotion } from "framer-motion";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { useChangePasswordMutation } from "@/app/hooks/auth/useChangePassword";
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

type ChangePasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

type ChangePasswordTheme = "student" | "teacher";

const ease = [0.22, 1, 0.36, 1] as const;

const passwordRules = {
  required: "Vui lòng nhập mật khẩu.",
  minLength: {
    value: 6,
    message:
      "Mật khẩu phải có ít nhất 6 ký tự, bao gồm in hoa, số và ký tự đặc biệt.",
  },
  validate: (value: string) => {
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);

    if (hasUppercase && hasNumber && hasSpecial) {
      return true;
    }

    return "Mật khẩu phải có ít nhất 6 ký tự, bao gồm in hoa, số và ký tự đặc biệt.";
  },
};

const getErrorMessage = (error: unknown) => {
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

  return "Không thể đổi mật khẩu.";
};

const getFieldErrors = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "data" in error.response.data &&
    error.response.data.data &&
    typeof error.response.data.data === "object"
  ) {
    return error.response.data.data as {
      newPassword?: string;
      confirmPassword?: string;
    };
  }

  return null;
};

type ChangePasswordFormProps = {
  theme?: ChangePasswordTheme;
};

export function ChangePasswordForm({
  theme = "student",
}: ChangePasswordFormProps) {
  const reduceMotion = useReducedMotion();
  const changePassword = useChangePasswordMutation();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const roleLabel = theme === "teacher" ? "giảng viên" : "học viên";

  const form = useForm<ChangePasswordFormValues>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      const response = await changePassword.mutateAsync({
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      toast.success(response.message || "Đổi mật khẩu thành công.");
      form.reset();
    } catch (error: unknown) {
      const fieldErrors = getFieldErrors(error);
      let hasFieldError = false;

      if (fieldErrors?.newPassword) {
        form.setError("newPassword", { message: fieldErrors.newPassword });
        hasFieldError = true;
      }

      if (fieldErrors?.confirmPassword) {
        form.setError("confirmPassword", {
          message: fieldErrors.confirmPassword,
        });
        hasFieldError = true;
      }

      if (!hasFieldError) {
        toast.error(getErrorMessage(error));
      }
    }
  };

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
              Bảo mật
            </span>

            <div className="space-y-5">
              <h2 className="max-w-md text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                <span className="block leading-[1.15]">Đổi</span>
                <span className="mt-2 block leading-[1.2] bg-linear-to-r from-[#6c5ce7] to-[#a78bfa] bg-clip-text text-transparent">
                  mật khẩu của bạn
                </span>
              </h2>
              <p className="max-w-sm pt-1 text-sm leading-7 text-slate-500">
                Cập nhật mật khẩu mới để bảo vệ tài khoản {roleLabel}. Nên dùng
                mật khẩu mạnh và không chia sẻ với người khác.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6c5ce7]" />
                Mật khẩu mới
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
                Xác nhận
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Lưu thay đổi
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_50px_-28px_rgba(108,92,231,0.28)] backdrop-blur-sm">
            <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-linear-to-br from-[#6c5ce7]/25 to-[#a78bfa]/20 blur-2xl" />

            <div className="relative flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#6c5ce7] to-[#a78bfa] text-white shadow-[0_12px_28px_-12px_rgba(108,92,231,0.55)]">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                  Yêu cầu mật khẩu
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Ít nhất 6 ký tự, gồm chữ hoa, số và ký tự đặc biệt.
                </p>
              </div>
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
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#ebe7ff] bg-[#ebe7ff]/70 text-[#6c5ce7]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                    Bảo mật tài khoản
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    Mật khẩu mới
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Nhập mật khẩu mới và xác nhận lại để cập nhật.
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-linear-to-r from-transparent via-[#ebe7ff] to-transparent" />

              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="newPassword"
                  rules={passwordRules}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-800">
                        Mật khẩu mới
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            {...field}
                            type={showNewPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className="h-11 rounded-xl border-[#ebe7ff] bg-white pr-11 pl-10 focus-visible:border-[#6c5ce7] focus-visible:ring-[rgba(108,92,231,0.2)]"
                            placeholder="Nhập mật khẩu mới"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                            aria-label={
                              showNewPassword
                                ? "Ẩn mật khẩu mới"
                                : "Hiện mật khẩu mới"
                            }
                            className="absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-slate-600"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  rules={{
                    required: "Vui lòng nhập lại mật khẩu mới.",
                    validate: (value) =>
                      value === form.getValues("newPassword") ||
                      "Mật khẩu xác nhận không khớp.",
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-800">
                        Nhập lại mật khẩu mới
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className="h-11 rounded-xl border-[#ebe7ff] bg-white pr-11 pl-10 focus-visible:border-[#6c5ce7] focus-visible:ring-[rgba(108,92,231,0.2)]"
                            placeholder="Nhập lại mật khẩu mới"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            aria-label={
                              showConfirmPassword
                                ? "Ẩn mật khẩu xác nhận"
                                : "Hiện mật khẩu xác nhận"
                            }
                            className="absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-slate-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end border-t border-[#ebe7ff] pt-5">
                <Button
                  type="submit"
                  disabled={changePassword.isPending}
                  className="h-11 min-w-[148px] cursor-pointer rounded-2xl bg-[#6c5ce7] px-6 text-white shadow-[0_10px_24px_rgba(108,92,231,0.28)] hover:bg-[#5b4bd1]"
                >
                  {changePassword.isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang lưu...
                    </span>
                  ) : (
                    "Lưu mật khẩu"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.section>
      </div>
    </div>
  );
}
