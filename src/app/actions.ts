"use server";

import { fetchInternalApi } from "@/lib/internal-api";

import type { AnalyzeOptions, FetchOptions, LoadOptions, Mail, AnalysisModel, EmailAnalysisResult } from "@/types";
import { deriveAnalyzeOptionsFromMails } from "@/lib/derive-analyze-options";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  getUserSettings,
  addModelToSettings,
  updateModelInSettings,
  deleteModelFromSettings,
  type UserSettings,
} from "@/app/api/_db/settings";
import { isSupportedProvider, getProviderByName } from "@/lib/providers";


export async function fetchMailsAction(options: FetchOptions): Promise<{
  ok: boolean;
  mails?: Mail[];
  error?: string;
}> {
  try {
    const res = await fetchInternalApi("/api/mail/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    const data = (await res.json()) as { ok?: boolean; mails?: Mail[]; error?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: typeof data.error === "string" ? data.error : "Fetch failed" };
    }
    return { ok: true, mails: data.mails ?? [] };
  } catch {
    return { ok: false, error: "Fetch failed" };
  }
}

export async function fetchUserDetails(): Promise<{
  ok: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const res = await fetchInternalApi("/api/user", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();

    if (!res.ok || result.ok === false) {
      return { ok: false, error: result.error || "Fetch failed" };
    }

    return { ok: true, data: result.data };
  } catch {
    return { ok: false, error: "Fetch failed" };
  }
}


export async function syncEncryptedMailsToDb(mails: Mail[]): Promise<{
  ok: boolean;
  count?: number;
  error?: string;
}> {
  try {
    const res = await fetchInternalApi("/api/mail/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mails }),
    });
    const data = (await res.json()) as { ok?: boolean; count?: number; error?: string };
    if (!res.ok) {
      return { ok: false, error: typeof data.error === "string" ? data.error : "Sync failed" };
    }
    if (data.ok === true && typeof data.count === "number") {
      return { ok: true, count: data.count };
    }
    return { ok: false, error: typeof data.error === "string" ? data.error : "Sync failed" };
  } catch {
    return { ok: false, error: "Sync failed" };
  }
}

export async function analyzeMailsAction(
  mails: Mail[],
  store: boolean,
): Promise<{
  ok: boolean;
  existingInDb?: Mail[];
  missingInDb?: Mail[];
  options?: AnalyzeOptions;
  error?: string;
}> {
  const options = deriveAnalyzeOptionsFromMails(mails, store);
  try {
    const res = await fetchInternalApi("/api/mail/analyze-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mails, store }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      existingInDb?: Mail[];
      missingInDb?: Mail[];
      error?: string;
    };
    if (!res.ok) {
      return { ok: false, error: typeof data.error === "string" ? data.error : "Request failed" };
    }
    if (data.ok === true && Array.isArray(data.existingInDb) && Array.isArray(data.missingInDb)) {
      return { ok: true, existingInDb: data.existingInDb, missingInDb: data.missingInDb, options };
    }
    return { ok: false, error: typeof data.error === "string" ? data.error : "Request failed" };
  } catch {
    return { ok: false, error: "Analyze check failed" };
  }
}

export async function getCategoriesAction(): Promise<{
  ok: boolean;
  categories?: { name: string; description?: string | null }[];
  error?: string;
}> {
  try {
    const res = await fetchInternalApi("/api/category/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = (await res.json()) as { ok?: boolean; categories?: { name: string; description?: string | null }[]; error?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: typeof data.error === "string" ? data.error : "Fetch failed" };
    }
    return { ok: true, categories: data.categories ?? [] };
  } catch {
    return { ok: false, error: "Fetch failed" };
  }
}

export async function loadMailsFromDatabaseAction(options: LoadOptions): Promise<{
  ok: boolean;
  mails?: Mail[];
  error?: string;
}> {
  try {
    const res = await fetchInternalApi("/api/mail/load", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    const data = (await res.json()) as { ok?: boolean; mails?: Mail[]; error?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: typeof data.error === "string" ? data.error : "Load failed" };
    }
    return { ok: true, mails: data.mails ?? [] };
  } catch {
    return { ok: false, error: "Load failed" };
  }
}

