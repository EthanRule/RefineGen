
import { NextAuthOptions, getServerSession } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { redirect } from "next/navigation";

export const authConfig: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
};

export async function LoginIsRequiredServer() {
  const session = await getServerSession(authConfig);
  if (!session) return redirect("/");
}