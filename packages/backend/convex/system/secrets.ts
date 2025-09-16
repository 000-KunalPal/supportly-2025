import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

export const upsertBoth = internalMutation({
  args: {
    organizationId: v.string(),
    service: v.union(v.literal("vapi")),
    publicKey: v.string(),
    privateKey: v.string(),
  },
  handler: async (ctx, args) => {
    const { organizationId, service, publicKey, privateKey } = args;

    // Create key names
    const publicKeyName = `${organizationId}-${service}-public`;
    const privateKeyName = `${organizationId}-${service}-private`;

    // Store both keys in parallel using Promise.all
    await Promise.all([
      ctx.runMutation(internal.system.plugins.upsert, {
        organizationId,
        service,
        apiKey: publicKey,
        keyType: "public",
        keyName: publicKeyName,
      }),
      ctx.runMutation(internal.system.plugins.upsert, {
        organizationId,
        service,
        apiKey: privateKey,
        keyType: "private",
        keyName: privateKeyName,
      }),
    ]);
  },
});

export const upsert = internalMutation({
  args: {
    organizationId: v.string(),
    service: v.union(v.literal("vapi")),
    keyType: v.union(
      v.literal("private"),
      v.literal("public"),
      v.literal("api_key")
    ),
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const keyName = `${args.organizationId}-${args.service}-${args.keyType}`;

    await ctx.runMutation(internal.system.plugins.upsert, {
      organizationId: args.organizationId,
      service: args.service,
      apiKey: args.apiKey,
      keyType: args.keyType,
      keyName,
    });
  },
});
