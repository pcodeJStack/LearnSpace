"use client";

import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import {
  FeedbackService,
  type CreateTeacherFeedbackPayload,
  type CreateTeacherFeedbackResponse,
} from "@/app/service/feedback.service";

type ErrorResponse = {
  message?: string;
};

export const useSubmitTeacherFeedbackMutation = () => {
  return useMutation<
    CreateTeacherFeedbackResponse,
    AxiosError<ErrorResponse>,
    CreateTeacherFeedbackPayload
  >({
    mutationKey: ["feedback-teacher"],
    mutationFn: (payload) => FeedbackService.createTeacherFeedback(payload),
  });
};
