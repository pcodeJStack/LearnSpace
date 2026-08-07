"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import {
  FeedbackService,
  type CreateReviewReplyPayload,
  type CreateReviewReplyResponse,
} from "@/app/service/feedback.service";

type ErrorResponse = {
  message?: string;
};

type CreateReviewReplyVariables = {
  reviewId: string;
  payload: CreateReviewReplyPayload;
};

export const useCreateReviewReplyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateReviewReplyResponse,
    AxiosError<ErrorResponse>,
    CreateReviewReplyVariables
  >({
    mutationKey: ["review-reply"],
    mutationFn: ({ reviewId, payload }) =>
      FeedbackService.createReviewReply(reviewId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["classroom-feedback"] });
    },
  });
};
