import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server.js";

export const getOnebyConversationId = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity)
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });

    const organizationId = identity.orgId as string;

    if (!organizationId)
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Organization ID not found",
      });

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation)
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });

    if (conversation.organizationId !== organizationId)
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization  not found",
      });

    const contactSession = await ctx.db.get(conversation.contactSessionId);
    return contactSession;
  },
});
