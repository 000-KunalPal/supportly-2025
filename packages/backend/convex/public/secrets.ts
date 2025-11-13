import { ConvexError, v } from "convex/values";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { decryptKey } from "../lib/encryption";

export const getVapiSecrets = action({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const [VapiPluginPrivate, VapiPluginPublic] = await Promise.all([
      ctx.runQuery(internal.system.plugins.getByOrganizationServiceAndType, {
        keyType: "private",
        organizationId: args.organizationId,
        service: "vapi",
      }),
      ctx.runQuery(internal.system.plugins.getByOrganizationServiceAndType, {
        keyType: "public",
        organizationId: args.organizationId,
        service: "vapi",
      }),
    ]);

    if (!VapiPluginPrivate || !VapiPluginPublic) {
      return null;
    }

    const privateKeyName = VapiPluginPrivate.keyName;
    const publicKeyName = VapiPluginPublic.keyName;

    const encryptionKey = process.env.ENCRYPTION_KEY;

    if (!encryptionKey) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "ENCRYPTION_KEY environment variable is not set",
      });
    }

    const apiPrivateKey = await decryptKey(
      VapiPluginPrivate.encryptedKey,
      encryptionKey
    );
    const apiPublicKey = await decryptKey(
      VapiPluginPublic.encryptedKey,
      encryptionKey
    );

    if (!privateKeyName || !publicKeyName) {
      return null;
    }

    if (!apiPrivateKey || !apiPublicKey) {
      return null;
    }

    return {
      apiPublicKey,
    };
  },
});