export async function performGroqMailAnalysisAction(mails: Mail[], modelId?: string): Promise<{
  ok: boolean;
  analyzedMails?: Mail[];
  error?: string;
}> {
  try {
    const res = await fetchInternalApi("/api/mail/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mails, modelId }),
    });
    const data = (await res.json()) as { ok?: boolean; analyzedMails?: Mail[]; error?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: typeof data.error === "string" ? data.error : "Analysis failed" };
    }
    return { ok: true, analyzedMails: data.analyzedMails ?? [] };
  } catch {
    return { ok: false, error: "Analysis failed" };
  }
}

export async function getUserSettingsAction(): Promise<{
  ok: boolean;
  settings?: UserSettings;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { ok: false, error: "Unauthorized" };
    }
    const settingsData = await getUserSettings(session.user.id);
    return { ok: true, settings: settingsData };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch user settings";
    return { ok: false, error: errorMsg };
  }
}

export async function addModelSettingAction(input: {
  provider: string;
  name: string;
  apiKey: string;
  logo?: string;
}): Promise<{
  ok: boolean;
  settings?: UserSettings;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { ok: false, error: "Unauthorized" };
    }
    if (!input.provider?.trim() || !input.name?.trim() || !input.apiKey?.trim()) {
      return { ok: false, error: "Provider Name, Model Name, and API Key are all required" };
    }
    if (!isSupportedProvider(input.provider)) {
      return {
        ok: false,
        error: `Provider "${input.provider}" is not supported. Please select one of the 10 supported providers.`,
      };
    }
    const matchedProvider = getProviderByName(input.provider);
    const normalizedInput = {
      provider: matchedProvider ? matchedProvider.name : input.provider.trim(),
      name: input.name.trim(),
      apiKey: input.apiKey.trim(),
      logo: input.logo?.trim() || matchedProvider?.logo || undefined,
    };
    const updatedSettings = await addModelToSettings(session.user.id, normalizedInput);
    revalidatePath("/settings");
    return { ok: true, settings: updatedSettings };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to add model setting";
    return { ok: false, error: errorMsg };
  }
}

export async function updateModelSettingAction(
  modelId: string,
  input: {
    provider: string;
    name: string;
    apiKey: string;
    logo?: string;
  }
): Promise<{
  ok: boolean;
  settings?: UserSettings;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { ok: false, error: "Unauthorized" };
    }
    if (!modelId || !input.provider?.trim() || !input.name?.trim() || !input.apiKey?.trim()) {
      return { ok: false, error: "Model ID, Provider Name, Model Name, and API Key are required" };
    }
    if (!isSupportedProvider(input.provider)) {
      return {
        ok: false,
        error: `Provider "${input.provider}" is not supported. Please select one of the 10 supported providers.`,
      };
    }
    const matchedProvider = getProviderByName(input.provider);
    const normalizedInput = {
      provider: matchedProvider ? matchedProvider.name : input.provider.trim(),
      name: input.name.trim(),
      apiKey: input.apiKey.trim(),
      logo: input.logo?.trim() || matchedProvider?.logo || undefined,
    };
    const updatedSettings = await updateModelInSettings(session.user.id, modelId, normalizedInput);
    revalidatePath("/settings");
    return { ok: true, settings: updatedSettings };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update model setting";
    return { ok: false, error: errorMsg };
  }
}

export async function deleteModelSettingAction(modelId: string): Promise<{
  ok: boolean;
  settings?: UserSettings;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { ok: false, error: "Unauthorized" };
    }
    if (!modelId) {
      return { ok: false, error: "Model ID is required" };
    }
    const updatedSettings = await deleteModelFromSettings(session.user.id, modelId);
    revalidatePath("/settings");
    return { ok: true, settings: updatedSettings };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to delete model setting";
    return { ok: false, error: errorMsg };
  }
}

