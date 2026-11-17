import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "./middleware/auth.middleware";
import { Role } from "./app/generated/prisma/enums";
import { PROTECTED_ROUTES } from "./constant/routes.constants";

const middleware = async (request: NextRequest) => {
  switch (request.nextUrl.pathname) {
    case "/login":
      return NextResponse.next();

    case "/signup":
      const searchParams = request.nextUrl.searchParams;
      if (!searchParams || !searchParams.get("complete")) {
        return NextResponse.next();
      } else {
        return authMiddleware(request, [Role.ADMIN, Role.USER]);
      }

    default: {
      const isProtected = PROTECTED_ROUTES.some((route) => {
        const pattern = route.replace(/\[.*?\]/g, "[^/]+");
        return new RegExp(`^${pattern}(/.*)?$`).test(request.nextUrl.pathname);
      });

      if (isProtected) {
        return authMiddleware(request, [Role.ADMIN, Role.USER]);
      }

      return NextResponse.next();
    }
  }
};

export const config = {
  matcher: ["/:path*"],
};

export { middleware };
