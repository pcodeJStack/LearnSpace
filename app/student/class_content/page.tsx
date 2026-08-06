"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  MonitorPlay,
  UserPlus,
} from "lucide-react";
import { useGetMyClassesQuery } from "@/app/hooks/classes/useGetMyClasses";
import { useGetSnapMaterials } from "@/app/hooks/materials/useGetSnapMaterials";
import { useGetLessonResourcesQuery } from "@/app/hooks/lessonResource/useGetLessonResources";
import { useGetVideoQuery } from "@/app/hooks/videos/useGetVideoQuery";
import { useEnrollClassroomMutation } from "@/app/hooks/classes/useEnrollClassroom";
import { type MyClass } from "@/app/service/classroom.service";
import { useGetLessonQuizzesQuery } from "@/app/hooks/lessonQuiz/useGetLessonQuizzes";
import { VideoType } from "@/app/service/record.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LessonContentTabBar,
  type LessonContentTab,
} from "@/components/lesson/LessonContentTabBar";
import { LessonMaterialsList } from "@/components/lesson/LessonMaterialsList";
import { LessonModuleSidebar } from "@/components/lesson/LessonModuleSidebar";
import { LessonQuizList } from "@/components/lesson/LessonQuizList";
import { LessonQuizTakeModal } from "@/components/lesson/LessonQuizTakeModal";
import { LessonQuizResultModal } from "@/components/lesson/LessonQuizResultModal";
import {
  getSnapLessonIndicators,
  mergeLessonIndicators,
  useLessonSidebarIndicators,
} from "@/app/hooks/lesson/useLessonSidebarIndicators";
import {
  mergeLessonQuizzes,
  useLessonSidebarQuizzes,
} from "@/app/hooks/lesson/useLessonSidebarQuizzes";

type TabKey = LessonContentTab;

const getVideoTypeByTab = (tab: TabKey): VideoType | undefined => {
  if (tab === "preview") return "PREVIEW";
  if (tab === "replay") return "AFTER_LESSON";
  return undefined;
};

type SessionQuizRef = {
  quizId: string;
  title: string;
};

type Session = {
  id: string;
  title: string;
  lessonOrder?: number;
  hasMaterials: boolean;
  hasPreviewVideo: boolean;
  hasReplayVideo: boolean;
  hasQuiz: boolean;
  quizzes: SessionQuizRef[];
};

type Module = {
  id: string;
  title: string;
  sessions: Session[];
};

type ActiveSessionState = {
  module: Module;
  session: Session;
};

const emptyActiveSession: ActiveSessionState = {
  module: { id: "", title: "", sessions: [] },
  session: { id: "", title: "", hasMaterials: false, hasPreviewVideo: false, hasReplayVideo: false, hasQuiz: false, quizzes: [] },
};

function findActiveSession(
  modules: Module[],
  sessionId: string,
): ActiveSessionState {
  for (const courseModule of modules) {
    const session = courseModule.sessions.find((item) => item.id === sessionId);
    if (session) {
      return { module: courseModule, session };
    }
  }

  if (modules.length > 0 && modules[0].sessions.length > 0) {
    return { module: modules[0], session: modules[0].sessions[0] };
  }

  return emptyActiveSession;
}

