import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard"],
};

export async function middleware(request: NextRequest) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}
