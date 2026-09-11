import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
  decimal,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const encryptedMail = pgTable("encrypted_mail", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  gmailMessageId: text("gmail_message_id").notNull(),
  ciphertext: text("ciphertext").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  categories: text("categories").array(),
  priority: decimal("priority", { precision: 10, scale: 4 }).array().notNull().default([]),
  confidence: decimal("confidence", { precision: 10, scale: 4 }).array().notNull().default([]),
  summary: text("summary"),
  description: text("description"), 
  version: text("version").array().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("encrypted_mail_user_message_uq").on(table.userId, table.gmailMessageId),
  index("encrypted_mail_user_idx").on(table.userId),
]);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  examples: jsonb("examples").default([]),
});

export const encryptedMailRelations = relations(encryptedMail, ({ one }) => ({
  user: one(user, { fields: [encryptedMail.userId], references: [user.id] }),
}));

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: text("id").primaryKey(),
  models: text("models").array().default([]),  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: text("userId").notNull().unique().references(() => user.id, { onDelete: "cascade" })
});


export const models = pgTable("models", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  name: text("name").notNull(),
  apiKey: text("api_key").notNull(),
  logo: text("logo"),
  settingId: text("setting_id").notNull().references(() => settings.id, { onDelete: "cascade" })
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })
},
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
},
  (table) => [
    index("account_user_id_idx").on(table.userId),
    index("account_provider_idx").on(table.providerId, table.accountId),
  ],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const settingsRelations = relations(settings, ({ one, many }) => ({
  user: one(user, { fields: [settings.userId], references: [user.id] }),
  models: many(models),
}));

export const modelsRelations = relations(models, ({ one }) => ({
  setting: one(settings, { fields: [models.settingId], references: [settings.id] }),
}));

