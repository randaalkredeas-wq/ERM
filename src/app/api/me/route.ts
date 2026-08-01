import { NextResponse } from "next/server";

import { handleApiError, requireApiUser } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await requireApiUser();
    return NextResponse.json({ data: user });
  } catch (error) {
    return handleApiError(error);
  }
}
