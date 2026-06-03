import { debugLog } from "./debug";

/** Estrae il titolo utile da nomi tipo "WhatsApp Chat - Nome.zip" o cartelle omonime. */
export function inferTitleFromWhatsAppName(name: string): string {
  const base = name.replace(/\.(zip|txt)$/i, "").trim();
  if (!base || base === "." || /^_?chat$/i.test(base)) return "";

  const withoutPrefix = base.replace(/^WhatsApp Chat\s*-\s*/i, "").trim();
  const result = withoutPrefix || base;

  debugLog(4, "chat-title", "Inferred title from name", { name, result });
  return result === "." ? "" : result;
}

export function resolveChatImportTitle(options: {
  titleOverride?: string;
  folderName?: string;
  sourceFilename?: string;
}): string {
  const override = options.titleOverride?.trim();
  if (override) return override;

  const folder = options.folderName?.trim();
  if (folder && folder !== ".") {
    const segment = folder.split("/").filter(Boolean).pop() ?? folder;
    const fromFolder = inferTitleFromWhatsAppName(segment);
    if (fromFolder) return fromFolder;
  }

  if (options.sourceFilename) {
    const fromFile = inferTitleFromWhatsAppName(options.sourceFilename);
    if (fromFile) return fromFile;
  }

  return "Chat WhatsApp";
}
