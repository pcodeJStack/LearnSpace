"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/useLogin";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

type LoginFormValues = {
  role: "STUDENT" | "TEACHER";
  email: string;
  password: string;
};

type AdminLoginFormValues = {
  email: string;
  password: string;
};

const highlights = [
  "Video bài giảng theo buổi",
  "Tài liệu gắn đúng session",
  "Quiz trắc nghiệm & tự luận",
];

const roleTabs = [
  {
    value: "STUDENT" as const,
    label: "Học sinh",
    icon: GraduationCap,
  },
  {
    value: "TEACHER" as const,
    label: "Giáo viên",
    icon: Users,
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

const loginInputClass =
  "h-12 rounded-xl border-slate-200 bg-white text-[15px] leading-normal text-slate-900 placeholder:text-slate-400 shadow-none focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:outline-none";

const loginInputIconClass =
  "pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-teal-600";

const LoginPage = () => {
  const reduceMotion = useReducedMotion();
  const form = useForm<LoginFormValues>({
    defaultValues: {
      role: "STUDENT",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });
  const adminForm = useForm<AdminLoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const { mutateAsync: login, isPending: isLoginPending } = useLogin();
  const { mutateAsync: adminLogin, isPending: isAdminPending } = useLogin();
  const resetValidation = () => form.clearErrors();
  const resetAdminValidation = () => adminForm.clearErrors();

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login({
        ...values,
        deviceId: crypto.randomUUID(),
        deviceInfo: navigator.userAgent,
      });
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Email hoặc mật khẩu không đúng.";

      form.setError("root", {
        message,
      });
    }
  };

  const onAdminSubmit = async (values: AdminLoginFormValues) => {
    try {
      await adminLogin({
        role: "ADMIN",
        ...values,
        deviceId: crypto.randomUUID(),
        deviceInfo: navigator.userAgent,
      });
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Email hoặc mật khẩu không đúng.";

      adminForm.setError("root", {
        message,
      });
    }
  };

  const leftPanel = reduceMotion
    ? { initial: false as const, animate: { opacity: 1, x: 0 } }
    : {
        initial: { opacity: 0, x: -80 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.75, ease },
      };

  const rightPanel = reduceMotion
    ? { initial: false as const, animate: { opacity: 1, x: 0 } }
    : {
        initial: { opacity: 0, x: 80 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.75, delay: 0.12, ease },
      };

  const orbMotion = (duration: number, x: number, y: number) =>
    reduceMotion
      ? {}
      : {
          animate: {
            x: [0, x, 0],
            y: [0, y, 0],
            scale: [1, 1.08, 1],
          },
          transition: {
            duration,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        };

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-900 lg:grid lg:grid-cols-2">
      {/* LEFT — teal brand panel */}
      <motion.section
        className="relative hidden overflow-hidden bg-teal-700 lg:flex lg:flex-col"
        {...leftPanel}
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url(/images/landing-hero.jpg)" }}
          initial={reduceMotion ? false : { scale: 1.12 }}
          animate={reduceMotion ? undefined : { scale: 1 }}
          transition={{ duration: 1.4, ease }}
        />
        <div className="absolute inset-0 bg-linear-to-br from-teal-800/95 via-teal-600/90 to-cyan-600/85" />

        <motion.div
          className="absolute -left-16 top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl"
          {...orbMotion(10, 28, -22)}
        />
        <motion.div
          className="absolute bottom-16 right-8 h-40 w-40 rounded-full bg-orange-400/25 blur-3xl"
          {...orbMotion(12, -24, 18)}
        />
        <motion.div
          className="absolute right-20 top-1/3 h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl"
          {...orbMotion(8, 16, 28)}
        />

        <div className="relative z-10 flex flex-1 flex-col px-10 py-10 xl:px-14">
          <motion.div
            className="flex flex-1 flex-col"
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.28 },
              },
            }}
          >
            <motion.div
              variants={
                reduceMotion
                  ? undefined
                  : {
                      hidden: { opacity: 0, x: -40 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.55, ease },
                      },
                    }
              }
            >
              <Link href="/" className="flex items-center gap-2.5">
                <div className="relative flex h-9 w-9 overflow-hidden rounded-full bg-white/15 ring-1 ring-white/30">
                  <Image
                    src="/icons/eduIcon02.png"
                    alt="Course Learning"
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <span className="text-[15px] font-bold tracking-tight text-white">
                  Course Learning
                </span>
              </Link>
            </motion.div>

            <div className="flex flex-1 flex-col justify-center py-16">
              <motion.span
                variants={
                  reduceMotion
                    ? undefined
                    : {
                        hidden: { opacity: 0, x: -40 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.55, ease },
                        },
                      }
                }
                className="inline-flex w-fit rounded-full bg-orange-500 px-3.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase"
              >
                One stop solution
              </motion.span>

              <motion.h1
                variants={
                  reduceMotion
                    ? undefined
                    : {
                        hidden: { opacity: 0, x: -40 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.55, ease },
                        },
                      }
                }
                className="mt-5 text-[clamp(2.2rem,3.5vw,3.1rem)] font-extrabold leading-[1.12] tracking-[-0.03em] text-white"
              >
                Học tập thông minh
                <br />
                <span className="text-orange-300">Course Learning</span>
              </motion.h1>

              <motion.p
                variants={
                  reduceMotion
                    ? undefined
                    : {
                        hidden: { opacity: 0, x: -40 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.55, ease },
                        },
                      }
                }
                className="mt-4 max-w-md text-base leading-relaxed text-teal-50/90"
              >
                Video, tài liệu và quiz theo từng buổi — đăng nhập để tiếp tục
                học và giảng dạy.
              </motion.p>

              <motion.ul
                variants={
                  reduceMotion
                    ? undefined
                    : {
                        hidden: { opacity: 0, x: -40 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.55, ease },
                        },
                      }
                }
                className="mt-10 max-w-sm space-y-0 border-t border-white/20"
              >
                {highlights.map((item, index) => (
                  <motion.li
                    key={item}
                    className="border-b border-white/20 py-3.5 text-sm font-medium text-white/90"
                    initial={reduceMotion ? false : { opacity: 0, x: -28 }}
                    animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: 0.7 + index * 0.12,
                      ease,
                    }}
                  >
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* RIGHT — form */}
      <motion.section
        className="relative flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:px-14 xl:px-20"
        {...rightPanel}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <div className="relative flex h-8 w-8 overflow-hidden rounded-full bg-teal-50 ring-1 ring-teal-100">
              <Image
                src="/icons/eduIcon02.png"
                alt="Course Learning"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-sm font-bold text-slate-800">
              Course Learning
            </span>
          </Link>
          <Link
            href="/"
            className="ml-auto text-sm font-medium text-slate-400 transition hover:text-teal-700"
          >
            Về trang chủ
          </Link>
        </div>

        <motion.div
          className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10"
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.08, delayChildren: 0.28 },
            },
          }}
        >
          <motion.div
            className="mb-8"
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: { opacity: 0, x: 40 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.55, ease },
                    },
                  }
            }
          >
            <h2 className="text-[1.85rem] font-extrabold tracking-[-0.03em] text-slate-900">
              Đăng nhập
            </h2>
            <p className="mt-2 text-[15px] text-slate-500">
              Nhập email và mật khẩu để tiếp tục học tập.
            </p>
          </motion.div>

          <motion.div
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: { opacity: 0, x: 40 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.55, ease },
                    },
                  }
            }
          >

          <Form {...form}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                form.handleSubmit(onSubmit)(event);
              }}
              className="space-y-5"
              noValidate
            >
              <FormField
                control={form.control}
                name="role"
                rules={{ required: "Vui lòng chọn vai trò." }}
                render={({ field }) => (
                  <FormItem className="space-y-2.5">
                    <FormLabel className="text-sm font-semibold text-slate-800">
                      Vai trò
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-3">
                        {roleTabs.map((role) => {
                          const Icon = role.icon;
                          const active = field.value === role.value;

                          return (
                            <label
                              key={role.value}
                              className="group cursor-pointer"
                            >
                              <input
                                className="peer sr-only"
                                type="radio"
                                name={field.name}
                                value={role.value}
                                checked={active}
                                onChange={() => {
                                  field.onChange(role.value);
                                  resetValidation();
                                }}
                              />
                              <span
                                className={cn(
                                  "flex items-center justify-center gap-2 border-b-2 px-2 py-3 text-sm font-semibold transition-colors",
                                  active
                                    ? "border-orange-500 text-orange-600"
                                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700",
                                )}
                              >
                                <Icon className="h-4 w-4 shrink-0" />
                                {role.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "Vui lòng nhập email.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email không đúng định dạng.",
                  },
                }}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold text-slate-800">
                      Email
                    </FormLabel>
                    <FormControl>
                      <div className="group relative">
                        <Mail
                          className={loginInputIconClass}
                          strokeWidth={1.75}
                        />
                        <Input
                          {...field}
                          type="email"
                          placeholder="kou.fuku@email.com"
                          autoComplete="email"
                          className={cn(loginInputClass, "pr-4 pl-11")}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                rules={{
                  required: "Vui lòng nhập mật khẩu.",
                  minLength: {
                    value: 6,
                    message:
                      "Mật khẩu phải có ít nhất 6 ký tự, bao gồm in hoa, số và ký tự đặc biệt.",
                  },
                  validate: (value) => {
                    const hasUppercase = /[A-Z]/.test(value);
                    const hasNumber = /\d/.test(value);
                    const hasSpecial = /[^A-Za-z0-9]/.test(value);

                    if (hasUppercase && hasNumber && hasSpecial) {
                      return true;
                    }

                    return "Mật khẩu phải có ít nhất 6 ký tự, bao gồm in hoa, số và ký tự đặc biệt.";
                  },
                }}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold text-slate-800">
                      Mật khẩu
                    </FormLabel>
                    <FormControl>
                      <div className="group relative">
                        <Lock
                          className={loginInputIconClass}
                          strokeWidth={1.75}
                        />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className={cn(loginInputClass, "pr-11 pl-11")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={
                            showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                          }
                          className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                        >
                          {showPassword ? (
                            <EyeOff
                              className="h-[18px] w-[18px] cursor-pointer"
                              strokeWidth={1.75}
                            />
                          ) : (
                            <Eye
                              className="h-[18px] w-[18px] cursor-pointer"
                              strokeWidth={1.75}
                            />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoginPending}
                aria-busy={isLoginPending}
                className="h-12 w-full cursor-pointer rounded-full border-0 bg-orange-500 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(249,115,22,0.3)] transition hover:bg-orange-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isLoginPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </span>
                ) : (
                  "Đăng nhập"
                )}
              </Button>

              {form.formState.errors.root?.message ? (
                <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  {form.formState.errors.root.message}
                </p>
              ) : null}
            </form>
          </Form>
          </motion.div>

          <motion.div
            className="mt-10 flex justify-center border-t border-slate-100 pt-6"
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: { opacity: 0, x: 40 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.55, ease },
                    },
                  }
            }
          >
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  onClick={resetAdminValidation}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-teal-700"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Đăng nhập quản trị viên
                </button>
              </DialogTrigger>
              <DialogContent className="gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl sm:max-w-[380px]">
                <div className="h-1 w-full bg-orange-500" />

                <div className="space-y-4 p-6">
                  <DialogHeader className="flex-row items-center gap-3 space-y-0 text-left">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 pr-8">
                      <DialogTitle className="text-base font-bold text-slate-900">
                        Đăng nhập quản trị
                      </DialogTitle>
                      <DialogDescription className="text-xs text-slate-500">
                        Dành riêng cho quản trị hệ thống
                      </DialogDescription>
                    </div>
                  </DialogHeader>

                  <Form {...adminForm}>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        adminForm.handleSubmit(onAdminSubmit)(event);
                      }}
                      className="space-y-3.5"
                      noValidate
                    >
                      <FormField
                        control={adminForm.control}
                        name="email"
                        rules={{
                          required: "Vui lòng nhập email.",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Email không đúng định dạng.",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-sm font-semibold text-slate-800">
                              Email
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="admin@domain.com"
                                  autoComplete="email"
                                  className="h-11 rounded-xl border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:outline-none"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={adminForm.control}
                        name="password"
                        rules={{
                          required: "Vui lòng nhập mật khẩu.",
                          minLength: {
                            value: 6,
                            message:
                              "Mật khẩu phải có ít nhất 6 ký tự, bao gồm in hoa, số và ký tự đặc biệt.",
                          },
                          validate: (value) => {
                            const hasUppercase = /[A-Z]/.test(value);
                            const hasNumber = /\d/.test(value);
                            const hasSpecial = /[^A-Za-z0-9]/.test(value);

                            if (hasUppercase && hasNumber && hasSpecial) {
                              return true;
                            }

                            return "Mật khẩu phải có ít nhất 6 ký tự, bao gồm in hoa, số và ký tự đặc biệt.";
                          },
                        }}
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-sm font-semibold text-slate-800">
                              Mật khẩu
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <Input
                                  {...field}
                                  type={
                                    showAdminPassword ? "text" : "password"
                                  }
                                  placeholder="••••••••"
                                  autoComplete="current-password"
                                  className="h-11 rounded-xl border-slate-200 bg-white pr-9 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowAdminPassword((prev) => !prev)
                                  }
                                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                >
                                  {showAdminPassword ? (
                                    <EyeOff className="h-3.5 w-3.5 cursor-pointer" />
                                  ) : (
                                    <Eye className="h-3.5 w-3.5 cursor-pointer" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isAdminPending}
                        aria-busy={isAdminPending}
                        className="h-11 w-full cursor-pointer rounded-full border-0 bg-orange-500 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-80"
                      >
                        {isAdminPending ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang đăng nhập...
                          </span>
                        ) : (
                          "Đăng nhập"
                        )}
                      </Button>

                      {adminForm.formState.errors.root?.message ? (
                        <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                          {adminForm.formState.errors.root.message}
                        </p>
                      ) : null}
                    </form>
                  </Form>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default LoginPage;
