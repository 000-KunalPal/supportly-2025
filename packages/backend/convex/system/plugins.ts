import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { encryptKey } from "../lib/encryption";

export const upsert = internalMutation({
  args: {
    organizationId: v.string(),
    service: v.union(v.literal("vapi")),
    keyType: v.union(
      v.literal("private"),
      v.literal("public"),
      v.literal("api_key")
    ),
    keyName: v.string(),
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const encryptedKey = await encryptKey(args.apiKey);

    const existingPlugin = await ctx.db
      .query("plugins")
      .withIndex("by_organization_service_type", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("service", args.service)
          .eq("keyType", args.keyType)
      )
      .unique();

    if (existingPlugin) {
      return await ctx.db.patch(existingPlugin._id, {
        service: args.service,
        keyName: args.keyName,
        keyType: args.keyType,
      });
    } else {
      await ctx.db.insert("plugins", {
        organizationId: args.organizationId,
        service: args.service,
        keyType: args.keyType,
        encryptedKey,
        keyName: args.keyName,
        isActive: true,
      });
    }
  },
});

export const getByOrganizationServiceAndType = internalQuery({
  args: {
    organizationId: v.string(),
    service: v.union(v.literal("vapi")),
    keyType: v.union(
      v.literal("private"),
      v.literal("public"),
      v.literal("api_key")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plugins")
      .withIndex("by_organization_service_type", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("service", args.service)
          .eq("keyType", args.keyType)
      )
      .unique();
  },
});
