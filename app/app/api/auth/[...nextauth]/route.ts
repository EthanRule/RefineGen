import { authConfig } from "@/lib/auth";
import NextAuth from "next-auth/next";

// The `handler` is a function created by calling NextAuth with your authentication configuration.
// This function handles authentication requests (like sign in, sign out, callback, etc.) for NextAuth.
const handler = NextAuth(authConfig);

// In Next.js 13+ (with the app directory and route handlers), you export HTTP method handlers (like GET, POST) from your route files.
// By exporting `handler` as both GET and POST, you tell Next.js to use this handler function for both GET and POST requests to this API route.
// This is required because NextAuth expects to handle both GET (for things like sign-in pages) and POST (for authentication callbacks) requests.
export { handler as GET, handler as POST };