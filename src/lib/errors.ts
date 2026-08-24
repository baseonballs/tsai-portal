/**
 * Narrow an unknown caught value to a message.
 *
 * `catch (e: any)` asserts something TypeScript cannot know: a caught value is `unknown`, because
 * anything can be thrown. Annotating it `any` makes `e.message` compile and yield `undefined` at
 * runtime when the thrown thing was not an Error — which is how "Error: undefined" reaches a user.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return String(error)
}
