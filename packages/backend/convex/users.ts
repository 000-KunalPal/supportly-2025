import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const addUser = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const orgId = identity.orgId;
    if (!orgId) throw new Error("No organization created !");

    await ctx.db.insert("users", {
      name: args.name,
      tokenIdentifier: "0001",
    });
  },
});
