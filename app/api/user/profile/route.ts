import { changeUserName, getUserData } from "@/services/user.service";
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

    const userData = await getUserData(user.id);
    if (!userData) {
      return NextResponse.json(
        { success: false, message: "فشل جلب بيانات المستخدم" },
        { status: 401 },
      );
    }

    const { picture: profileImage, id, name, email, createdAt } = userData;

    return NextResponse.json({
      success: true,
      data: {
        id,
        name,
        email,
        createdAt,
        profileImage,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

const PATCH = async (request: NextRequest) => {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 },
      );
    }
    const { name } = (await request.json()) as {
      name: string;
    };

    if (!name) {
      return NextResponse.json(
        { success: false, message: "الاسم مطلوب" },
        { status: 400 },
      );
    }

    if (name.trim().length > 50) {
      return NextResponse.json(
        { success: false, message: "الاسم يجب ألا يتجاوز 50 حرفاً" },
        { status: 400 },
      );
    }

    const nameUpdated = await changeUserName(user.id, name);
    if (!nameUpdated) {
      return NextResponse.json(
        { success: false, message: "فشل تعديل الاسم" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "تم تعديل الاسم بنجاح" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { GET, PATCH };
