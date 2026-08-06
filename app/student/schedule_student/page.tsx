"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  LayoutList,
  Loader2,
  MapPin,
  Sparkles,
  UserPlus,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { useEnrollClassroomMutation } from "@/app/hooks/classes/useEnrollClassroom";
import { useGetMyClassesQuery } from "@/app/hooks/classes/useGetMyClasses";
import { useGetClassSchedulesQuery } from "@/app/hooks/schedules/useGetClassSchedules";
import type { ClassScheduleItem } from "@/app/service/classSchedule.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ScheduleBandConfig = {
  id: "day" | "evening";
  label: string;
  subtitle: string;
  startHour: number;
  endHour: number;
  crossesMidnight: boolean;
  slotMinutes: number;
  slotHeight: number;
};

const SCHEDULE_BANDS: ScheduleBandConfig[] = [
  {
    id: "day",
    label: "Ban ngày",
    subtitle: "06:00 – 18:00",
    startHour: 6,
    endHour: 18,
    crossesMidnight: false,
    slotMinutes: 60,
    slotHeight: 22,
  },
  {
    id: "evening",
    label: "Ban tối",
    subtitle: "18:00 – 03:00",
    startHour: 18,
    endHour: 3,
    crossesMidnight: true,
    slotMinutes: 30,
    slotHeight: 24,
  },
];

const weekDays = [
  { value: "MONDAY", label: "Thứ 2", short: "T2" },
  { value: "TUESDAY", label: "Thứ 3", short: "T3" },
  { value: "WEDNESDAY", label: "Thứ 4", short: "T4" },
  { value: "THURSDAY", label: "Thứ 5", short: "T5" },
  { value: "FRIDAY", label: "Thứ 6", short: "T6" },
  { value: "SATURDAY", label: "Thứ 7", short: "T7" },
  { value: "SUNDAY", label: "CN", short: "CN" },
];

type ViewMode = "calendar" | "list";

const getStudyModeLabel = (value?: string) => {
  switch ((value ?? "").toUpperCase()) {
    case "ONLINE":
      return "Online";
    case "OFFLINE":
      return "Offline";
    default:
      return value ?? "—";
  }
};

const getStudyModeBlockStyles = (studyMode?: string) => {
  if ((studyMode ?? "").toUpperCase() === "ONLINE") {
    return "border-l-sky-500 border-sky-300/80 bg-sky-100/95 text-sky-900 shadow-sky-100/50";
  }

  return "border-l-orange-500 border-orange-300/80 bg-orange-50/95 text-orange-900 shadow-orange-100/50";
};

const getStudyModeBadgeStyles = (studyMode?: string) => {
  if ((studyMode ?? "").toUpperCase() === "ONLINE") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-orange-200 bg-orange-50 text-orange-700";
};

const formatTime = (value?: string) => {
  if (!value) return "—";
  return value.slice(0, 5);
};

const getBandStartMinutes = (band: ScheduleBandConfig) => band.startHour * 60;

const getBandEndMinutes = (band: ScheduleBandConfig) => {
  if (band.crossesMidnight) {
    return (band.endHour + 24) * 60;
  }
  return band.endHour * 60;
};

const getBandSpanMinutes = (band: ScheduleBandConfig) =>
  getBandEndMinutes(band) - getBandStartMinutes(band);

const getBandSlotCount = (band: ScheduleBandConfig) =>
  getBandSpanMinutes(band) / band.slotMinutes;

const getBandHeight = (band: ScheduleBandConfig) =>
  getBandSlotCount(band) * band.slotHeight;

const timeToBandMinutes = (
  value: string | undefined,
  band: ScheduleBandConfig,
) => {
  if (!value) return getBandStartMinutes(band);
  const [hours, minutes] = value.split(":").map(Number);
  let total = hours * 60 + (minutes || 0);

  if (band.crossesMidnight && hours < band.startHour) {
    total += 24 * 60;
  }

  return total;
};

