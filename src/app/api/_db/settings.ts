import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { settings, models } from "@/app/db/schema";

export type ModelItem = {
  id: string;
  provider: string;
  name: string;
  apiKey: string;
  logo?: string | null;
  settingId: string;
};

export type UserSettings = {
  id: string;
  userId: string;
  models: ModelItem[];
  createdAt: string;
  updatedAt: string;
};

export async function getUserSettings(userId: string): Promise<UserSettings> {
  let [settingRow] = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, userId))
    .limit(1);

  if (!settingRow) {
    const newSettingId = crypto.randomUUID();
    const [inserted] = await db
      .insert(settings)
      .values({
        id: newSettingId,
        userId,
        models: [],
      })
      .returning();
    settingRow = inserted;
  }

  const modelRows = await db
    .select()
    .from(models)
    .where(eq(models.settingId, settingRow.id));

  return {
    id: settingRow.id,
    userId: settingRow.userId,
    models: modelRows.map((m) => ({
      id: m.id,
      provider: m.provider,
      name: m.name,
      apiKey: m.apiKey,
      logo: m.logo,
      settingId: m.settingId,
    })),
    createdAt: settingRow.createdAt.toISOString(),
    updatedAt: settingRow.updatedAt.toISOString(),
  };
}

export async function addModelToSettings(
  userId: string,
  input: { provider: string; name: string; apiKey: string; logo?: string }
): Promise<UserSettings> {
  const userSettings = await getUserSettings(userId);
  const newModelId = crypto.randomUUID();

  await db.insert(models).values({
    id: newModelId,
    provider: input.provider,
    name: input.name,
    apiKey: input.apiKey,
    logo: input.logo?.trim() || null,
    settingId: userSettings.id,
  });

  const currentModelIds = userSettings.models.map((m) => m.id);
  const updatedModelIds = [...currentModelIds, newModelId];

  await db
    .update(settings)
    .set({
      models: updatedModelIds,
      updatedAt: new Date(),
    })
    .where(eq(settings.id, userSettings.id));

  return getUserSettings(userId);
}

export async function updateModelInSettings(
  userId: string,
  modelId: string,
  input: { provider: string; name: string; apiKey: string; logo?: string }
): Promise<UserSettings> {
  const userSettings = await getUserSettings(userId);

  await db
    .update(models)
    .set({
      provider: input.provider,
      name: input.name,
      apiKey: input.apiKey,
      logo: input.logo?.trim() || null,
    })
    .where(and(eq(models.id, modelId), eq(models.settingId, userSettings.id)));

  await db
    .update(settings)
    .set({
      updatedAt: new Date(),
    })
    .where(eq(settings.id, userSettings.id));

  return getUserSettings(userId);
}

export async function deleteModelFromSettings(
  userId: string,
  modelId: string
): Promise<UserSettings> {
  const userSettings = await getUserSettings(userId);

  await db
    .delete(models)
    .where(and(eq(models.id, modelId), eq(models.settingId, userSettings.id)));

  const updatedModelIds = userSettings.models
    .filter((m) => m.id !== modelId)
    .map((m) => m.id);

  await db
    .update(settings)
    .set({
      models: updatedModelIds,
      updatedAt: new Date(),
    })
    .where(eq(settings.id, userSettings.id));

  return getUserSettings(userId);
}