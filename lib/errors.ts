import { ConvexError } from "convex/values";

/**
 * Format any application or server error into a user-friendly string.
 * Strips technical Convex wrapper formatting, stack traces, and internal server logs.
 */
export function formatError(err: any): string {
  if (!err) return "Une erreur est survenue.";

  // Handle ConvexError instances
  if (err instanceof ConvexError) {
    return typeof err.data === "string" ? err.data : JSON.stringify(err.data);
  }

  // Handle objects with a serialize data field
  if (err && typeof err === "object" && "data" in err && err.data) {
    return typeof err.data === "string" ? err.data : JSON.stringify(err.data);
  }

  const errMessage = typeof err.message === "string" ? err.message : String(err);

  // Clean up standard ConvexError wrapper prefix
  if (errMessage.includes("ConvexError: ")) {
    return errMessage.split("ConvexError: ")[1].trim();
  }

  // Clean up Server Error with stack trace
  if (errMessage.includes("Uncaught Error: ")) {
    const parts = errMessage.split("Uncaught Error: ");
    const rest = parts[parts.length - 1];
    return rest.split(/\s+at\s+/)[0].trim();
  }

  const serverErrorMatch = errMessage.match(/Server Error\s*(.*)/i);
  if (serverErrorMatch && serverErrorMatch[1]) {
    const rest = serverErrorMatch[1];
    return rest.split(/\s+at\s+/)[0].trim();
  }

  return errMessage;
}