const isScheduleInBand = (
  schedule: ClassScheduleItem,
  band: ScheduleBandConfig,
) => {
  const bandStart = getBandStartMinutes(band);
  const bandEnd = getBandEndMinutes(band);
  const start = timeToBandMinutes(schedule.startTime, band);
  const end = timeToBandMinutes(schedule.endTime, band);

  return end > bandStart && start < bandEnd;
};

const getBlockStyleInBand = (
  schedule: ClassScheduleItem,
  band: ScheduleBandConfig,
) => {
  const bandStart = getBandStartMinutes(band);
  const bandEnd = getBandEndMinutes(band);
  const start = Math.max(timeToBandMinutes(schedule.startTime, band), bandStart);
  const end = Math.min(timeToBandMinutes(schedule.endTime, band), bandEnd);
  const top = ((start - bandStart) / band.slotMinutes) * band.slotHeight;
  const height = Math.max(
    ((end - start) / band.slotMinutes) * band.slotHeight,
    band.slotHeight,
  );

  return { top, height };
};

const getBandTimeLabels = (band: ScheduleBandConfig) =>
  Array.from({ length: getBandSpanMinutes(band) / 60 + 1 }, (_, index) => {
    const hour = (band.startHour + index) % 24;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

const getMidnightRowIndex = (band: ScheduleBandConfig) => {
  if (!band.crossesMidnight) return -1;
  return ((24 - band.startHour) * 60) / band.slotMinutes;
};

function ScheduleBlock({
  schedule,
  band,
  className,
}: {
  schedule: ClassScheduleItem;
  band: ScheduleBandConfig;
  className?: string;
}) {
  const { top, height } = getBlockStyleInBand(schedule, band);
  const isOnline = (schedule.studyMode ?? "").toUpperCase() === "ONLINE";

  return (
    <div
      className={`absolute inset-x-1 overflow-hidden rounded-md border border-l-[3px] px-1.5 py-0.5 text-[10px] leading-tight shadow-sm transition hover:z-10 hover:scale-[1.02] hover:shadow-md sm:inset-x-1.5 sm:px-2 sm:py-1 sm:text-[11px] ${getStudyModeBlockStyles(schedule.studyMode)}`}
      style={{ top, height }}
      title={`${className ?? "Buổi học"} (${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)})`}
    >
      <p className="truncate font-semibold">{className ?? "Buổi học"}</p>
      <p className="truncate text-[9px] opacity-80 sm:text-[10px]">
        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
      </p>
      <p
        className={`mt-0.5 hidden truncate rounded px-1 py-0.5 text-[9px] font-semibold uppercase sm:inline-flex ${getStudyModeBadgeStyles(schedule.studyMode)}`}
      >
        {isOnline ? "Online" : "Offline"}
      </p>
    </div>
  );
}

function ScheduleWeekBand({
  band,
  schedulesByDay,
  weekOffset,
  todayDayValue,
  className,
}: {
  band: ScheduleBandConfig;
  schedulesByDay: Map<string, ClassScheduleItem[]>;
  weekOffset: number;
  todayDayValue: string;
  className?: string;
}) {
  const bandHeight = getBandHeight(band);
  const slotCount = getBandSlotCount(band);
  const timeLabels = getBandTimeLabels(band);
  const midnightRowIndex = getMidnightRowIndex(band);
  const bandHasSchedules = weekDays.some((day) =>
    (schedulesByDay.get(day.value) ?? []).some((schedule) =>
      isScheduleInBand(schedule, band),
    ),
  );

  return (
    <div className="border-b border-emerald-200/70 last:border-b-0">
      <div className="flex items-center justify-between gap-3 border-b border-emerald-200/60 bg-emerald-100/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ${
              band.id === "day"
                ? "bg-amber-100 text-amber-800"
                : "bg-indigo-100 text-indigo-800"
            }`}
          >
            {band.id === "day" ? "☀" : "☾"}
          </span>
          <div>
            <p className="text-xs font-semibold text-emerald-900">{band.label}</p>
            <p className="text-[10px] text-emerald-700/70">{band.subtitle}</p>
          </div>
        </div>
        {!bandHasSchedules ? (
          <span className="text-[10px] text-emerald-700/60">Không có lịch</span>
        ) : null}
      </div>

      <div className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))]">
        <div
          className="relative border-r border-emerald-200/60 bg-emerald-50/80"
          style={{ height: bandHeight }}
        >
          {timeLabels.map((label, index) => (
            <div
              key={`${band.id}-${label}`}
              className="absolute right-1.5 -translate-y-1/2 text-[9px] font-medium text-emerald-700/60"
              style={{
                top: index * (60 / band.slotMinutes) * band.slotHeight,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {weekDays.map((day, dayIndex) => {
          const daySchedules = (schedulesByDay.get(day.value) ?? []).filter(
            (schedule) => isScheduleInBand(schedule, band),
          );
          const isToday = weekOffset === 0 && day.value === todayDayValue;

          return (
            <div
              key={`${band.id}-${day.value}`}
              className={`relative border-r border-emerald-200/60 last:border-r-0 ${
                isToday ? "bg-emerald-100/35" : ""
              }`}
              style={{ height: bandHeight }}
            >
              {Array.from({ length: slotCount }).map((_, index) => {
                const isCaroLight = (dayIndex + index) % 2 === 0;
                const isMidnightRow = index === midnightRowIndex;

                return (
                  <div
                    key={index}
                    className={`absolute inset-x-0 border-t ${
                      isMidnightRow
                        ? "border-t-2 border-indigo-300/60"
                        : "border-emerald-200/35"
                    } ${isCaroLight ? "bg-emerald-50/90" : "bg-green-100/40"}`}
                    style={{
                      top: index * band.slotHeight,
                      height: band.slotHeight,
                    }}
                  />
                );
              })}

              {daySchedules.map((schedule) => (
                <ScheduleBlock
                  key={`${band.id}-${schedule.id}`}
                  schedule={schedule}
                  band={band}
                  className={className}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleListCard({
  schedule,
  className,
}: {
  schedule: ClassScheduleItem;
  className?: string;
}) {
  const dayLabel =
    weekDays.find((day) => day.value === schedule.dayOfWeek)?.label ??
    schedule.dayOfWeek;
  const isOnline = (schedule.studyMode ?? "").toUpperCase() === "ONLINE";

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 transition hover:border-violet-200 hover:bg-violet-50/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">{className ?? "Buổi học"}</p>
          <p className="text-xs text-slate-500">{dayLabel}</p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStudyModeBadgeStyles(schedule.studyMode)}`}
        >
          {getStudyModeLabel(schedule.studyMode)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-violet-500" />
          {dayLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-slate-400" />
          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
        </span>
      </div>

      {isOnline && schedule.meetingUrl ? (
        <a
          href={schedule.meetingUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700"
        >
          <Video className="h-3.5 w-3.5" />
          Link học online
        </a>
      ) : schedule.location ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          {schedule.location}
        </p>
      ) : null}
    </div>
  );
}

const ScheduleStudent = () => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [weekOffset, setWeekOffset] = useState(0);
  const [enrollCode, setEnrollCode] = useState("");

  const { data: myClasses = [], isLoading: isLoadingClasses } =
    useGetMyClassesQuery();
  const { mutateAsync: enrollClassroom, isPending: isEnrolling } =
    useEnrollClassroomMutation();

  const handleEnroll = async () => {
    const normalizedCode = enrollCode.trim().toUpperCase();
    if (!normalizedCode) {
      toast.error("Vui lòng nhập mã lớp.");
      return;
    }

    try {
      const response = await enrollClassroom({ code: normalizedCode });
      toast.success(response.message || "Tham gia lớp học thành công.");
      setEnrollCode("");
    } catch {
      toast.error("Không thể tham gia lớp học. Vui lòng kiểm tra mã lớp.");
    }
  };

  const effectiveClassId = selectedClassId || myClasses[0]?.id || "";

  const { data: schedules = [], isLoading: isLoadingSchedules } =
    useGetClassSchedulesQuery(effectiveClassId || undefined);

  const selectedClass = useMemo(
    () => myClasses.find((item) => item.id === effectiveClassId),
    [myClasses, effectiveClassId],
  );

  const schedulesByDay = useMemo(() => {
    const map = new Map<string, ClassScheduleItem[]>();
    for (const day of weekDays) {
      map.set(day.value, []);
    }
    for (const schedule of schedules) {
      const list = map.get(schedule.dayOfWeek) ?? [];
      list.push(schedule);
      map.set(schedule.dayOfWeek, list);
    }
    for (const day of weekDays) {
      const list = map.get(day.value) ?? [];
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
      map.set(day.value, list);
    }
    return map;
  }, [schedules]);

  const activeScheduleBands = useMemo(
    () =>
      SCHEDULE_BANDS.filter((band) =>
        weekDays.some((day) =>
          (schedulesByDay.get(day.value) ?? []).some((schedule) =>
            isScheduleInBand(schedule, band),
          ),
        ),
      ),
    [schedulesByDay],
  );

  const weekRangeLabel = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + weekOffset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatter = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return `${formatter.format(monday)} – ${formatter.format(sunday)}`;
  }, [weekOffset]);

  const todayDayValue = useMemo(() => {
    const map: Record<number, string> = {
      0: "SUNDAY",
      1: "MONDAY",
      2: "TUESDAY",
      3: "WEDNESDAY",
      4: "THURSDAY",
      5: "FRIDAY",
      6: "SATURDAY",
    };
    return map[new Date().getDay()];
  }, []);

  if (isLoadingClasses) {
    return (
      <div className="flex h-full items-center justify-center gap-2 p-8 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải danh sách lớp...
      </div>
    );
  }

  if (myClasses.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200/80 p-6 sm:p-8">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">
                Chưa có lớp học
              </h2>
              <p className="text-sm text-slate-500">
                Nhập mã lớp để tham gia và xem lịch học theo từng lớp.
              </p>
            </div>
            <div className="mx-auto h-px w-16 bg-linear-to-r from-transparent via-violet-300 to-transparent" />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Mã lớp học
            </label>
            <Input
              placeholder="Ví dụ: ABC123"
              className="h-10 border-slate-200/80 uppercase"
              value={enrollCode}
              onChange={(e) => setEnrollCode(e.target.value.toUpperCase())}
            />
            <Button
              className="h-10 w-full cursor-pointer rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              disabled={isEnrolling}
              onClick={handleEnroll}
            >
              {isEnrolling ? "Đang tham gia..." : "Tham gia lớp"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="space-y-4 border-b border-slate-200 pb-6">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-violet-600 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Lịch học
          </span>
          <div className="h-px w-full max-w-[100px] bg-linear-to-r from-violet-400 to-transparent" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Lịch học theo lớp
              </h2>
              <p className="max-w-2xl text-sm text-slate-500">
                Xem lịch theo tuần với 2 khung giờ: ban ngày và ban tối.
              </p>
            </div>
            <div className="border-l border-slate-200 pl-6 text-sm">
              <p className="text-xs text-slate-400 uppercase">Tổng buổi</p>
              <p className="font-semibold text-slate-900">
                {effectiveClassId ? schedules.length : "—"}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {viewMode === "calendar" ? "Lịch tuần" : "Danh sách lịch học"}
                </h3>
                <div className="mt-2 h-px w-14 bg-linear-to-r from-slate-300 to-transparent" />
                {selectedClass ? (
                  <p className="mt-2 text-sm text-slate-500">
                    {selectedClass.name} · {weekRangeLabel}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-xl border border-slate-200/80 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("calendar")}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      viewMode === "calendar"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Lịch tuần
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      viewMode === "list"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                    Danh sách
                  </button>
                </div>

                {viewMode === "calendar" ? (
                  <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer rounded-lg"
                      onClick={() => setWeekOffset((prev) => prev - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 cursor-pointer rounded-lg px-2.5 text-xs font-medium"
                      onClick={() => setWeekOffset(0)}
                    >
                      Hôm nay
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer rounded-lg"
                      onClick={() => setWeekOffset((prev) => prev + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-emerald-200/70 bg-emerald-50/30 shadow-sm">
              {isLoadingSchedules && schedules.length === 0 ? (
                <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-emerald-800/70">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải lịch học...
                </div>
              ) : schedules.length === 0 ? (
                <div className="px-6 py-16 text-center text-sm text-emerald-800/70">
                  Lớp này chưa có lịch học.
                </div>
              ) : viewMode === "calendar" ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[760px]">
                    <div className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))] border-b border-emerald-200/80 bg-linear-to-r from-emerald-100/80 via-green-50 to-emerald-100/80">
                      <div className="border-r border-emerald-200/60 p-2" />
                      {weekDays.map((day) => {
                        const isToday =
                          weekOffset === 0 && day.value === todayDayValue;

                        return (
                          <div
                            key={day.value}
                            className={`border-r border-emerald-200/60 px-2 py-3 text-center last:border-r-0 ${
                              isToday ? "bg-emerald-200/50" : ""
                            }`}
                          >
                            <p
                              className={`text-xs font-bold ${
                                isToday ? "text-emerald-800" : "text-emerald-900"
                              }`}
                            >
                              {day.short}
                            </p>
                            <p className="text-[10px] text-emerald-700/70">
                              {day.label}
                            </p>
                            {isToday ? (
                              <span className="mt-1 inline-block rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-medium text-white">
                                Hôm nay
                              </span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    {(activeScheduleBands.length > 0
                      ? activeScheduleBands
                      : SCHEDULE_BANDS
                    ).map((band) => (
                      <ScheduleWeekBand
                        key={band.id}
                        band={band}
                        schedulesByDay={schedulesByDay}
                        weekOffset={weekOffset}
                        todayDayValue={todayDayValue}
                        className={selectedClass?.name}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {schedules.map((schedule) => (
                    <ScheduleListCard
                      key={schedule.id}
                      schedule={schedule}
                      className={selectedClass?.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {viewMode === "calendar" && schedules.length > 0 ? (
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-4 py-2.5 text-xs text-emerald-800/80">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-amber-100 text-[10px]">
                    ☀
                  </span>
                  Ban ngày 06:00–18:00
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-100 text-[10px]">
                    ☾
                  </span>
                  Ban tối 18:00–03:00
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-5 rounded border border-orange-300 border-l-[3px] border-l-orange-500 bg-orange-50" />
                  Offline
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-5 rounded border border-sky-300 border-l-[3px] border-l-sky-500 bg-sky-100" />
                  Online
                </span>
              </div>
            ) : null}
          </section>

          <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white xl:sticky xl:top-24 xl:self-start">
            <section className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Chọn lớp học
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lịch hiển thị theo lớp đã chọn
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-slate-100" />

              <Select
                value={effectiveClassId}
                onValueChange={(value) => {
                  setSelectedClassId(value);
                  setWeekOffset(0);
                }}
              >
                <SelectTrigger className="h-11 cursor-pointer rounded-xl border-slate-200/80 bg-white">
                  <SelectValue placeholder="Chọn lớp học" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {myClasses.map((classroom) => (
                    <SelectItem
                      key={classroom.id}
                      value={classroom.id}
                      className="cursor-pointer"
                    >
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedClass ? (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm">
                  <p className="font-medium text-slate-900">
                    {selectedClass.name}
                  </p>
                  {selectedClass.code ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Mã lớp: {selectedClass.code}
                    </p>
                  ) : null}
                  {selectedClass.teacherName ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Giáo viên: {selectedClass.teacherName}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="space-y-4 border-t border-slate-200/80 p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Tham gia thêm lớp
                  </h3>
                  <p className="text-xs text-slate-500">
                    Đăng ký lớp mới bằng mã lớp
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Nhập mã lớp"
                  className="h-10 border-slate-200/80 uppercase"
                  value={enrollCode}
                  onChange={(e) => setEnrollCode(e.target.value.toUpperCase())}
                />
                <Button
                  variant="outline"
                  className="h-10 w-full cursor-pointer rounded-xl border-slate-200/80"
                  disabled={isEnrolling}
                  onClick={handleEnroll}
                >
                  {isEnrolling ? "Đang tham gia..." : "Tham gia lớp"}
                </Button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ScheduleStudent;
