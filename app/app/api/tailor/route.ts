import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import ResumeTailor from "@/lib/services/ResumeTailor";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeFilePath, jobDescription } = await request.json();

    // Validate inputs
    if (!resumeFilePath) {
      return Response.json(
        { error: "Resume file path is required" },
        { status: 400 }
      );
    }

    if (!jobDescription || !jobDescription.trim()) {
      return Response.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error:
            "OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.",
        },
        { status: 500 }
      );
    }

    console.log("Starting resume tailoring...");
    console.log("Resume file path:", resumeFilePath);
    console.log("Job description length:", jobDescription.length);

    const resumeTailor = new ResumeTailor();

    const result = await resumeTailor.tailorResume({
      resumeFilePath,
      jobDescription,
      userId: session.user?.email || "",
      githubAccessToken: session.accessToken,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
