import { clerkMiddleware, ClerkMiddlewareAuth } from "@clerk/nextjs/server";

export default clerkMiddleware();
export const config = {
  publicRoutes: ["/", "/auth/signin", "/auth/signup"],
  async beforeAuth(req: Request): Promise<Response | null> {
    try {
      // Custom logic
      return null;
    } catch (error) {
      console.error("Middleware error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

// export default ClerkMiddlewareAuth({

// });