export async function getAnalysisModelsAction(): Promise<{
  ok: boolean;
  models?: AnalysisModel[];
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { ok: false, error: "Unauthorized" };
    }
    const userSettings = await getUserSettings(session.user.id);

    const userModels = userSettings.models || [];
    const gemmaModel = userModels.find(
      (m) => m.name === "gemma-4-26b-a4b-it" || m.name.includes("gemma")
    );

    const defaultModel: AnalysisModel = gemmaModel
      ? {
          id: gemmaModel.id,
          provider: gemmaModel.provider,
          name: gemmaModel.name,
          default: true,
          settingId: gemmaModel.settingId,
        }
      : {
          id: "6b73ef82-7a41-451e-ac2b-a0107475cb38",
          provider: "Google",
          name: "gemma-4-26b-a4b-it",
          default: true,
          settingId: userSettings.id || "42821d65-9f24-4b44-b88b-6d3b1c85a12f",
        };

    const formattedUserModels: AnalysisModel[] = userModels
      .filter((m) => m.id !== defaultModel.id)
      .map((m) => ({
        id: m.id,
        provider: m.provider,
        name: m.name,
        default: false,
        settingId: m.settingId,
      }));

    return {
      ok: true,
      models: [defaultModel, ...formattedUserModels],
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch models for analysis";
    return { ok: false, error: errorMsg };
  }
}

export async function runEmailAnalysisAction(
  emails: Mail[],
  model: AnalysisModel
): Promise<{
  ok: boolean;
  results?: EmailAnalysisResult[];
  error?: string;
}> {
  try {
    if (emails.length > 10) {
      return { ok: false, error: "Maximum 10 emails are allowed for analysis" };
    }

    const aiServerUrl = process.env.AI_SERVER_URL || "http://localhost:8000";

    const payload = {
      emails: emails.map((mail) => ({
        id: mail.id,
        subject: mail.subject || null,
        sender: mail.sender || "",
        body: mail.body || "",
        status: mail.status || "unread",
        createdAt: mail.createdAt || new Date().toISOString(),
        labels: mail.labels || [],
        threadId: mail.threadId || mail.id,
      })),
      model: {
        id: model.id,
        name: model.name,
        provider: model.provider,
        default: true,
        settingId: model.settingId || null,
        setting_id: model.settingId || null,
      },
    };

    let res = await fetch(`${aiServerUrl}/analyse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok && res.status === 404) {
      res = await fetch(`${aiServerUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: `AI Server error (${res.status}): ${errText}` };
    }

    const data = (await res.json()) as { results?: EmailAnalysisResult[] };
    if (!data || !Array.isArray(data.results)) {
      return { ok: false, error: "Invalid response from AI Server" };
    }

    return { ok: true, results: data.results };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to connect to AI Server";
    return { ok: false, error: message };
  }
}


export async function getSingleMailInsightAction(mail: Mail): Promise<{
  ok: boolean;
  summary?: string;
  mail?: Mail;
  error?: string;
}> {
  try {
    const res = await fetchInternalApi("/api/mail/insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mail }),
    });
    const data = (await res.json()) as { ok?: boolean; summary?: string; mail?: Mail; error?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: typeof data.error === "string" ? data.error : "Insight failed" };
    }
    return { ok: true, summary: data.summary, mail: data.mail };
  } catch {
    return { ok: false, error: "Insight failed" };
  }
}

export async function generateMailDescriptionsAction(
  mails: Array<{ id: string; sender: string; subject: string }>
): Promise<{
  ok: boolean;
  descriptions?: Record<string, string>;
  error?: string;
}> {
  try {
    const res = await fetchInternalApi("/api/mail/descriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mails }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      descriptions?: Record<string, string>;
      error?: string;
    };
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: typeof data.error === "string" ? data.error : "Failed to generate descriptions",
      };
    }
    return { ok: true, descriptions: data.descriptions };
  } catch {
    return { ok: false, error: "Failed to generate descriptions" };
  }
}

