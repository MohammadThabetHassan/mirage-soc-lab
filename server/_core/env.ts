export type RuntimeConfiguration = {
  appId: string;
  cookieSecret: string;
  databaseUrl: string;
  oAuthServerUrl: string;
  ownerOpenId: string;
  isProduction: boolean;
  forgeApiUrl: string;
  forgeApiKey: string;
};

export function readRuntimeConfiguration(
  environment: NodeJS.ProcessEnv = process.env
): RuntimeConfiguration {
  return {
    appId: environment.VITE_APP_ID ?? "",
    cookieSecret: environment.JWT_SECRET ?? "",
    databaseUrl: environment.DATABASE_URL ?? "",
    oAuthServerUrl: environment.OAUTH_SERVER_URL ?? "",
    ownerOpenId: environment.OWNER_OPEN_ID ?? "",
    isProduction: environment.NODE_ENV === "production",
    forgeApiUrl: environment.BUILT_IN_FORGE_API_URL ?? "",
    forgeApiKey: environment.BUILT_IN_FORGE_API_KEY ?? "",
  };
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Development and test environments may intentionally omit external services.
 * Production must fail fast rather than accepting requests with incomplete
 * authentication or persistence configuration.
 */
export function validateProductionConfiguration(
  configuration: RuntimeConfiguration = ENV
): void {
  if (!configuration.isProduction) return;

  const failures: string[] = [];
  if (!configuration.appId) failures.push("VITE_APP_ID must be set");
  if (configuration.cookieSecret.length < 32) {
    failures.push("JWT_SECRET must contain at least 32 characters");
  }
  if (
    !configuration.databaseUrl.startsWith("mysql://") &&
    !configuration.databaseUrl.startsWith("mysql2://")
  ) {
    failures.push("DATABASE_URL must use the mysql:// or mysql2:// scheme");
  }
  if (!isHttpsUrl(configuration.oAuthServerUrl)) {
    failures.push("OAUTH_SERVER_URL must be an HTTPS URL");
  }
  if (!configuration.ownerOpenId) failures.push("OWNER_OPEN_ID must be set");

  if (failures.length) {
    throw new Error(`Invalid production configuration: ${failures.join("; ")}`);
  }
}

export const ENV = readRuntimeConfiguration();
