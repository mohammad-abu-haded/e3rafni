import { DEFAULT_PAGE_SIZE } from "@/constant/pagination";
import { getPublicRooms } from "@/services/room.service";
import { getAuthUser } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

const GET = async (request: NextRequest) => {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") ?? 1);

    const { publicRooms, total } = await getPublicRooms(
      user.id,
      page,
      DEFAULT_PAGE_SIZE,
    );
    return NextResponse.json(
      {
        success: true,
        data: {
          rooms: publicRooms,
          total,
          page,
          limit: DEFAULT_PAGE_SIZE,
          totalPages: Math.ceil(total / DEFAULT_PAGE_SIZE),
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { GET };
