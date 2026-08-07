import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { env } from "@/config/env";
import { FEEDBACK_API } from "@/constants/api-endpoints";

type Params = {
  params: Promise<{
    reviewId: string;
  }>;
};

export async function POST(req: Request, { params }: Params) {
  try {
    const { reviewId } = await params;
    const body = await req.json();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${env.API_URL}${FEEDBACK_API.CREATE_REVIEW_REPLY(reviewId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Gửi phản hồi thất bại" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("REVIEW REPLY ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
