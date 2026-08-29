import {
  getProfilePictureURL,
  updateProfilePicture,
} from "@/services/image.service";
import { verifyToken } from "@/utils/auth";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const POST = async (request: NextRequest) => {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "يرجى تسجيل الدخول للوصول إلى هذه الصفحة",
        },
        { status: 401 },
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      const response = NextResponse.json(
        {
          success: false,
          message: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى",
        },
        { status: 401 },
      );
      response.cookies.delete("token");
      return response;
    }
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "الصورة مطلوبة",
        },
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "نوع الصورة غير مدعوم",
        },
        { status: 400 },
      );
    }

    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: "حجم الصورة يجب ألا يتجاوز 5 MB",
        },
        { status: 400 },
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = image.type.split("/")[1];
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    const imageUrl = `/uploads/profiles/${fileName}`;
    try {
      const res = await updateProfilePicture(user.id, imageUrl);
      if (!res) {
        return NextResponse.json({
          success: false,
          message: "حدث خطأ اثناء رفع الصورة، يرجى المحاولة مرة أخرى",
        });
      }
    } catch (error) {
      await unlink(filePath);
      return NextResponse.json({
        success: false,
        message: "حدث خطأ اثناء رفع الصورة، يرجى المحاولة مرة أخرى",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "تم رفع الصورة بنجاح",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء رفع الصورة",
      },
      { status: 500 },
    );
  }
};

const GET = async (request: NextRequest) => {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "يرجى تسجيل الدخول للوصول إلى هذه الصفحة",
        },
        { status: 401 },
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      const response = NextResponse.json(
        {
          success: false,
          message: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى",
        },
        { status: 401 },
      );
      response.cookies.delete("token");
      return response;
    }
    const imageUrl = await getProfilePictureURL(user.id);

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "لا توجد صورة شخصية",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
        success: true,
        message: "تم الحصول على عنوان الصورة بنجاح",
        data: imageUrl
    })
  } catch (error) {
    console.error("Error fetching profile image:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب الصورة",
      },
      { status: 500 },
    );
  }
};

export { POST, GET };
