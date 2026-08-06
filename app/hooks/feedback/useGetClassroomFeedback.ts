"use client";

import { useQuery } from "@tanstack/react-query";

import {
  FeedbackService,
  type ClassroomFeedbackResponse,
} from "@/app/service/feedback.service";

type UseGetClassroomFeedbackParams = {
  classroomId?: string;
  page?: number;
  size?: number;
};

export const useGetClassroomFeedbackQuery = ({
  classroomId,
  page = 0,
  size = 10,
}: UseGetClassroomFeedbackParams) => {
  return useQuery<ClassroomFeedbackResponse>({
    queryKey: ["classroom-feedback", classroomId, page, size],
    queryFn: () =>
      FeedbackService.getClassroomFeedback({
        classroomId: classroomId!,
        page,
        size,
      }),
    enabled: Boolean(classroomId),
  });
};
