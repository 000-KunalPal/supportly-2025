import { Agent } from "@convex-dev/agent";
import { components } from "../../../_generated/api";
import { openrouter } from "../providers";
import { SUPPORT_AGENT_PROMPT } from "./prompt";

export const supportAgent = new Agent(components.agent, {
  name: "Support Agent",
  languageModel: openrouter.chat("z-ai/glm-4.5-air:free"),
  instructions: SUPPORT_AGENT_PROMPT,
});
