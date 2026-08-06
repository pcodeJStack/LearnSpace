import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";


export type PaginatedResponse<T> = {
  items: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  size: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  totalElements: number;
  totalPages: number;
};

export type CreateClassPayload = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
};
export type CreateClassResponse = {
  message?: string; 
}

export type UpdateClassPayload = {
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
};

export type UpdateClassVariables = {
	classroomId: string;
	payload: UpdateClassPayload;
};
export type UpdateClassResponse = {
  message?: string;
};

export type DeleteClassVariables = {
  classroomId: string;
};
export type DeleteClassResponse = {
  message?: string;
};
export type EnrollClassroomPayload = {
  code: string;
};

export type EnrollClassroomResponse = {
  message?: string;
};

export type AssignTeacherPayload = {
  teacherId: string;
};

export type AssignTeacherResponse = {
  message?: string;
};

export type RemoveTeacherResponse = {
  message?: string;
};

export type ClassroomWithTeacher = {
  classroomId: string;
  classroomName: string;
  code: string;
  description: string;
  status: string;
  totalStudent: number;
  startDate: string;
  endDate: string;
  teacher: {
    teacherId: string;
    fullName: string;
    email: string;
    avatar: string | null;
    specialization: string | null;
    yearsExperience: number | null;
  } | null;
};

export type ClassroomsWithTeacherResponse = {
  content: ClassroomWithTeacher[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

export type GetAllClassesFilter = {
  page: number;
  size: number;
  code: string;
  name: string; 
};
export type Class = {
  id: string;
  name: string;
  description: string;
  teacherId: string | null;
  teacherName: string;
  startDate: string;
  endDate: string;
  code: string;
  status: string;
  totalStudent: number;
  schedules: {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    studyMode: string;
    location: string | null;
    meetingUrl: string | null;
  }[];
};

export type MyClass = Class;


export const ClassService = {
  createClass: async (payload: CreateClassPayload): Promise<CreateClassResponse> => {
    const res: AxiosResponse<CreateClassResponse> = await axiosClient.post(
      "/class/create",
      payload,
    );

    return res.data;
  },

  updateClass: async (
    variables: UpdateClassVariables
  ): Promise<UpdateClassResponse> => {
    const { classroomId, payload } = variables;
    const res: AxiosResponse<UpdateClassResponse> = await axiosClient.put(
      `/class/${classroomId}`,
      payload,
    );
    return res.data;
  },
  deleteClass: async (
    variables: DeleteClassVariables
  ): Promise<DeleteClassResponse> => {
    const { classroomId } = variables;
    const res: AxiosResponse<DeleteClassResponse> = await axiosClient.delete(
      `/class/${classroomId}`,
    );
    return res.data;
  },
  getAllClasses: async (
    filter: GetAllClassesFilter,
  ): Promise<PaginatedResponse<Class>> => {
    const res: AxiosResponse<PaginatedResponse<Class>> = await axiosClient.get(
      "/class/getAll",
      {
        params: {
          page: filter.page,
          size: filter.size,
          name: cleanString(filter.name),
          code: cleanString(filter.code)
        },
      },
    );

    return res.data;
  },

  getMyClasses: async (): Promise<MyClass[]> => {
    const res: AxiosResponse<MyClass[]> = await axiosClient.get("/my-classes");

    return res.data;
  },

  enrollClassroom: async (
    payload: EnrollClassroomPayload,
  ): Promise<EnrollClassroomResponse> => {
    const res: AxiosResponse<EnrollClassroomResponse> = await axiosClient.post(
      "/enrolling-classroom",
      payload,
    );

    return res.data;
  },

  getClassroomsWithTeacher: async (
    page = 0,
    size = 10,
    hasTeacher?: boolean,
  ): Promise<ClassroomsWithTeacherResponse> => {
    const res: AxiosResponse<ClassroomsWithTeacherResponse> = await axiosClient.get(
      "/classrooms-with-teacher",
      {
        params: {
          page,
          size,
          hasTeacher: hasTeacher === undefined ? undefined : hasTeacher,
        },
      },
    );

    return res.data;
  },

  assignTeacher: async (
    classroomId: string,
    payload: AssignTeacherPayload,
  ): Promise<AssignTeacherResponse> => {
    const res: AxiosResponse<AssignTeacherResponse> = await axiosClient.post(
      `/class/${classroomId}/assign-teacher`,
      payload,
    );

    return res.data;
  },

  removeTeacher: async (
    classroomId: string,
  ): Promise<RemoveTeacherResponse> => {
    const res: AxiosResponse<RemoveTeacherResponse> = await axiosClient.delete(
      `/class/${classroomId}/remove-teacher`,
    );

    return res.data;
  },
};
const cleanString = (value?: string) =>
  value && value.trim() !== "" ? value.trim() : undefined;