"use client";

import { Suspense, useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { MonitorPlay, FileText } from "lucide-react";
import { useGetTeacherClassrooms } from "@/app/hooks/teacher/useGetTeacherClassrooms";
import { useGetSnapMaterials } from "@/app/hooks/materials/useGetSnapMaterials";
import { UploadCloud, Loader2, Film, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {Select,SelectTrigger,SelectContent,SelectItem, SelectValue} from "@/components/ui/select";
import { usePresignVideo } from "@/app/hooks/videos/usePresignVideoMutation";
import { useCreateNewRecord } from "@/app/hooks/records/useCreateNewRecord";
import { useGetVideoQuery } from "@/app/hooks/videos/useGetVideoQuery";
import { useDeleteVideoMutation } from "@/app/hooks/videos/useDeleteVideoMutation";
import { useUpdateVideoMutation } from "@/app/hooks/videos/useUpdateVideoMutation";
import { queryClient } from "@/app/lib/react-query";
import { VideoType } from "@/app/service/record.service";
import type { PlayVideoItem } from "@/app/service/video.service";
import { useCreateLessonResourceMutation } from "@/app/hooks/lessonResource/useCreateLessonResource";
import { useGetLessonResourcesQuery } from "@/app/hooks/lessonResource/useGetLessonResources";
import {
  useDeleteLessonResourceMutation,
  useUpdateLessonResourceMutation,
} from "@/app/hooks/lessonResource/useLessonResourceMutations";
import { useUploadFile } from "@/app/hooks/lessonResource/useUploadAuto";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LessonResourceItem } from "@/app/service/lessonResource.service";
import { TeacherClassroom } from "@/app/service/teacher.service";
import type { LessonQuiz } from "@/app/service/material.service";
import {LessonContentTabBar,type LessonContentTab} from "@/components/lesson/LessonContentTabBar";
import { LessonModuleSidebar } from "@/components/lesson/LessonModuleSidebar";
import { LessonQuizPanel } from "@/components/lesson/LessonQuizPanel";
import { useGetLessonQuizzesQuery } from "@/app/hooks/lessonQuiz/useGetLessonQuizzes";
import {getSnapLessonIndicators,mergeLessonIndicators,useLessonSidebarIndicators} from "@/app/hooks/lesson/useLessonSidebarIndicators";
import { mergeLessonQuizzes, useLessonSidebarQuizzes } from "@/app/hooks/lesson/useLessonSidebarQuizzes";

type TabKey = LessonContentTab;

const getVideoTypeByTab = (tab: TabKey): VideoType | undefined => {
  if (tab === "preview") return "PREVIEW";
  if (tab === "replay") return "AFTER_LESSON";
  return undefined;
};

const getLessonVideoId = (video: PlayVideoItem) =>
  video.lessonVideoId ?? video.id;

const getVideoTabLabel = (tab: TabKey) =>
  tab === "preview" ? "video xem trước" : "video xem lại";

const getDefaultVideoTypeForTab = (tab: TabKey): VideoType =>
  tab === "preview" ? "PREVIEW" : "AFTER_LESSON";

type Session = {
  id: string;
  title: string;
  lessonOrder?: number;
  hasMaterials: boolean;
  hasPreviewVideo: boolean;
  hasReplayVideo: boolean;
  hasQuiz: boolean;
  quizzes: LessonQuiz[];
  materials: string[];
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
  session: { id: "", title: "", hasMaterials: false, hasPreviewVideo: false, hasReplayVideo: false, hasQuiz: false, quizzes: [], materials: [] },
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

// modules are derived from snap-materials API (materials -> sessions)

type UploadedMaterialFile = {
  name: string;
  url: string;
  size: number;
};

function LessonMaterialsPanel({
  snapLessonId,
  lessonTitle,
  classroomId,
}: {
  snapLessonId: string;
  lessonTitle: string;
  classroomId?: string;
}) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState("FILE");
  const [url, setUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMaterialFile[]>([]);
  const [editingResource, setEditingResource] =
    useState<LessonResourceItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNote, setEditNote] = useState("");
  const [pendingDeleteResource, setPendingDeleteResource] =
    useState<LessonResourceItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync: createLessonResource, isPending, error } =
    useCreateLessonResourceMutation();
  const { mutateAsync: updateLessonResource, isPending: isUpdatingResource } =
    useUpdateLessonResourceMutation();
  const { mutateAsync: deleteLessonResource, isPending: isDeletingResource } =
    useDeleteLessonResourceMutation();
  const { upload, isUploading } = useUploadFile("document");
  const { data: resources = [], isLoading: isLoadingResources } =
    useGetLessonResourcesQuery(snapLessonId);

  const canSubmit = useMemo(() => {
    if (isPending || isUploading || !snapLessonId) return false;

    const hasResource =
      type === "FILE" ? uploadedFiles.length > 0 : url.trim().length > 0;

    return title.trim().length > 0 && hasResource;
  }, [title, snapLessonId, type, uploadedFiles, url, isPending, isUploading]);

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const uploadedUrl = await upload(file);
          return {
            name: file.name,
            url: uploadedUrl,
            size: file.size,
          };
        }),
      );

      setUploadedFiles((prev) => [...prev, ...uploaded]);
    } catch (uploadError) {
      console.error(uploadError);
      toast.error("Upload file thất bại");
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      const urls =
        type === "FILE"
          ? uploadedFiles.map((file) => file.url)
          : [url.trim()];

      await createLessonResource({
        title: title.trim(),
        note: note.trim(),
        type,
        urls,
        snapLessonId,
      });

      toast.success("Tạo tài liệu thành công");
      setTitle("");
      setNote("");
      setUrl("");
      setUploadedFiles([]);
    } catch (submitError) {
      console.error(submitError);
      toast.error("Tạo tài liệu thất bại");
    }
  };

  const openEditResource = (resource: LessonResourceItem) => {
    setEditingResource(resource);
    setEditTitle(resource.title);
    setEditNote(resource.note ?? "");
  };

  const closeEditResource = () => {
    if (isUpdatingResource) return;
    setEditingResource(null);
    setEditTitle("");
    setEditNote("");
  };

  const handleConfirmUpdateResource = async () => {
    if (!editingResource) return;

    const nextTitle = editTitle.trim();
    if (!nextTitle) {
      toast.error("Vui lòng nhập tên tài liệu");
      return;
    }

    try {
      await updateLessonResource({
        lessonResourceId: editingResource.id,
        title: nextTitle,
        note: editNote.trim(),
        snapLessonId,
        classroomId,
      });
      toast.success("Đã cập nhật tài liệu");
      closeEditResource();
    } catch (updateError) {
      console.error(updateError);
      toast.error("Không thể cập nhật tài liệu. Vui lòng thử lại.");
    }
  };

  const handleConfirmDeleteResource = async () => {
    if (!pendingDeleteResource) return;

    try {
      await deleteLessonResource({
        lessonResourceId: pendingDeleteResource.id,
        snapLessonId,
        classroomId,
      });
      toast.success("Đã xóa tài liệu");
      setPendingDeleteResource(null);
    } catch (deleteError) {
      console.error(deleteError);
      toast.error("Không thể xóa tài liệu. Vui lòng thử lại.");
    }
  };

  if (!snapLessonId) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Chọn buổi học để xem tài liệu
      </div>
    );
  }

  return (
    <>
    <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
      <Card className="border-slate-200 shadow-sm">
        <div className="space-y-4 p-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Danh sách tài liệu
            </h3>
            <p className="mt-1 text-xs text-slate-500">Buổi: {lessonTitle}</p>
          </div>

          {isLoadingResources ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải danh sách tài liệu...
            </div>
          ) : resources.length > 0 ? (
            <div className="space-y-3">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {resource.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {resource.note || "Không có ghi chú"}
                      </p>
                      <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {resource.type}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        disabled={isUpdatingResource}
                        onClick={() => openEditResource(resource)}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        disabled={isDeletingResource}
                        onClick={() => setPendingDeleteResource(resource)}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Xóa
                      </Button>
                    </div>
                  </div>

                  {resource.urls?.length > 0 ? (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                      {resource.urls.map((resourceUrl, index) => (
                        <a
                          key={index}
                          href={resourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm transition hover:bg-slate-50"
                        >
                          <span className="truncate text-slate-700">
                            {resource.type === "LINK"
                              ? resourceUrl
                              : `File ${index + 1}`}
                          </span>
                          <span className="text-slate-500">Mở →</span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Chưa có tài liệu cho buổi học này
            </div>
          )}
        </div>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <div className="space-y-4 p-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Thêm tài liệu
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Upload file hoặc thêm link cho buổi học
            </p>
          </div>

          <Input
            placeholder="Tên tài liệu"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FILE">FILE</SelectItem>
              <SelectItem value="LINK">LINK</SelectItem>
            </SelectContent>
          </Select>

          {type === "FILE" ? (
            <>
              <label
                onDrop={async (e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  await handleUploadFiles(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                className={`relative flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition ${
                  isDragging
                    ? "border-blue-400 bg-blue-50/40"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  disabled={isUploading}
                  onChange={async (e) => {
                    await handleUploadFiles(e.target.files);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />
                <UploadCloud className="mb-2 h-7 w-7 text-slate-500" />
                <p className="text-sm font-medium text-slate-800">
                  Kéo thả file vào đây
                </p>
                <p className="text-xs text-slate-500">hoặc bấm để chọn file</p>
                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
                  </div>
                ) : null}
              </label>

              {uploadedFiles.length > 0 ? (
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-lg bg-white p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() =>
                          setUploadedFiles((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <Input
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          )}

          <Textarea
            placeholder="Ghi chú"
            className="min-h-28"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {error?.response?.data?.message ? (
            <p className="text-xs text-rose-600">
              {error.response.data.message}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={!canSubmit}
              className="cursor-pointer"
              onClick={handleSubmit}
            >
              {isUploading
                ? "Đang upload..."
                : isPending
                  ? "Đang lưu..."
                  : "Tạo tài liệu"}
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <Dialog
      open={Boolean(editingResource)}
      onOpenChange={(open) => {
        if (!open) closeEditResource();
      }}
    >
      <DialogContent className="max-w-md rounded-2xl border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-slate-900">
            Cập nhật tài liệu
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Chỉnh sửa tên và ghi chú của tài liệu.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <label className="text-xs font-medium text-slate-600">
              Tên tài liệu
            </label>
            <Input
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              placeholder="Nhập tên tài liệu"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-slate-600">Ghi chú</label>
            <Textarea
              value={editNote}
              onChange={(event) => setEditNote(event.target.value)}
              placeholder="Nhập ghi chú"
              className="min-h-24"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer rounded-xl"
            disabled={isUpdatingResource}
            onClick={closeEditResource}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="cursor-pointer rounded-xl"
            disabled={isUpdatingResource || !editTitle.trim()}
            onClick={() => void handleConfirmUpdateResource()}
          >
            {isUpdatingResource ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog
      open={Boolean(pendingDeleteResource)}
      onOpenChange={(open) => {
        if (!open && !isDeletingResource) {
          setPendingDeleteResource(null);
        }
      }}
    >
      <AlertDialogContent className="max-w-sm rounded-2xl border-slate-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-semibold text-slate-900">
            Xóa tài liệu?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-slate-500">
            Bạn có chắc muốn xóa tài liệu{" "}
            <span className="font-medium text-slate-700">
              {pendingDeleteResource?.title || "không tiêu đề"}
            </span>
            ? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="cursor-pointer rounded-xl"
            disabled={isDeletingResource}
          >
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="cursor-pointer rounded-xl"
            disabled={isDeletingResource || !pendingDeleteResource}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirmDeleteResource();
            }}
          >
            {isDeletingResource ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa tài liệu"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

function VideoDocumentManagementContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>("replay");
  const [activeSessionId, setActiveSessionId] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoType, setVideoType] = useState<VideoType>("AFTER_LESSON");
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(
    undefined,
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const menu = searchParams.get("menu");
    const lessonId =
      searchParams.get("lessonId") ?? searchParams.get("snapLessonId") ?? "";
    const classId = searchParams.get("classId") ?? "";

    if (classId) {
      setSelectedCourseId(classId);
    }

    if (lessonId) {
      setActiveSessionId(lessonId);
    }

    if (menu === "records") {
      setActiveTab("replay");
    } else if (menu === "lessonResources") {
      setActiveTab("materials");
    }
  }, [searchParams]);
  const { data: teacherClassrooms } = useGetTeacherClassrooms();
  const classrooms: TeacherClassroom[] = teacherClassrooms ?? [];
  const effectiveCourseId =
    selectedCourseId ?? classrooms[0]?.classroomId ?? undefined;
  const {
    data: snapMaterials,
    isLoading,
    error,
  } = useGetSnapMaterials(effectiveCourseId);
  const { mutateAsync: getPresign } = usePresignVideo();
  const { mutateAsync: createRecord } = useCreateNewRecord();
  const { mutateAsync: deleteVideo, isPending: isDeletingVideo } =
    useDeleteVideoMutation();
  const { mutateAsync: updateVideo, isPending: isUpdatingVideo } =
    useUpdateVideoMutation();
  const [pendingDeleteVideo, setPendingDeleteVideo] =
    useState<PlayVideoItem | null>(null);
  const [editingVideo, setEditingVideo] = useState<PlayVideoItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVideoType, setEditVideoType] = useState<VideoType>("AFTER_LESSON");

  const modules: Module[] = useMemo(() => {
    if (!Array.isArray(snapMaterials)) return [];
    return snapMaterials.map((m) => ({
      id: m.materialId,
      title: m.title,
      sessions: (m.lessons || []).map((l) => {
        const snapFlags = getSnapLessonIndicators(
          l.lessonVideos,
          l.lessonResources,
        );

        const lessonQuizzes = l.lessonQuizzes ?? [];

        return {
          id: l.lessonId,
          title: l.title,
          lessonOrder: l.lessonOrder,
          ...snapFlags,
          hasQuiz: lessonQuizzes.length > 0,
          quizzes: lessonQuizzes,
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
          const snapQuizzes = session.quizzes.map((quiz) => ({
            quizId: quiz.quizId,
            title: quiz.title,
          }));
          const quizMerged = mergeLessonQuizzes(
            snapQuizzes,
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
    const allSessions = modules.flatMap((courseModule) => courseModule.sessions);
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
  const { data: lessonResources = [] } = useGetLessonResourcesQuery(
    resolvedSessionId || undefined,
  );
  const { data: lessonQuizzes = [] } = useGetLessonQuizzesQuery(
    resolvedSessionId || undefined,
  );

  const selectContent = (
    sessionId: string,
    tab: TabKey,
    _quizId?: string,
  ) => {
    setActiveSessionId(sessionId);
    setActiveTab(tab);
    setSelectedVideo(null);
    setVideoTitle("");
    if (tab === "preview") setVideoType("PREVIEW");
    else if (tab === "replay") setVideoType("AFTER_LESSON");
    else setVideoType("AFTER_LESSON");
  };
  const handleUploadVideo = async () => {
    if (!videoTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề video");
      return;
    }

    if (!selectedVideo) {
      toast.error("Vui lòng chọn video");
      return;
    }

    if (!activeSession.session.id) {
      toast.error("Vui lòng chọn buổi học");
      return;
    }

    setIsUploading(true);
    try {
      const { uploadUrl, fileKey } = await getPresign({
        fileName: selectedVideo.name,
        fileType: selectedVideo.type,
      });

      await fetch(uploadUrl, {
        method: "PUT",
        body: selectedVideo,
        headers: {
          "Content-Type": selectedVideo.type,
        },
      });

      await createRecord({
        title: videoTitle.trim(),
        videoType,
        fileKey,
        snapLessonId: activeSession.session.id,
      });

      toast.success("Upload video thành công");
      setSelectedVideo(null);
      setVideoTitle("");
      setVideoType(getDefaultVideoTypeForTab(activeTab));
      queryClient.invalidateQueries({
        queryKey: ["video", "play", activeSession.session.id, videoType],
      });
      queryClient.invalidateQueries({
        queryKey: ["snap-materials", effectiveCourseId],
      });
    } catch (error) {
      console.error(error);
      toast.error("Upload thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDeleteVideo = async () => {
    if (!pendingDeleteVideo || !activeVideoType) return;

    const videoId = getLessonVideoId(pendingDeleteVideo);

    if (!videoId) {
      toast.error("Không tìm thấy mã video để xóa");
      return;
    }

    if (!activeSession.session.id) {
      toast.error("Vui lòng chọn buổi học");
      return;
    }

    try {
      await deleteVideo({
        videoId,
        snapLessonId: activeSession.session.id,
        videoType: activeVideoType,
        classroomId: effectiveCourseId,
      });
      toast.success("Đã xóa video");
      setPendingDeleteVideo(null);
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa video. Vui lòng thử lại.");
    }
  };

  const openEditVideo = (video: PlayVideoItem) => {
    setEditingVideo(video);
    setEditTitle(video.title?.trim() ?? "");
    setEditVideoType(
      video.videoType ??
        activeVideoType ??
        getDefaultVideoTypeForTab(activeTab),
    );
  };

  const closeEditVideo = () => {
    if (isUpdatingVideo) return;
    setEditingVideo(null);
    setEditTitle("");
    setEditVideoType(getDefaultVideoTypeForTab(activeTab));
  };

  const handleConfirmUpdateVideo = async () => {
    if (!editingVideo) return;

    const videoId = getLessonVideoId(editingVideo);
    const title = editTitle.trim();

    if (!videoId) {
      toast.error("Không tìm thấy mã video để cập nhật");
      return;
    }

    if (!title) {
      toast.error("Vui lòng nhập tiêu đề video");
      return;
    }

    if (!activeSession.session.id) {
      toast.error("Vui lòng chọn buổi học");
      return;
    }

    try {
      await updateVideo({
        videoId,
        title,
        videoType: editVideoType,
        snapLessonId: activeSession.session.id,
        previousVideoType:
          editingVideo.videoType ??
          activeVideoType ??
          getDefaultVideoTypeForTab(activeTab),
        classroomId: effectiveCourseId,
      });
      toast.success("Đã cập nhật video");
      closeEditVideo();
    } catch (error) {
      console.error(error);
      toast.error("Không thể cập nhật video. Vui lòng thử lại.");
    }
  };

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
          <SelectTrigger
            className="
            cursor-pointer
      h-10
      min-w-60
      rounded-xl
      border-slate-200
      bg-background
      px-4
      text-sm
      font-medium
      shadow-sm
    "
          >
            <SelectValue placeholder="Chọn lớp học" />
          </SelectTrigger>

          <SelectContent
            position="popper"
            side="bottom"
            align="start"
            sideOffset={6}
            className="rounded-xl border-slate-200 shadow-lg"
          >
            {classrooms.map((classroom) => (
              <SelectItem
                className="cursor-pointer"
                key={classroom.classroomId}
                value={classroom.classroomId}
              >
                {classroom.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 md:flex">
          <MonitorPlay className="h-3.5 w-3.5 text-sky-500" />
          Quản lý buổi học
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]">
        <section className="min-h-0 overflow-y-auto border-r border-slate-200 bg-slate-50/30 px-3 py-4 sm:px-4">
          <LessonModuleSidebar
            modules={sidebarModules}
            activeSessionId={resolvedSessionId}
            activeTab={activeTab}
            onSelectContent={selectContent}
            isLoading={isLoading}
            errorMessage={
              error
                ? `Lỗi: ${error instanceof Error ? error.message : "Không thể tải dữ liệu"}`
                : undefined
            }
            emptyMessage="Chưa có dữ liệu. Vui lòng chọn lớp học."
          />
        </section>

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-white">
          <div className="shrink-0 overflow-x-auto">
            <LessonContentTabBar
              activeTab={activeTab}
              materialsCount={lessonResources.length}
              quizzesCount={lessonQuizzes.length}
              onChange={(tab) => {
                setActiveTab(tab);
                if (tab === "preview") setVideoType("PREVIEW");
                if (tab === "replay") setVideoType("AFTER_LESSON");
              }}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-4">
            {activeTab === "materials" ? (
              <LessonMaterialsPanel
                snapLessonId={activeSession.session.id}
                lessonTitle={activeSession.session.title}
                classroomId={effectiveCourseId}
              />
            ) : activeTab === "quiz" ? (
              <LessonQuizPanel
                snapLessonId={activeSession.session.id}
                lessonTitle={activeSession.session.title}
                classroomId={effectiveCourseId}
              />
            ) : (
              <Card className="border-slate-200 shadow-sm">
                <div className="space-y-6 p-6">
                  {/* Header */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {activeTab === "preview"
                        ? "Video xem trước"
                        : "Video xem lại"}
                    </h3>

                    <p className="text-sm text-slate-500">
                      Buổi học:{" "}
                      <span className="font-medium">
                        {activeSession.session.title}
                      </span>
                    </p>
                  </div>

                  {!activeSession.session.id ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                      Chọn buổi học để xem video
                    </div>
                  ) : isLoadingPlayUrl || isFetchingPlayUrl ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tải video...
                    </div>
                  ) : playVideos.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                      {activeTab === "preview"
                        ? "Chưa có video xem trước cho buổi học này"
                        : "Chưa có video xem lại cho buổi học này"}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {playVideos.map((video, index) => {
                        const lessonVideoId = getLessonVideoId(video);

                        return (
                        <div
                          key={lessonVideoId ?? `${video.url}-${index}`}
                          className="space-y-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            {video.title ? (
                              <p className="text-sm font-semibold text-slate-900">
                                {video.title}
                              </p>
                            ) : (
                              <p className="text-sm font-medium text-slate-500">
                                Video {index + 1}
                              </p>
                            )}
                            <div className="flex shrink-0 items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                                disabled={!lessonVideoId || isUpdatingVideo}
                                onClick={() => openEditVideo(video)}
                              >
                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                Sửa
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="cursor-pointer border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                disabled={!lessonVideoId || isDeletingVideo}
                                onClick={() => setPendingDeleteVideo(video)}
                              >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Xóa
                              </Button>
                            </div>
                          </div>
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="aspect-video bg-black">
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
                        );
                      })}
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-2">
                    <h4 className="text-sm font-semibold text-slate-800">
                      Upload video mới
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Thêm video cho buổi học hiện tại
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-xs font-medium text-slate-600">
                        Tiêu đề video
                      </label>
                      <Input
                        placeholder="Ví dụ: Bài giảng buổi 1"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium text-slate-600">
                        Loại video
                      </label>
                      <Select
                        value={videoType}
                        onValueChange={(value) =>
                          setVideoType(value as VideoType)
                        }
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PREVIEW">Xem trước (PREVIEW)</SelectItem>
                          <SelectItem value="AFTER_LESSON">
                            Sau buổi học (AFTER_LESSON)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Upload area */}
                  <label
                    htmlFor="video-upload"
                    className="
        group
        flex
        min-h-[220px]
        cursor-pointer
        flex-col
        items-center
        justify-center
        rounded-2xl
        border-2
        border-dashed
        border-slate-200
        bg-slate-50
        p-6
        transition-all
        hover:border-blue-300
        hover:bg-blue-50/40
      "
                  >
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          setSelectedVideo(file);
                        }
                      }}
                    />

                    <div
                      className="
          mb-4
          rounded-full
          bg-white
          p-4
          shadow-sm
          transition-transform
          group-hover:scale-105
        "
                    >
                      <UploadCloud className="h-8 w-8 text-slate-600" />
                    </div>

                    <h4 className="font-medium text-slate-800">
                      Chọn video để upload
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      MP4, MKV, MOV...
                    </p>

                    {selectedVideo && (
                      <div
                        className="
            mt-5
            flex
            items-center
            gap-3
            rounded-xl
            border
            bg-white
            px-4
            py-3
            shadow-sm
          "
                      >
                        <Film className="h-5 w-5 text-blue-600" />

                        <div className="flex flex-col text-left">
                          <span className="max-w-[280px] truncate text-sm font-medium text-slate-800">
                            {selectedVideo.name}
                          </span>

                          <span className="text-xs text-slate-500">
                            {(selectedVideo.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Action */}
                  <div className="flex justify-end">
                    <Button
                      disabled={
                        !selectedVideo || !videoTitle.trim() || isUploading
                      }
                      onClick={handleUploadVideo}
                      className="h-10 cursor-pointer rounded-xl px-6"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang upload...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="mr-2 h-4 w-4" />
                          Upload video
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>

      <Dialog
        open={Boolean(editingVideo)}
        onOpenChange={(open) => {
          if (!open) closeEditVideo();
        }}
      >
        <DialogContent className="max-w-md rounded-2xl border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">
              Cập nhật video
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Chỉnh sửa tiêu đề và loại video.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-slate-600">
                Tiêu đề video
              </label>
              <Input
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                placeholder="Nhập tiêu đề video"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-slate-600">
                Loại video
              </label>
              <Select
                value={editVideoType}
                onValueChange={(value) => setEditVideoType(value as VideoType)}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PREVIEW">Xem trước (PREVIEW)</SelectItem>
                  <SelectItem value="AFTER_LESSON">
                    Xem lại (AFTER_LESSON)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer rounded-xl"
              disabled={isUpdatingVideo}
              onClick={closeEditVideo}
            >
              Hủy
            </Button>
            <Button
              type="button"
              className="cursor-pointer rounded-xl"
              disabled={isUpdatingVideo || !editTitle.trim()}
              onClick={() => void handleConfirmUpdateVideo()}
            >
              {isUpdatingVideo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingDeleteVideo)}
        onOpenChange={(open) => {
          if (!open && !isDeletingVideo) {
            setPendingDeleteVideo(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-sm rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-slate-900">
              Xóa {getVideoTabLabel(activeTab)}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              Bạn có chắc muốn xóa video{" "}
              <span className="font-medium text-slate-700">
                {pendingDeleteVideo?.title || "không tiêu đề"}
              </span>
              ? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer rounded-xl"
              disabled={isDeletingVideo}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="cursor-pointer rounded-xl"
              disabled={
                isDeletingVideo ||
                !pendingDeleteVideo ||
                !getLessonVideoId(pendingDeleteVideo)
              }
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmDeleteVideo();
              }}
            >
              {isDeletingVideo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa video"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function VideoDocumentManagement() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Đang tải nội dung lớp học...
        </div>
      }
    >
      <VideoDocumentManagementContent />
    </Suspense>
  );
}