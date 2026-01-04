import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];
const SESSION_COOKIE_NAME = "recettes_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les assets statiques et API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // fichiers statiques (images, fonts, etc.)
  ) {
    return NextResponse.next();
  }

  // Vérifier si la route est publique
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Récupérer le token de session
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Si pas de session et route protégée → redirect vers login
  if (!sessionToken && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si session existe et on est sur /login → redirect vers /recipes
  if (sessionToken && isPublicPath) {
    const recipesUrl = new URL("/recipes", request.url);
    return NextResponse.redirect(recipesUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico).*)",
  ],
};
