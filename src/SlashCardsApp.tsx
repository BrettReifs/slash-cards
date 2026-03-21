import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
  type McpUiAppCapabilities,
  useApp,
} from "@modelcontextprotocol/ext-apps/react";
import { getVisibleCommands } from "./commandUtils";
import { COMMANDS } from "./commands";
import { DeckBrowser } from "./DeckBrowser";
import { canonicalizeDocUrl, getCommandDocUrl } from "./docUrls";
import { HomeScreen } from "./HomeScreen";
import { SkeletonCard } from "./SkeletonCard";
import type {
  HostContext,
  SlashCardsFilters,
  SlashCommand,
} from "./types";

const APP_INFO = {
  name: "Slash Cards",
  version: "1.0.0",
};

const APP_CAPABILITIES: McpUiAppCapabilities = {
  availableDisplayModes: ["inline", "fullscreen", "pip"],
};

const EMPTY_FILTERS: SlashCardsFilters = {
  platforms: [],
  category: null,
  search: "",
  sort: "relevance",
};

const PREVIEW_QUERY_PARAM = "preview";

type ContentBlock = {
  type?: string;
  text?: string;
};

type SafeAreaStyle = CSSProperties & {
  "--safe-area-top": string;
  "--safe-area-right": string;
  "--safe-area-bottom": string;
  "--safe-area-left": string;
  "--host-container-height": string;
  "--host-container-max-height": string;
};

function asText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeCommand(raw: unknown, index: number): SlashCommand | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const command =
    asText(record.command) || asText(record.commandName) || asText(record.name);

  if (!command) {
    return null;
  }

  const platform =
    asText(record.platform) || asText(record.client) || asText(record.host) || "unknown";
  const category = asText(record.category) || asText(record.group) || "General";
  const description =
    asText(record.description) ||
    asText(record.summary) ||
    "No description was provided.";
  const whenToUse =
    asText(record.whenToUse) || asText(record.when) || asText(record.useCase);
  const example = asText(record.example) || asText(record.usage) || command;
  const aliases = asStringArray(record.aliases ?? record.alias);
  const equivalents = asStringArray(record.equivalents ?? record.related ?? record.matches);
  const tags = asStringArray(record.tags ?? record.keywords);
  const rawDocUrl = canonicalizeDocUrl(
    asText(record.docUrl) ||
      asText(record.provenanceUrl) ||
      asText(record.documentationUrl) ||
      asText(record.docsUrl) ||
      asText(record.url)
  );
  const behavior =
    asText(record.behavior) || asText(record.notes) || asText(record.differences);
  const releasedAt = asText(record.releasedAt) || undefined;
  const updatedAt = asText(record.updatedAt) || undefined;
  const releaseVersion = asText(record.releaseVersion) || undefined;
  const rawPriority = asText(record.priority);
  const priority =
    rawPriority === "new" ||
    rawPriority === "essential" ||
    rawPriority === "common" ||
    rawPriority === "niche"
      ? rawPriority
      : undefined;
  const workspaceWeight =
    typeof record.workspaceWeight === "number" ? record.workspaceWeight : undefined;
  const isNew = typeof record.isNew === "boolean" ? record.isNew : undefined;
  const isRecentlyUpdated =
    typeof record.isRecentlyUpdated === "boolean"
      ? record.isRecentlyUpdated
      : undefined;
  const catalogIndex =
    typeof record.catalogIndex === "number" ? record.catalogIndex : index;

  return {
    id: `${platform}:${command}:${index}`,
    command,
    platform,
    category,
    description,
    whenToUse,
    example,
    aliases,
    equivalents,
    docUrl: getCommandDocUrl({ platform, command, docUrl: rawDocUrl }),
    tags,
    behavior: behavior || undefined,
    releasedAt,
    updatedAt,
    releaseVersion,
    priority,
    workspaceWeight,
    isNew,
    isRecentlyUpdated,
    catalogIndex,
  };
}

function extractTextContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === "string") {
          return block;
        }

        if (block && typeof block === "object" && "text" in block) {
          return typeof (block as ContentBlock).text === "string"
            ? (block as ContentBlock).text ?? ""
            : "";
        }

        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function extractStructuredCommands(
  structuredContent: unknown,
  content?: unknown
): SlashCommand[] {
  const candidates: unknown[] = [];

  if (Array.isArray(structuredContent)) {
    candidates.push(...structuredContent);
  } else if (structuredContent && typeof structuredContent === "object") {
    const record = structuredContent as Record<string, unknown>;

    for (const key of ["commands", "items", "results", "deck", "cards"]) {
      const candidate = record[key];
      if (Array.isArray(candidate)) {
        candidates.push(...candidate);
      }
    }

    if (candidates.length === 0) {
      candidates.push(record);
    }
  }

  if (candidates.length === 0) {
    const text = extractTextContent(content);

    if (text) {
      try {
        return extractStructuredCommands(JSON.parse(text));
      } catch {
        return [];
      }
    }
  }

  return candidates
    .map((candidate, index) => normalizeCommand(candidate, index))
    .filter((candidate): candidate is SlashCommand => candidate !== null);
}

function mergeCommands(current: SlashCommand[], incoming: SlashCommand[]) {
  const commandMap = new Map<string, SlashCommand>();

  for (const command of current) {
    commandMap.set(`${command.platform}:${command.command}`, command);
  }

  for (const command of incoming) {
    commandMap.set(`${command.platform}:${command.command}`, command);
  }

  return [...commandMap.values()].sort((left, right) => {
    const commandOrder = left.command.localeCompare(right.command);
    return commandOrder !== 0
      ? commandOrder
      : left.platform.localeCompare(right.platform);
  });
}

function buildLoadingMessage(argumentsValue: unknown) {
  if (!argumentsValue || typeof argumentsValue !== "object") {
    return "Loading slash command deck…";
  }

  const record = argumentsValue as Record<string, unknown>;

  if (typeof record.progress === "string") {
    return record.progress;
  }

  if (
    typeof record.completed === "number" &&
    typeof record.total === "number" &&
    record.total > 0
  ) {
    return `Loading commands ${record.completed}/${record.total}…`;
  }

  const preview = JSON.stringify(record);
  return preview && preview !== "{}"
    ? `Streaming tool input: ${preview}`
    : "Loading slash command deck…";
}

function openUrlInNewTab(url: string) {
  if (typeof document === "undefined") {
    return;
  }

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
}

