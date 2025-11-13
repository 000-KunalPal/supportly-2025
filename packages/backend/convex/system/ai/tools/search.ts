import { createTool } from "@convex-dev/agent";
import { generateText } from "ai";
import z from "zod";
import { internal } from "../../../_generated/api";
import { SEARCH_INTERPRETER_PROMPT } from "../agents/prompt";
// import { openrouter } from "../providers";
import { google } from "@ai-sdk/google";
import { rag } from "../rag";

export const searchTool = createTool({
  description: "Search for relevant documents to answer user queries.",
  args: z.object({
    query: z
      .string()
      .describe("The search query to find relevant information."),
  }),
  handler: async (ctx, args) => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      { threadId: ctx.threadId }
    );

    if (!conversation) {
      return "Conversation not found";
    }

    const orgId = conversation.organizationId;

    const searchResults = await rag.search(ctx, {
      namespace: orgId,
      query: args.query,
      limit: 5,
    });

    const contextText = `Found results in ${searchResults.entries
      .map((e) => e.title || null)
      .filter((t) => t !== null)
      .join(", ")}. Here is the context:\n\n${searchResults.text}`;

    const response = await generateText({
      messages: [
        {
          role: "system",
          content: SEARCH_INTERPRETER_PROMPT,
        },
        {
          role: "user",
          content: `User asked: "${args.query}"\n\nSearch results: ${contextText}`,
        },
      ],
      model: google("gemini-2.0-flash"),
    });

    return response.text;
  },
});
