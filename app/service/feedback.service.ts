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

export type ClassroomFeedbackReply = {
  id: string;
  content: string;
  type: "TEACHER" | "STUDENT" | string;
  authorName: string;
  avatar: string | null;
  createdAt: string;
  children?: ClassroomFeedbackReply[];
};

export type ClassroomFeedbackItem = {
  id: string;
  studentName: string;
  rating: number;
  feedback: string;
  avatar: string | null;
  createdAt: string;
  replies?: ClassroomFeedbackReply[];
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

export type CreateReviewReplyPayload = {
  content: string;
  parentReplyId?: string | null;
};

export type CreateReviewReplyResponse = {
  message?: string;
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

  createReviewReply: async (
    reviewId: string,
    payload: CreateReviewReplyPayload,
  ): Promise<CreateReviewReplyResponse> => {
    const res: AxiosResponse<CreateReviewReplyResponse> =
      await axiosClient.post(`/review-replies/${reviewId}`, payload);

    return res.data;
  },
};
