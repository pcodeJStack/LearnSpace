"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { useGetLessonQuizzesQuery } from "@/app/hooks/lessonQuiz/useGetLessonQuizzes";

import type { LessonQuizListItem } from "@/app/service/lessonQuiz.service";
import { LessonQuizList } from "@/components/lesson/LessonQuizList";
import {
  AssignQuizDialog,
  type AssignQuizFromLessonContext,
} from "@/components/quiz/AssignQuizDialog";
import {
  EditAssignQuizDialog,
  type EditAssignQuizContext,
} from "@/components/quiz/EditAssignQuizDialog";
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
import { useUnassignQuizMutation } from "@/app/hooks/lessonQuiz/useUnassignQuiz";
import { LessonQuizGradeModal } from "@/components/lesson/LessonQuizGradeModal";

type LessonQuizPanelProps = {
  snapLessonId: string;
  lessonTitle: string;
  classroomId?: string;
};

const getUnassignErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return "Không thể gỡ bài tập. Vui lòng thử lại.";
};

export function LessonQuizPanel({
  snapLessonId,
  lessonTitle,
  classroomId,
}: LessonQuizPanelProps) {
  const [assignContext, setAssignContext] =
    useState<AssignQuizFromLessonContext | null>(null);
  const [editContext, setEditContext] = useState<EditAssignQuizContext | null>(
    null,
  );
  const [pendingUnassignQuiz, setPendingUnassignQuiz] =
    useState<LessonQuizListItem | null>(null);
  const [gradeQuiz, setGradeQuiz] = useState<LessonQuizListItem | null>(null);

  const {
    data: quizzes = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetLessonQuizzesQuery(snapLessonId);
  const { mutateAsync: unassignQuiz, isPending: isUnassigningQuiz } =
    useUnassignQuizMutation();

  const defaultDisplayOrder = useMemo(
    () =>
      quizzes.reduce((max, quiz) => Math.max(max, quiz.displayOrder ?? 0), 0) +
      1,
    [quizzes],
  );

  if (!snapLessonId) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Chọn buổi học để xem bài tập
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-[#6c5ce7]" />
        Đang tải bài tập...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-100 bg-rose-50/60 px-6 py-10 text-center text-sm text-rose-700">
        Không thể tải bài tập buổi học
      </div>
    );
  }

  const openAssignDialog = () => {
    if (!classroomId) return;

    setAssignContext({
      mode: "from-lesson",
      snapLessonId,
      lessonTitle,
      classroomId,
      defaultDisplayOrder,
    });
  };

  const openEditDialog = (quiz: LessonQuizListItem) => {
    if (!quiz.snapLessonQuizId) return;

    setEditContext({
      snapLessonQuizId: quiz.snapLessonQuizId,
      snapLessonId,
      lessonTitle,
      lessonQuizId: quiz.quizId,
      quizTitle: quiz.title,
      required: quiz.required ?? true,
      maxAttempts: quiz.maxAttempts ?? 1,
      displayOrder: quiz.displayOrder ?? 1,
      classroomId,
    });
  };

  const handleConfirmUnassignQuiz = async () => {
    if (!pendingUnassignQuiz?.snapLessonQuizId) return;

    try {
      await unassignQuiz({
        snapLessonQuizId: pendingUnassignQuiz.snapLessonQuizId,
        snapLessonId,
        classroomId,
      });
      toast.success("Đã gỡ bài tập khỏi buổi học");
      setPendingUnassignQuiz(null);
      refetch();
    } catch (unassignError) {
      console.error(unassignError);
      toast.error(getUnassignErrorMessage(unassignError));
    }
  };

  return (
    <>
      <LessonQuizList
        lessonTitle={lessonTitle}
        quizzes={quizzes}
        mode="teacher"
        isRefreshing={isFetching && !isLoading}
        onAssignClick={classroomId ? openAssignDialog : undefined}
        onEditClick={openEditDialog}
        onUnassignClick={(quiz) => setPendingUnassignQuiz(quiz)}
        onGradeClick={(quiz) => setGradeQuiz(quiz)}
      />

      <AssignQuizDialog
        open={Boolean(assignContext)}
        onOpenChange={(open) => {
          if (!open) setAssignContext(null);
        }}
        context={assignContext}
        onSuccess={() => refetch()}
      />

      <EditAssignQuizDialog
        open={Boolean(editContext)}
        onOpenChange={(open) => {
          if (!open) setEditContext(null);
        }}
        context={editContext}
        onSuccess={() => refetch()}
      />

      <LessonQuizGradeModal
        open={Boolean(gradeQuiz?.snapLessonQuizId)}
        onOpenChange={(open) => {
          if (!open) setGradeQuiz(null);
        }}
        snapLessonQuizId={gradeQuiz?.snapLessonQuizId ?? null}
        quizTitle={gradeQuiz?.title}
      />

      <AlertDialog
        open={Boolean(pendingUnassignQuiz)}
        onOpenChange={(open) => {
          if (!open && !isUnassigningQuiz) {
            setPendingUnassignQuiz(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-sm rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-slate-900">
              Gỡ bài tập khỏi buổi học?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              Bạn có chắc muốn gỡ bài tập{" "}
              <span className="font-medium text-slate-700">
                {pendingUnassignQuiz?.title || "không tiêu đề"}
              </span>{" "}
              khỏi buổi học này? Học sinh sẽ không còn thấy bài tập này trong
              buổi học.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer rounded-xl"
              disabled={isUnassigningQuiz}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="cursor-pointer rounded-xl"
              disabled={
                isUnassigningQuiz || !pendingUnassignQuiz?.snapLessonQuizId
              }
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmUnassignQuiz();
              }}
            >
              {isUnassigningQuiz ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gỡ...
                </>
              ) : (
                "Gỡ bài tập"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
