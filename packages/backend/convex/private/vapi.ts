import { Vapi, VapiClient } from "@vapi-ai/server-sdk";
import { ConvexError } from "convex/values";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { decryptKey } from "../lib/encryption";

export const getPhonenumbers = action({
  args: {},
  handler: async (ctx): Promise<Vapi.PhoneNumbersListResponseItem[]> => {
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
        message: "Organization not found",
      });

    const [VapiPluginPrivate, VapiPluginPublic] = await Promise.all([
      ctx.runQuery(internal.system.plugins.getByOrganizationServiceAndType, {
        keyType: "private",
        organizationId,
        service: "vapi",
      }),
      ctx.runQuery(internal.system.plugins.getByOrganizationServiceAndType, {
        keyType: "public",
        organizationId,
        service: "vapi",
      }),
    ]);

    if (!VapiPluginPrivate || !VapiPluginPublic) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Vapi plugin not found",
      });
    }

    const privateKeyName = VapiPluginPrivate.keyName;
    const publicKeyName = VapiPluginPublic.keyName;

    const apiPrivateKey = await decryptKey(VapiPluginPrivate.encryptedKey);
    const apiPublicKey = await decryptKey(VapiPluginPublic.encryptedKey);

    if (!privateKeyName || !publicKeyName) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Vapi plugin api keys not found",
      });
    }

    if (!apiPrivateKey || !apiPublicKey) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Can't decrypt Vapi plugin api keys",
      });
    }

    const vapiClient = new VapiClient({
      token: apiPrivateKey,
    });

    const phoneNumbers = await vapiClient.phoneNumbers.list();

    return phoneNumbers;
  },
});

export const getAssistants = action({
  args: {},
  handler: async (ctx): Promise<Vapi.Assistant[]> => {
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
        message: "Organization not found",
      });

    const [VapiPluginPrivate, VapiPluginPublic] = await Promise.all([
      ctx.runQuery(internal.system.plugins.getByOrganizationServiceAndType, {
        keyType: "private",
        organizationId,
        service: "vapi",
      }),
      ctx.runQuery(internal.system.plugins.getByOrganizationServiceAndType, {
        keyType: "public",
        organizationId,
        service: "vapi",
      }),
    ]);

    if (!VapiPluginPrivate || !VapiPluginPublic) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Vapi plugin not found",
      });
    }

    const privateKeyName = VapiPluginPrivate.keyName;
    const publicKeyName = VapiPluginPublic.keyName;

    const apiPrivateKey = await decryptKey(VapiPluginPrivate.encryptedKey);
    const apiPublicKey = await decryptKey(VapiPluginPublic.encryptedKey);

    if (!privateKeyName || !publicKeyName) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Vapi plugin api keys not found",
      });
    }

    if (!apiPrivateKey || !apiPublicKey) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Can't decrypt Vapi plugin api keys",
      });
    }

    const vapiClient = new VapiClient({
      token: apiPrivateKey,
    });

    const assistants = await vapiClient.assistants.list();

    return assistants;
  },
});
