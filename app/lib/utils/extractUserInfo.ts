// Helper function to extract user info from session

export function extractUserInfo(session: any) {
  return {
    userId: session?.user?.id || undefined,
    userEmail: session?.user?.email || undefined,
  };
}
