import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server.js";

export const getOne = query({
  args: {
    service: v.union(v.literal("vapi")),
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

    return await ctx.db
      .query("plugins")
      .withIndex("by_organization_service_type", (q) =>
        q
          .eq("organizationId", organizationId)
          .eq("service", args.service)
          .eq("keyType", "private")
      )
      .unique();
  },
});

export const remove = mutation({
  args: {
    service: v.union(v.literal("vapi")),
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

    const existingPlugins = await ctx.db
      .query("plugins")
      .withIndex("by_organization_and_service", (q) =>
        q.eq("organizationId", organizationId).eq("service", args.service)
      )
      .collect();

    if (existingPlugins.length === 0)
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Plugins not found",
      });

    // Delete all plugins for this service and organization
    await Promise.all(
      existingPlugins.map((plugin) => ctx.db.delete(plugin._id))
    );
  },
});
