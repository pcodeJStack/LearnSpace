import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { env } from "@/config/env";
import { FEEDBACK_API } from "@/constants/api-endpoints";

type RouteContext = {
  params: Promise<{ classroomId: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  try {
    const { classroomId } = await context.params;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") ?? "0";
    const size = searchParams.get("size") ?? "10";

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = new URL(
      `${env.API_URL}${FEEDBACK_API.GET_BY_CLASSROOM(classroomId)}`,
    );
    backendUrl.searchParams.set("page", page);
    backendUrl.searchParams.set("size", size);

    const res = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Không thể tải feedback" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET CLASSROOM FEEDBACK ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
