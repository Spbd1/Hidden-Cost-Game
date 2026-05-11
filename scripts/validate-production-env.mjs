const DEFAULT_ADMIN_EXPORT_TOKEN = "change-me-before-production";
const DEFAULT_POSTGRES_PASSWORD = "hcg_password_change_me";

const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  process.exit(0);
}

const errors = [];
const warnings = [];
const enableServerSubmission = process.env.ENABLE_SERVER_SUBMISSION === "true";
const adminExportToken = process.env.ADMIN_EXPORT_TOKEN?.trim();
const databaseUrl = process.env.DATABASE_URL?.trim();
const postgresPassword = process.env.POSTGRES_PASSWORD?.trim();
const googleSheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
const googleSheetsWebhookSecret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET?.trim();

if (!adminExportToken) {
  errors.push("ADMIN_EXPORT_TOKEN is required in production.");
} else if (adminExportToken === DEFAULT_ADMIN_EXPORT_TOKEN) {
  errors.push(`ADMIN_EXPORT_TOKEN must not use the example value (${DEFAULT_ADMIN_EXPORT_TOKEN}).`);
}

if (enableServerSubmission && !databaseUrl) {
  errors.push("DATABASE_URL is required when ENABLE_SERVER_SUBMISSION=true in production.");
}

if (databaseUrl?.includes(DEFAULT_POSTGRES_PASSWORD)) {
  errors.push(`DATABASE_URL must not contain the example PostgreSQL password (${DEFAULT_POSTGRES_PASSWORD}).`);
}

if (postgresPassword === DEFAULT_POSTGRES_PASSWORD) {
  errors.push(`POSTGRES_PASSWORD must not use the example value (${DEFAULT_POSTGRES_PASSWORD}).`);
}

if (googleSheetsWebhookUrl && !googleSheetsWebhookSecret) {
  warnings.push("GOOGLE_SHEETS_WEBHOOK_URL is set without GOOGLE_SHEETS_WEBHOOK_SECRET; the mirror remains optional, but a shared secret is recommended.");
}

for (const warning of warnings) {
  console.warn(`[production-env] Warning: ${warning}`);
}

if (errors.length > 0) {
  console.error("[production-env] Refusing to start with unsafe production environment:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}
