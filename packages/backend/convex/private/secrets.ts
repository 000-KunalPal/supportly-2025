import { ConvexError, v } from "convex/values";
import { internal } from "../_generated/api.js";
import { mutation } from "../_generated/server.js";

export const upsert = mutation({
  args: {
    service: v.union(v.literal("vapi")),
    keyType: v.union(
      v.literal("private"),
      v.literal("public"),
      v.literal("api_key")
    ),
    apiKey: v.string(),
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

    // TODO: CHECK FOR SUBSCRIPTION

    await ctx.runMutation(internal.system.secrets.upsert, {
      organizationId,
      apiKey: args.apiKey,
      keyType: "private",
      service: args.service,
    });
  },
});

export const upsertBothKeys = mutation({
  args: {
    service: v.union(v.literal("vapi")),
    keys: v.object({
      publicKey: v.string(),
      privateKey: v.string(),
    }),
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

    await ctx.runMutation(internal.system.secrets.upsertBoth, {
      organizationId,
      publicKey: args.keys.publicKey,
      privateKey: args.keys.privateKey,
      service: args.service,
    });
  },
});
