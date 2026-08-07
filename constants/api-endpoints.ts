export const AUTH_API = {
  LOGIN: "/auth/login",
  CUSTOMER_REGISTER: "/auth/register",
  REFRESH_TOKEN: "/auth/refresh-token",
  LOGOUT: "/auth/logout",
  CHANGE_PASSWORD: "/auth/change-password",
  GET_ACCOUNTS: "/auth/accounts",
  ACCOUNT_BLOCK: (accountId: string) => `/auth/account/${accountId}/block`,
};

export const STUDENT_API = {
  PROFILE: "/student",
  SUBMIT_QUIZ: (quizId: string) => `/student/quizzes/${quizId}/submit`,
  GET_QUIZ_RESULT: (quizId: string) => `/student/quizzes/${quizId}/result`,
};

export const FEEDBACK_API = {
  CREATE_TEACHER_FEEDBACK: "/feedback-teacher",
  GET_BY_CLASSROOM: (classroomId: string) => `/classroom/${classroomId}`,
  CREATE_REVIEW_REPLY: (reviewId: string) => `/review-replies/${reviewId}`,
};
export const CLASS_API = {
  CREATE_CLASS: "/class",
  GET_CLASSES: "/classes",
  GET_CLASS_DETAIL: (classId: string) => `/classes/${classId}`,
  UPDATE_CLASS: (classId: string) => `/class/${classId}`,
  DELETE_CLASS: (classId: string) => `/class/${classId}`,
  GET_MY_CLASSES: "/my-classes",
  ENROLL_CLASSROOM: "/enrolling-classroom",
  ASSIGN_TEACHER: (classId: string) => `/class/${classId}/assign-teacher`,
  REMOVE_TEACHER: (classId: string) => `/class/${classId}/remove-teacher`,
  SNAP_MATERIALS: (classId: string) => `/class/${classId}/snap-materials`,
  GET_STUDENTS: (classroomId: string) => `/class/${classroomId}/students`,
};

export const MATERIALS_API = {
  CREATE_MATERIAL: (classroomId: string) => `/${classroomId}/materials`,  
  GET_MATERIALS: (classroomId: string) => `/${classroomId}/materials`,
  GET_MATERIAL_DETAIL: (materialId: string) => `/materials/${materialId}`,
  UPDATE_MATERIAL: (materialId: string) => `/materials/${materialId}`,
  DELETE_MATERIAL: (materialId: string) => `/materials/${materialId}`,
  GET_ALL_MATERIALS: "/materials",
  CREATE_NEW_MATERIAL: "/materials",
};  
export const Lesson_API = {
  CREATE_LESSON: "/lesson",
  GET_LESSONS: (materialId: string) => `/${materialId}/lessons`,
  GET_LESSON_DETAIL: (lessonId: string) => `/lessons/${lessonId}`,
  UPDATE_LESSON: (lessonId: string) => `/lesson/${lessonId}`,
  DELETE_LESSON: (lessonId: string) => `/lesson/${lessonId}`,
};

export const LessonResource_API = {
  CREATE: "/lessonResource",
  GET_BY_LESSON: (snapLessonId: string) => `/${snapLessonId}/lessonResources`,
  UPDATE: (lessonResourceId: string) => `/lessonResource/${lessonResourceId}`,
  DELETE: (lessonResourceId: string) => `/lessonResource/${lessonResourceId}`,
};

export const Record_API = {
  CREATE: "/lessonVideo",
  UPDATE: (lessonVideoId: string) => `/lessonVideo/${lessonVideoId}`,
  DELETE: (lessonVideoId: string) => `/lessonVideo/${lessonVideoId}`,
};

export const SCHEDULE_API = {
  CREATE: (classroomId: string) => `/${classroomId}/schedules`,
  UPDATE: (classroomId: string, scheduleId: string) =>
    `/${classroomId}/schedules/${scheduleId}`,
  DELETE: (classroomId: string, scheduleId: string) =>
    `/${classroomId}/schedules/${scheduleId}`,
};

export const CLASSROOM_MATERIAL_API = {
  UPDATE: (classroomMaterialId: string) =>
    `/classroomMaterial/${classroomMaterialId}`,
  DELETE: (classroomMaterialId: string) =>
    `/classroomMaterial/${classroomMaterialId}`,
};

export const SNAP_CLASSROOM_MATERIAL_API = {
  GET_BY_CLASSROOM: (classroomId: string) => `/${classroomId}/materials`,
  DELETE: (snapClassroomMaterialId: string) =>
    `/${snapClassroomMaterialId}/materials`,
  UPDATE_ORDER: (snapClassroomMaterialId: string) =>
    `/${snapClassroomMaterialId}/order`,
};

export const TEACHER_API = {
  GET_ALL: "/teachers",
  PROFILE: "/teacher",
  GET_CLASSROOMS: (teacherId: string) => `/teacher/${teacherId}/classrooms`,
  GET_MY_CLASSROOMS: "/teacher/classrooms",
  GET_SCHEDULE: (teacherId: string) => `/teachers/${teacherId}/schedule`,
  GRADE_SUBMISSION: (submissionId: string) =>
    `/teacher/submissions/${submissionId}/grade`,
};
export const LESSON_QUIZ_API = {
  CREATE: "/lesson-quiz",
  LIST: "/lesson-quizs",
  ASSIGN: "/assign",
  UPDATE_ASSIGN: (snapLessonQuizId: string) => `/assign/${snapLessonQuizId}`,
  UNASSIGN: (snapLessonQuizId: string) => `/snapLessonQuiz/${snapLessonQuizId}`,
  GET_BY_ID: (quizId: string) => `/lesson-quiz/${quizId}`,
  CHECK_CODE: (quizId: string) => `/lesson-quiz/checkingLessonQuizCode/${quizId}`,
  CREATE_VERSION: (lessonQuizId: string) => `/lesson-quiz/${lessonQuizId}/version`,
  UPDATE_QUESTIONS: (quizId: string) => `/${quizId}/questions`,
  UPDATE: (lessonQuizId: string) => `/lessonQuiz/${lessonQuizId}`,
  GET_BY_LESSON: (snapLessonId: string) => `/lesson/${snapLessonId}`,
  PENDING_SUBMISSIONS: (snapLessonQuizId: string) =>
    `/snap-lesson-quizzes/${snapLessonQuizId}/pending`,
  GRADED_SUBMISSIONS: (snapLessonQuizId: string) =>
    `/snap-lesson-quizzes/${snapLessonQuizId}/graded`,
};

export const VIDEO_API = {
  UPLOAD: "/videos/upload",
  PRESIGN: "/videos/presign",
  PLAY: (snapLessonId: string) => `/videos/play/${snapLessonId}`,
};