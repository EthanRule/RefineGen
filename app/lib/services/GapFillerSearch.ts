interface GapFiller {
  projectName: string;
  description: string;
  skills: string[];
  relevance: number;
  githubUrl: string;
}

interface GapAnalysis {
  missingSkills: string[];
  experienceGaps: string[];
  keywordGaps: string[];
  priority: "high" | "medium" | "low";
}

export default class GapFillerSearch {
  async findGapFillers(
    gaps: GapAnalysis,
    userId: string,
    githubAccessToken?: string
  ): Promise<GapFiller[]> {
    try {
      if (githubAccessToken) {
        const repos = await this.fetchUserRepos(githubAccessToken);
        const gapFillers = await this.analyzeReposForGaps(repos, gaps);
        return gapFillers;
      }
      return [];
    } catch (error) {
      console.error("GitHub analysis failed:", error);
      return [];
    }
  }

  private async fetchUserRepos(accessToken: string): Promise<any[]> {
    const response = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=30",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "TailorApply",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();

    // Filter for relevant repos: smaller size, recent activity, has language
    return repos
      .filter((repo: any) => repo.size < 50000) // Skip massive repos
      .filter((repo: any) => repo.language || repo.description) // Must have identifiable info
      .slice(0, 15); // Top 15 most recent
  }

  private async analyzeReposForGaps(
    repos: any[],
    gaps: GapAnalysis
  ): Promise<GapFiller[]> {
    const gapFillers: GapFiller[] = [];
    const allMissingSkills = [...gaps.missingSkills, ...gaps.keywordGaps].map(
      (s) => s.toLowerCase()
    );

    for (const repo of repos) {
      // Extract skills from repo metadata
      const skills: string[] = [];

      // Add primary language
      if (repo.language) {
        skills.push(repo.language.toLowerCase());
      }

      // Add topics as skills
      if (repo.topics) {
        repo.topics.forEach((topic: string) =>
          skills.push(topic.toLowerCase())
        );
      }

      // Extract skills from description
      if (repo.description) {
        const descSkills = this.extractSkillsFromText(repo.description);
        skills.push(...descSkills.map((s) => s.toLowerCase()));
      }

      // Calculate relevance: does this repo address any missing skills?
      const matchingSkills = skills.filter((skill) =>
        allMissingSkills.includes(skill)
      );
      const relevance =
        matchingSkills.length / Math.max(1, allMissingSkills.length);

      if (relevance > 0.1) {
        // At least 10% relevance
        gapFillers.push({
          projectName: repo.name,
          description:
            repo.description || `A ${repo.language || "software"} project`,
          skills: [...new Set(skills)], // Remove duplicates
          relevance,
          githubUrl: repo.html_url,
        });
      }
    }

    // Sort by relevance and return top 5
    return gapFillers.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  private extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      "react",
      "vue",
      "angular",
      "nextjs",
      "typescript",
      "javascript",
      "python",
      "java",
      "nodejs",
      "express",
      "django",
      "flask",
      "spring",
      "docker",
      "kubernetes",
      "aws",
      "azure",
      "gcp",
      "mongodb",
      "postgresql",
      "mysql",
      "redis",
      "git",
      "ci",
      "cd",
      "jenkins",
      "github",
      "gitlab",
      "rest",
      "api",
      "graphql",
      "microservices",
      "serverless",
    ];

    const textLower = text.toLowerCase();
    return commonSkills.filter((skill) => textLower.includes(skill));
  }
}

export type { GapFiller };
