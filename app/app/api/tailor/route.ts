import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import ResumeTailor from "@/lib/services/ResumeTailor";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resume, jobDescription, prompt } = await request.json();

    const resumeTailor = new ResumeTailor();

    const result = await resumeTailor.tailorResume({
      resume,
      jobDescription,
      userId: session.user?.email || "",
      githubAccessToken: session.accessToken, // This is your GitHub token!
      prompt,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
