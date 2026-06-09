import type { SlashCommand } from "./types.js";
import { PLATFORM_DOC_ROOTS } from "./sourceData.js";

const DOC_URL_ALIASES: Record<string, string> = {
  "https://docs.anthropic.com/en/docs/claude-code/sdk":
    "https://platform.claude.com/docs/en/agent-sdk/overview",
  "https://code.claude.com/docs/en/sdk":
    "https://platform.claude.com/docs/en/agent-sdk/overview",
  "https://docs.claude.com/en/docs/agent-sdk/overview":
    "https://platform.claude.com/docs/en/agent-sdk/overview",
  "https://docs.anthropic.com/en/docs/claude-code/slash-commands":
    "https://code.claude.com/docs/en/commands",
  "https://docs.github.com/en/copilot/how-tos/use-chat/use-github-copilot-chat-in-githubcom":
    "https://docs.github.com/en/copilot/reference/chat-cheat-sheet?tool=webui",
  "https://docs.github.com/en/copilot/how-tos/use-copilot-agents/github-copilot-in-the-cli/using-github-copilot-in-the-cli":
    "https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference",
  "https://docs.github.com/en/copilot/how-tos/use-copilot-agents/github-copilot-in-your-ide?tool=jetbrains":
    "https://docs.github.com/en/copilot/reference/chat-cheat-sheet?tool=jetbrains",
  "https://docs.github.com/en/copilot/how-tos/use-copilot-agents/github-copilot-in-your-ide?tool=xcode":
    "https://docs.github.com/en/copilot/reference/chat-cheat-sheet?tool=xcode",
};

function stripFragment(url: string): string {
  return url.split("#", 1)[0] ?? url;
}

function getCommandToken(command: string): string {
  const trimmed = command.trim();
  const match = trimmed.match(/^\/[^\s[]+/);

  return match?.[0] ?? trimmed;
}

function withTextFragment(url: string, text: string): string {
  const baseUrl = stripFragment(canonicalizeDocUrl(url));
  return `${baseUrl}#:~:text=${encodeURIComponent(text)}`;
}

export function canonicalizeDocUrl(url: string): string {
  return DOC_URL_ALIASES[url] ?? url;
}

export function getCommandDocUrl(
  command: Pick<SlashCommand, "platform" | "command" | "docUrl">
): string {
  const token = getCommandToken(command.command);
  const rootUrl = PLATFORM_DOC_ROOTS[command.platform] ?? command.docUrl;

  if (!rootUrl) {
    return "";
  }

  return withTextFragment(rootUrl, token);
}