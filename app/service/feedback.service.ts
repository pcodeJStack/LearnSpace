import type { AxiosResponse } from "axios";

import { axiosClient } from "@/app/lib/axiosClient";

export type CreateTeacherFeedbackPayload = {
  teacherId: string;
  classroomId: string;
  rating: number;
  feedback: string;
};

export type CreateTeacherFeedbackResponse = {
  message?: string;
};

export type ClassroomFeedbackItem = {
  id: string;
  studentName: string;
  rating: number;
  feedback: string;
  avatar: string | null;
  createdAt: string;
};

export type ClassroomFeedbackPage = {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
};

export type ClassroomFeedbackResponse = {
  content: ClassroomFeedbackItem[];
  page: ClassroomFeedbackPage;
};

export type GetClassroomFeedbackParams = {
  classroomId: string;
  page?: number;
  size?: number;
};

export const FeedbackService = {
  createTeacherFeedback: async (
    payload: CreateTeacherFeedbackPayload,
  ): Promise<CreateTeacherFeedbackResponse> => {
    const res: AxiosResponse<CreateTeacherFeedbackResponse> =
      await axiosClient.post("/feedback-teacher", payload);

    return res.data;
  },

  getClassroomFeedback: async (
    params: GetClassroomFeedbackParams,
  ): Promise<ClassroomFeedbackResponse> => {
    const { classroomId, page = 0, size = 10 } = params;
    const res: AxiosResponse<ClassroomFeedbackResponse> = await axiosClient.get(
      `/classroom/${classroomId}`,
      {
        params: { page, size },
      },
    );

    return res.data;
  },
};
