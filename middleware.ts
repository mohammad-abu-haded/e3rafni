import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "./middleware/auth.middleware";
import { Role } from "./app/generated/prisma/enums";

const middleware = async (request: NextRequest) => {
  console.log("Here is a Middleware.");
  
  switch (request.nextUrl.pathname) {
    case "/login":
      return NextResponse.next();

    case "/signup":
        const searchParams = request.nextUrl.searchParams;
      if (!searchParams || !searchParams.get('complete') ) {
        return NextResponse.next();
      } 
      else {
        return authMiddleware(request, [Role.ADMIN, Role.USER]);
      } 

    default:
      break;
  }
};

export const config = {
  matcher: ["/:path*"],
};

export { middleware };
