import { 
  convexAuthNextjsMiddleware, 
  createRouteMatcher, 
  nextjsMiddlewareRedirect 
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/signin"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/profile(.*)"]);
const isCalendarRoute = createRouteMatcher(["/calendar(.*)"]);
const isBookRoute = createRouteMatcher(["/calendar/book(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();

  // Redirect authenticated users away from sign-in to the dashboard
  if (isSignInPage(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }

  // Redirect unauthenticated users to sign-in for protected dashboard routes
  if (isProtectedRoute(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }

  if (isCalendarRoute(request) && !isBookRoute(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }
});

export const config = {
  // Match all request paths except for static files
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