export function SlashCardsApp() {
  const [commands, setCommands] = useState<SlashCommand[]>([]);
  const [filters, setFilters] = useState<SlashCardsFilters>(EMPTY_FILTERS);
  const [hostContext, setHostContext] = useState<HostContext>();
  const [loadingMessage, setLoadingMessage] = useState("Waiting for slash command data…");
  const [appError, setAppError] = useState<string | null>(null);
  const hasRequestedMaximizedView = useRef(false);
  const isStandalonePreview = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return new URLSearchParams(window.location.search).get(PREVIEW_QUERY_PARAM) === "1";
  }, []);

  const { app, isConnected, error } = useApp({
    appInfo: APP_INFO,
    capabilities: APP_CAPABILITIES,
    onAppCreated: (createdApp) => {
      createdApp.ontoolinputpartial = (params) => {
        setLoadingMessage(buildLoadingMessage(params.arguments));
      };

      createdApp.ontoolresult = (params) => {
        const nextCommands = extractStructuredCommands(
          params.structuredContent,
          params.content
        );

        if (params.isError) {
          setAppError(
            extractTextContent(params.content) ||
              "The slash command tool returned an error."
          );
          setLoadingMessage("Unable to load commands.");
          return;
        }

        if (nextCommands.length > 0) {
          setCommands((current) => mergeCommands(current, nextCommands));
          setAppError(null);
          setLoadingMessage("");
        }
      };

      createdApp.onhostcontextchanged = (context) => {
        setHostContext((current) => ({ ...current, ...context }));
      };

      createdApp.ontoolcancelled = (params) => {
        setLoadingMessage(params.reason ? `Cancelled: ${params.reason}` : "Loading cancelled.");
      };

      createdApp.onteardown = async () => {
        setLoadingMessage("");
        return {};
      };
    },
  });

  useEffect(() => {
    if (!app || !isConnected) {
      return;
    }

    const initialContext = app.getHostContext();
    if (initialContext) {
      setHostContext(initialContext);
    }
  }, [app, isConnected]);

  useEffect(() => {
    if (!isStandalonePreview) {
      return;
    }

    setCommands((current) => (current.length > 0 ? current : COMMANDS));
    setLoadingMessage("");
    setAppError(null);
  }, [isStandalonePreview]);

  useEffect(() => {
    if (hostContext?.theme) {
      applyDocumentTheme(hostContext.theme);
    }

    if (hostContext?.styles?.variables) {
      applyHostStyleVariables(
        hostContext.styles.variables as Parameters<typeof applyHostStyleVariables>[0]
      );
    }

    if (hostContext?.styles?.css?.fonts) {
      applyHostFonts(hostContext.styles.css.fonts);
    }
  }, [hostContext]);

  useEffect(() => {
    if (
      isStandalonePreview ||
      !app ||
      !isConnected ||
      hasRequestedMaximizedView.current
    ) {
      return;
    }

    const availableDisplayModes = hostContext?.availableDisplayModes ?? [];

    if (
      hostContext?.displayMode !== "inline" ||
      !availableDisplayModes.includes("fullscreen")
    ) {
      return;
    }

    hasRequestedMaximizedView.current = true;

    void app.requestDisplayMode({ mode: "fullscreen" }).catch(() => {
      hasRequestedMaximizedView.current = false;
    });
  }, [app, hostContext?.availableDisplayModes, hostContext?.displayMode, isConnected, isStandalonePreview]);

  const theme = hostContext?.theme ?? "light";
  const displayMode = hostContext?.displayMode ?? "inline";
  const effectiveError = isStandalonePreview
    ? appError
    : appError ?? error?.message ?? null;
  const hasConnectedDataSource = isConnected || isStandalonePreview;
  const visibleCommands = useMemo(
    () => getVisibleCommands(commands, filters, hostContext),
    [commands, filters, hostContext]
  );

  const safeAreaStyle = useMemo<SafeAreaStyle>(() => {
    const insets = hostContext?.safeAreaInsets;
    const containerDimensions = hostContext?.containerDimensions;

    return {
      "--safe-area-top": `${insets?.top ?? 0}px`,
      "--safe-area-right": `${insets?.right ?? 0}px`,
      "--safe-area-bottom": `${insets?.bottom ?? 0}px`,
      "--safe-area-left": `${insets?.left ?? 0}px`,
      "--host-container-height": `${containerDimensions?.height ?? 0}px`,
      "--host-container-max-height": `${containerDimensions?.maxHeight ?? 0}px`,
    };
  }, [hostContext?.containerDimensions, hostContext?.safeAreaInsets]);

  const handleFiltersChange = useCallback((next: Partial<SlashCardsFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  }, []);

  const openDocs = useCallback(
    async (rawUrl: string) => {
      const url = canonicalizeDocUrl(rawUrl);

      if (isStandalonePreview || !app || !isConnected) {
        openUrlInNewTab(url);
        return;
      }

      const result = await app.openLink({ url });
      if (result.isError) {
        openUrlInNewTab(url);
      }
    },
    [app, isConnected, isStandalonePreview]
  );

  return (
    <div
      className="slash-cards-shell"
      data-theme={theme}
      data-display-mode={displayMode}
      style={safeAreaStyle}
    >
      <div className="slash-cards-app">
        <main className="slash-cards-main">
          {!hasConnectedDataSource ? (
            <section className="loading-state">
              <div className="panel status-banner">
                <strong>Connecting to the host…</strong>
                <p>{loadingMessage}</p>
              </div>
              <div className="card-grid">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </section>
          ) : effectiveError ? (
            <section className="panel empty-state">
              <strong>Unable to render slash cards</strong>
              <p>{effectiveError}</p>
            </section>
          ) : commands.length === 0 ? (
            <section className="loading-state">
              <div className="panel status-banner">
                <strong>Waiting for slash command results…</strong>
                <p>{loadingMessage || "The host has connected, but the tool has not returned structured content yet."}</p>
              </div>
              <div className="card-grid">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </section>
          ) : (
            <>
              <HomeScreen
                commands={commands}
                visibleCommands={visibleCommands}
                onOpenDocs={openDocs}
              />
              <DeckBrowser
                commands={commands}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onOpenDocs={openDocs}
                hostContext={hostContext}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
