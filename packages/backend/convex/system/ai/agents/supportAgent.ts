import { Agent } from "@convex-dev/agent";
import { components } from "../../../_generated/api";
// import { openrouter } from "../providers";
import { google } from "@ai-sdk/google";
import { SUPPORT_AGENT_PROMPT } from "./prompt";

export const supportAgent = new Agent(components.agent, {
  name: "Support Agent",
  languageModel: google("gemini-2.0-flash"),
  instructions: SUPPORT_AGENT_PROMPT,
});
