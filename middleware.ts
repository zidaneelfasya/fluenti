import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        const authPages = ["/login", "/register"];
        const isAuthPage = authPages.includes(req.nextUrl.pathname);

        if (!token && !isAuthPage) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        if (token && isAuthPage) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error("Middleware Error:", error);
        return NextResponse.next(); 
    }
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api/).*)",
    ],
};
