import {
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  Play,
  Users,
} from "lucide-react";

const highlightSteps = [
  {
    n: "01",
    icon: Play,
    title: "Video",
    color: "from-orange-400 to-orange-500",
  },
  {
    n: "02",
    icon: FileText,
    title: "Tài liệu",
    color: "from-teal-400 to-teal-600",
  },
  {
    n: "03",
    icon: ClipboardList,
    title: "Quiz",
    color: "from-sky-400 to-sky-600",
  },
  {
    n: "04",
    icon: Calendar,
    title: "Lịch học",
    color: "from-amber-400 to-amber-500",
  },
  {
    n: "05",
    icon: Users,
    title: "Lớp học",
    color: "from-rose-400 to-rose-500",
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
      <section id="solutions" className="bg-white px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[1.85rem] font-extrabold leading-tight tracking-[-0.03em] text-slate-900 sm:text-4xl">
            Luôn sẵn sàng cho buổi học tiếp theo
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-500 sm:text-base">
            Course Learning gom video, tài liệu và quiz theo buổi — lớp học vận
            hành gọn, ai cũng biết mình cần làm gì.
          </p>
        </div>

        <div className="mx-auto mt-12 flex max-w-4xl flex-wrap items-end justify-center gap-4 sm:gap-6">
          {highlightSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.n}
                className="group flex w-[5.5rem] flex-col items-center sm:w-24"
              >
                <div
                  className={`relative flex h-20 w-20 items-end justify-center overflow-hidden rounded-t-full bg-linear-to-b ${step.color} transition group-hover:-translate-y-1 sm:h-24 sm:w-24`}
                >
                  <span className="absolute top-3 text-[11px] font-bold text-white/90">
                    {step.n}
                  </span>
                  <Icon className="mb-4 h-6 w-6 text-white sm:h-7 sm:w-7" />
                </div>
                <p className="mt-3 text-center text-xs font-semibold text-slate-600 sm:text-sm">
                  {step.title}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="features" className="bg-white px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="text-xs font-bold tracking-[0.18em] text-orange-500 uppercase">
              Khóa học
            </p>
            <h2 className="mt-3 text-[1.85rem] font-extrabold leading-[1.15] tracking-[-0.03em] text-slate-900 sm:text-[2.35rem]">
              Mỗi buổi học.
              <span className="block text-teal-600">Một bộ nội dung đầy đủ.</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500 sm:text-base">
              Không còn rải video và file khắp nơi. Module → session → tài nguyên
              nằm đúng chỗ, giáo viên và học sinh cùng một lộ trình.
            </p>
          </div>

          {/* Open journey strip */}
          <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-slate-200 py-8">
            {journey.map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-extrabold tracking-tight text-teal-600/80 sm:text-3xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base font-semibold text-slate-800 sm:text-lg">
                    {label}
                  </span>
                </div>
                {i < journey.length - 1 ? (
                  <span className="hidden text-slate-300 sm:inline" aria-hidden>
                    —
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Role columns — no cards */}
          <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="flex items-center gap-3 border-b border-orange-200 pb-4">
                <GraduationCap className="h-5 w-5 text-orange-500" />
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
                    <span className="pt-0.5 text-sm font-bold text-orange-400">
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
              <div className="flex items-center gap-3 border-b border-teal-200 pb-4">
                <Users className="h-5 w-5 text-teal-600" />
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
                    <span className="pt-0.5 text-sm font-bold text-teal-500">
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
