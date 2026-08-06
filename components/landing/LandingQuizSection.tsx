"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  ClipboardList,
  Library,
  ListChecks,
  PenLine,
  Target,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const quizFlow = [
  { icon: Library, label: "Kho đề", hint: "Soạn sẵn" },
  { icon: Target, label: "Gắn bài", hint: "Theo buổi" },
  { icon: ClipboardList, label: "Làm bài", hint: "Online" },
  { icon: CheckCircle2, label: "Kết quả", hint: "Lưu lại" },
];

const formats = [
  {
    icon: ListChecks,
    title: "Trắc nghiệm",
    accent: "text-[#6c5ce7]",
    line: "border-[#ebe7ff]",
    tag: "Chấm tự động",
    description:
      "Nhiều lựa chọn — hệ thống chấm điểm ngay khi học sinh nộp bài.",
    teacher: "Soạn đề và gắn vào buổi học",
    student: "Làm online, xem điểm ngay",
  },
  {
    icon: PenLine,
    title: "Tự luận",
    accent: "text-[#5b4bd1]",
    line: "border-[#d5ceff]",
    tag: "Chấm thủ công",
    description:
      "Câu hỏi mở — giáo viên đọc bài và chấm sau khi học sinh nộp.",
    teacher: "Theo dõi bài nộp và chấm điểm",
    student: "Viết bài, xem kết quả khi có",
  },
];

export function LandingQuizSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="quiz" className="bg-[#f4f2f8]/70 px-6 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="text-xs font-bold tracking-[0.18em] text-[#6c5ce7] uppercase">
            Quiz &amp; bài tập
          </p>
          <h2 className="mt-3 text-[1.85rem] font-extrabold leading-[1.15] tracking-[-0.03em] text-slate-900 sm:text-[2.35rem]">
            Làm bài. Nộp bài.
            <span className="block text-[#6c5ce7]">Xem kết quả ngay.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-500 sm:text-base">
            Trắc nghiệm chấm tự động, tự luận chấm thủ công — giáo viên gắn bài
            theo buổi, học sinh làm online trên cùng nền tảng.
          </p>
        </div>

        {/* Flow — open line, no boxes */}
        <div className="mt-12 border-y border-[#ebe7ff] py-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-4">
            {quizFlow.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  className="relative text-center sm:text-left"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4, delay: index * 0.07, ease }}
                >
                  <p className="text-xs font-bold tracking-[0.14em] text-slate-300">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <StepIcon
                    className="mx-auto mt-3 h-5 w-5 text-[#6c5ce7] sm:mx-0"
                    strokeWidth={1.75}
                  />
                  <p className="mt-3 text-base font-bold tracking-tight text-slate-900">
                    {step.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{step.hint}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Formats — typography split, no cards */}
        <div className="mt-4 grid lg:grid-cols-2">
          {formats.map((format, index) => {
            const Icon = format.icon;
            return (
              <motion.div
                key={format.title}
                className={`py-10 lg:py-12 ${
                  index === 0
                    ? "border-b border-slate-200 lg:border-r lg:border-b-0 lg:pr-12"
                    : "lg:pl-12"
                }`}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.08, ease }}
              >
                <div className={`border-b pb-5 ${format.line}`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${format.accent}`} strokeWidth={1.75} />
                    <h3 className="text-xl font-bold tracking-tight text-slate-900">
                      {format.title}
                    </h3>
                  </div>
                  <p className={`mt-2 text-xs font-bold tracking-[0.12em] uppercase ${format.accent}`}>
                    {format.tag}
                  </p>
                </div>

                <p className="mt-5 text-[15px] leading-relaxed text-slate-500">
                  {format.description}
                </p>

                <dl className="mt-8 space-y-5">
                  <div>
                    <dt className="text-xs font-bold tracking-[0.14em] text-slate-400 uppercase">
                      Giáo viên
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-slate-800">
                      {format.teacher}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold tracking-[0.14em] text-slate-400 uppercase">
                      Học sinh
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-slate-800">
                      {format.student}
                    </dd>
                  </div>
                </dl>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