const ClassContentManagement = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("replay");
  const [activeSessionId, setActiveSessionId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(
    undefined,
  );
  const [enrollCode, setEnrollCode] = useState("");
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeQuizTitle, setActiveQuizTitle] = useState<string | null>(null);
  const [activeSnapLessonQuizId, setActiveSnapLessonQuizId] = useState<
    string | null
  >(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [resultSnapLessonQuizId, setResultSnapLessonQuizId] = useState<
    string | null
  >(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const { data: myClasses = [], isLoading: isLoadingClasses } =
    useGetMyClassesQuery();
  const { mutateAsync: enrollClassroom, isPending: isEnrolling } =
    useEnrollClassroomMutation();

  const effectiveCourseId =
    selectedCourseId ?? myClasses[0]?.id ?? undefined;

  const {
    data: snapMaterials,
    isLoading: isLoadingMaterials,
    error: materialsError,
  } = useGetSnapMaterials(effectiveCourseId);

  const modules: Module[] = useMemo(() => {
    if (!Array.isArray(snapMaterials)) return [];
    return snapMaterials.map((material) => ({
      id: material.materialId,
      title: material.title,
      sessions: (material.lessons || []).map((lesson) => {
        const snapFlags = getSnapLessonIndicators(
          lesson.lessonVideos,
          lesson.lessonResources,
        );

        const lessonQuizzes = lesson.lessonQuizzes ?? [];

        return {
          id: lesson.lessonId,
          title: lesson.title,
          lessonOrder: lesson.lessonOrder,
          ...snapFlags,
          hasQuiz: lessonQuizzes.length > 0,
          quizzes: lessonQuizzes.map((quiz) => ({
            quizId: quiz.quizId,
            title: quiz.title,
          })),
          materials: [],
        };
      }),
    }));
  }, [snapMaterials]);

  const lessonIds = useMemo(
    () => modules.flatMap((courseModule) => courseModule.sessions.map((s) => s.id)),
    [modules],
  );
  const lessonIndicators = useLessonSidebarIndicators(lessonIds);
  const lessonQuizMap = useLessonSidebarQuizzes(lessonIds);

  const sidebarModules = useMemo(
    () =>
      modules.map((courseModule) => ({
        ...courseModule,
        sessions: courseModule.sessions.map((session) => {
          const merged = mergeLessonIndicators(
            {
              hasMaterials: session.hasMaterials,
              hasPreviewVideo: session.hasPreviewVideo,
              hasReplayVideo: session.hasReplayVideo,
            },
            lessonIndicators[session.id],
          );
          const quizMerged = mergeLessonQuizzes(
            session.quizzes,
            lessonQuizMap[session.id],
          );

          return {
            id: session.id,
            title: session.title,
            lessonOrder: session.lessonOrder,
            hasQuiz: quizMerged.hasQuiz,
            quizzes: quizMerged.quizzes,
            ...merged,
          };
        }),
      })),
    [modules, lessonIndicators, lessonQuizMap],
  );

  const resolvedSessionId = useMemo(() => {
    const allSessions = modules.flatMap(
      (courseModule) => courseModule.sessions,
    );
    if (
      activeSessionId &&
      allSessions.some((session) => session.id === activeSessionId)
    ) {
      return activeSessionId;
    }
    return modules[0]?.sessions[0]?.id ?? "";
  }, [activeSessionId, modules]);

  const activeSession = useMemo(
    () => findActiveSession(modules, resolvedSessionId),
    [modules, resolvedSessionId],
  );

  const activeVideoType = getVideoTypeByTab(activeTab);
  const shouldFetchPlayUrl =
    Boolean(resolvedSessionId) && Boolean(activeVideoType);

  const {
    data: playVideos = [],
    isLoading: isLoadingPlayUrl,
    isFetching: isFetchingPlayUrl,
  } = useGetVideoQuery(
    shouldFetchPlayUrl ? resolvedSessionId : undefined,
    activeVideoType,
  );
  const {
    data: lessonResources = [],
    isLoading: isLoadingLessonResources,
    isFetching: isFetchingLessonResources,
  } = useGetLessonResourcesQuery(resolvedSessionId || undefined);
  const {
    data: lessonQuizzes = [],
    isLoading: isLoadingLessonQuizzes,
  } = useGetLessonQuizzesQuery(resolvedSessionId || undefined);

  const selectContent = (sessionId: string, tab: TabKey, quizId?: string) => {
    setActiveSessionId(sessionId);
    setActiveTab(tab);
    setActiveQuizId(quizId ?? null);
  };

  const handleEnroll = async () => {
    const normalizedCode = enrollCode.trim().toUpperCase();
    if (!normalizedCode) {
      setEnrollMessage("Vui lòng nhập mã lớp.");
      return;
    }

    try {
      const response = await enrollClassroom({ code: normalizedCode });
      setEnrollMessage(response.message || "Tham gia lớp học thành công.");
      setEnrollCode("");
    } catch {
      setEnrollMessage("Không thể tham gia lớp học. Vui lòng kiểm tra mã lớp.");
    }
  };

  if (isLoadingClasses) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Đang tải lớp học...
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
                Nhập mã lớp để tham gia và xem tài liệu, video bài giảng.
              </p>
            </div>
            <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
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
            {enrollMessage ? (
              <p className="text-sm text-slate-600">{enrollMessage}</p>
            ) : null}
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
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200/70 bg-white px-5 py-3">
        <Select
          value={effectiveCourseId ?? ""}
          onValueChange={(val) => {
            setSelectedCourseId(val);
            setActiveSessionId("");
          }}
        >
          <SelectTrigger className="h-10 min-w-60 cursor-pointer rounded-xl border-slate-200/80 bg-white px-4 text-sm font-medium shadow-sm">
            <SelectValue placeholder="Chọn lớp học" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            align="start"
            sideOffset={6}
            className="rounded-xl border-slate-200 shadow-lg"
          >
            {myClasses.map((classroom: MyClass) => (
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
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 md:flex">
          <MonitorPlay className="h-3.5 w-3.5 text-violet-500" />
          Nội dung buổi học
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]">
        <section className="min-h-0 overflow-y-auto border-r border-slate-200/80 bg-slate-50/30 px-3 py-4 sm:px-4">
          <LessonModuleSidebar
            modules={sidebarModules}
            activeSessionId={resolvedSessionId}
            activeTab={activeTab}
            activeQuizId={activeQuizId}
            onSelectContent={selectContent}
            isLoading={isLoadingMaterials}
            errorMessage={
              materialsError
                ? `Lỗi: ${
                    materialsError instanceof Error
                      ? materialsError.message
                      : "Không thể tải dữ liệu"
                  }`
                : undefined
            }
            emptyMessage="Chưa có nội dung cho lớp học này."
          />
        </section>

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-white">
          <div className="shrink-0 overflow-x-auto">
            <LessonContentTabBar
              activeTab={activeTab}
              materialsCount={lessonResources.length}
              quizzesCount={lessonQuizzes.length}
              onChange={setActiveTab}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-5">
            {activeTab === "materials" ? (
              <LessonMaterialsList
                snapLessonId={activeSession.session.id}
                lessonTitle={activeSession.session.title}
                resources={lessonResources}
                isLoading={isLoadingLessonResources || isFetchingLessonResources}
              />
            ) : activeTab === "quiz" ? (
              !activeSession.session.id ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center text-sm text-slate-500">
                  Chọn buổi học để xem bài tập
                </div>
              ) : isLoadingLessonQuizzes ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải bài tập...
                </div>
              ) : (
                <LessonQuizList
                  lessonTitle={activeSession.session.title}
                  quizzes={lessonQuizzes}
                  mode="student"
                  activeQuizId={activeQuizId}
                  onQuizSelect={(quiz) => setActiveQuizId(quiz.quizId)}
                  onQuizClick={(quiz) => {
                    if (!quiz.snapLessonQuizId) return;
                    setActiveQuizId(quiz.quizId);
                    setActiveQuizTitle(quiz.title);
                    setActiveSnapLessonQuizId(quiz.snapLessonQuizId);
                    setIsQuizModalOpen(true);
                  }}
                  onResultClick={(quiz) => {
                    if (!quiz.snapLessonQuizId) return;
                    setActiveQuizId(quiz.quizId);
                    setResultSnapLessonQuizId(quiz.snapLessonQuizId);
                    setIsResultModalOpen(true);
                  }}
                />
              )
            ) : (
              <div className="space-y-5">
               
                {!activeSession.session.id ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center text-sm text-slate-500">
                    Chọn buổi học để xem video
                  </div>
                ) : isLoadingPlayUrl || isFetchingPlayUrl ? (
                  <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải video...
                  </div>
                ) : playVideos.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center text-sm text-slate-500">
                    {activeTab === "preview"
                      ? "Chưa có video xem trước cho buổi học này"
                      : "Chưa có video xem lại cho buổi học này"}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {playVideos.map((video, index) => (
                      <div
                        key={video.id ?? `${video.url}-${index}`}
                        className="space-y-2"
                      >
                        {video.title ? (
                          <p className="text-sm font-semibold text-slate-900">
                            {video.title}
                          </p>
                        ) : null}
                        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-black shadow-sm">
                          <div className="aspect-video">
                            <video
                              key={video.url}
                              src={video.url}
                              controls
                              preload="metadata"
                              playsInline
                              className="h-full w-full"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <LessonQuizTakeModal
        lessonQuizId={activeQuizId}
        snapLessonQuizId={activeSnapLessonQuizId}
        fallbackTitle={activeQuizTitle ?? undefined}
        open={isQuizModalOpen}
        onOpenChange={(open) => {
          setIsQuizModalOpen(open);
          if (!open) {
            setActiveSnapLessonQuizId(null);
            setActiveQuizTitle(null);
          }
        }}
        onViewResult={(snapLessonQuizId) => {
          setResultSnapLessonQuizId(snapLessonQuizId);
          setIsResultModalOpen(true);
        }}
      />

      <LessonQuizResultModal
        snapLessonQuizId={resultSnapLessonQuizId}
        open={isResultModalOpen}
        onOpenChange={(open) => {
          setIsResultModalOpen(open);
          if (!open) setResultSnapLessonQuizId(null);
        }}
      />
    </div>
  );
};

export default ClassContentManagement;
