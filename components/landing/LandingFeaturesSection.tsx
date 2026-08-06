import {
  ClipboardList,
  FileText,
  GraduationCap,
  Play,
  Users,
} from "lucide-react";

const pillars = [
  {
    icon: Play,
    title: "Video theo buổi",
    description: "Xem trước và xem lại đúng session.",
  },
  {
    icon: FileText,
    title: "Tài liệu gắn sẵn",
    description: "Slide, PDF nằm trong buổi học.",
  },
  {
    icon: ClipboardList,
    title: "Quiz online",
    description: "Trắc nghiệm và tự luận trên hệ thống.",
  },
];

const journey = ["Module", "Buổi học", "Video", "Tài liệu"];

const teacherSteps = [
  { title: "Upload video", desc: "Bài giảng & video xem lại theo buổi" },
  { title: "Đính kèm tài liệu", desc: "Slide, PDF ngay trong session" },
  { title: "Sắp xếp lớp", desc: "Module → buổi học có cấu trúc" },
];

const studentSteps = [
  { title: "Nhập mã lớp", desc: "Tham gia bằng mã được admin cấp" },
  { title: "Học video", desc: "Xem bài đúng theo từng buổi" },
  { title: "Tải tài liệu", desc: "Truy cập tài nguyên trong session" },
];

export function LandingFeaturesSection() {
  return (
    <>
      <section id="solutions" className="bg-[#faf9fc] px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-wide text-[#6c5ce7]">
              Giải pháp
            </p>
            <h2 className="mt-3 text-[1.85rem] font-extrabold leading-tight tracking-[-0.03em] text-slate-900 sm:text-4xl">
              Luôn sẵn sàng cho buổi học tiếp theo
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500 sm:text-base">
              Course Learning gom video, tài liệu và quiz theo buổi — lớp học
              vận hành gọn, ai cũng biết mình cần làm gì.
            </p>
          </div>

          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {pillars.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="border-t border-[#ebe7ff] pt-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6c5ce7] text-white shadow-[0_10px_22px_rgba(108,92,231,0.25)]">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="bg-white px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-wide text-[#6c5ce7]">
              Khóa học
            </p>
            <h2 className="mt-3 text-[1.85rem] font-extrabold leading-[1.15] tracking-[-0.03em] text-slate-900 sm:text-[2.35rem]">
              Mỗi buổi học.
              <span className="block text-[#6c5ce7]">Một bộ nội dung đầy đủ.</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500 sm:text-base">
              Module → session → tài nguyên nằm đúng chỗ. Giáo viên và học sinh
              cùng một lộ trình.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-[#ebe7ff] py-8">
            {journey.map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-extrabold tracking-tight text-[#6c5ce7] sm:text-3xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base font-semibold text-slate-800 sm:text-lg">
                    {label}
                  </span>
                </div>
                {i < journey.length - 1 ? (
                  <span className="hidden text-[#d5ceff] sm:inline" aria-hidden>
                    —
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="flex items-center gap-3 border-b border-[#ebe7ff] pb-4">
                <GraduationCap className="h-5 w-5 text-[#6c5ce7]" />
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">
                    Giáo viên
                  </h3>
                  <p className="text-sm text-slate-500">
                    Tổ chức nội dung lớp theo buổi
                  </p>
                </div>
              </div>
              <ol className="mt-2">
                {teacherSteps.map((step, index) => (
                  <li
                    key={step.title}
                    className="grid grid-cols-[3rem_1fr] gap-4 border-b border-slate-100 py-5 last:border-b-0"
                  >
                    <span className="pt-0.5 text-sm font-bold text-[#6c5ce7]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold tracking-tight text-slate-900">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <div className="flex items-center gap-3 border-b border-[#ebe7ff] pb-4">
                <Users className="h-5 w-5 text-[#6c5ce7]" />
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">
                    Học sinh
                  </h3>
                  <p className="text-sm text-slate-500">
                    Học đúng buổi, đúng tài nguyên
                  </p>
                </div>
              </div>
              <ol className="mt-2">
                {studentSteps.map((step, index) => (
                  <li
                    key={step.title}
                    className="grid grid-cols-[3rem_1fr] gap-4 border-b border-slate-100 py-5 last:border-b-0"
                  >
                    <span className="pt-0.5 text-sm font-bold text-[#a78bfa]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold tracking-tight text-slate-900">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
