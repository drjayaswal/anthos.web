"use server";

import { fetchInternalApi } from "@/lib/internal-api";

import type { AnalyzeOptions, FetchOptions, LoadOptions, Mail, AnalysisModel } from "@/types";
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
  name: string;
  modelName: string;
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
    if (!input.name.trim() || !input.modelName.trim() || !input.apiKey.trim()) {
      return { ok: false, error: "Provider Name, Model Name, and API Key are all required" };
    }
    if (!isSupportedProvider(input.name)) {
      return {
        ok: false,
        error: `Provider "${input.name}" is not supported. Please select one of the 10 supported providers.`,
      };
    }
    const matchedProvider = getProviderByName(input.name);
    const normalizedInput = {
      ...input,
      name: matchedProvider ? matchedProvider.name : input.name.trim(),
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
    name: string;
    modelName: string;
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
    if (!modelId || !input.name.trim() || !input.modelName.trim() || !input.apiKey.trim()) {
      return { ok: false, error: "Model ID, Provider Name, Model Name, and API Key are required" };
    }
    if (!isSupportedProvider(input.name)) {
      return {
        ok: false,
        error: `Provider "${input.name}" is not supported. Please select one of the 10 supported providers.`,
      };
    }
    const matchedProvider = getProviderByName(input.name);
    const normalizedInput = {
      ...input,
      name: matchedProvider ? matchedProvider.name : input.name.trim(),
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

    const defaultModel: AnalysisModel = {
      id: "hardcoded-llama-70b",
      name: "Llama 70B",
      displayName: "Llama 70B (Anthos Default)",
      model: "llama-3.3-70b-versatile",
      logo: "/ai-default.png",
    };

    const userModels: AnalysisModel[] = (userSettings.models || []).map((m) => ({
      id: m.id,
      name: m.name,
      displayName: m.name,
      model: m.modelName,
      logo: m.logo ?? null,
    }));

    return {
      ok: true,
      models: [defaultModel, ...userModels],
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch models for analysis";
    return { ok: false, error: errorMsg };
  }
}

