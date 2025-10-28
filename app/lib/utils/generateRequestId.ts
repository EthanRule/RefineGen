// This allows us to not mix up requests in the logs.
/*
  User A: [Request ID: abc123] Image generation started, userId: user_1, promptLength: 50
  User B: [Request ID: xyz789] Image generation started, userId: user_2, promptLength: 75
  User A: [Request ID: abc123] Deducting tokens, tokens_deducted: 10
  User B: [Request ID: xyz789] Validating prompt...
  User A: [Request ID: abc123] Image generation completed
*/

export function generateRequestId(): string {
  return (
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  );
}
