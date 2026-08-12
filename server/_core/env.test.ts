import { describe, expect, it } from "vitest";
import {
  type RuntimeConfiguration,
  validateProductionConfiguration,
} from "./env";

const validProductionConfiguration: RuntimeConfiguration = {
  appId: "mirage-soc-lab",
  cookieSecret: "a".repeat(32),
  databaseUrl: "mysql://mirage:password@db.example.test:3306/mirage",
  oAuthServerUrl: "https://auth.example.test",
  ownerOpenId: "owner-open-id",
  isProduction: true,
  forgeApiUrl: "",
  forgeApiKey: "",
};

describe("validateProductionConfiguration", () => {
  it("accepts a complete production configuration", () => {
    expect(() =>
      validateProductionConfiguration(validProductionConfiguration)
    ).not.toThrow();
  });

  it("does not impose production requirements in non-production runtimes", () => {
    expect(() =>
      validateProductionConfiguration({
        ...validProductionConfiguration,
        appId: "",
        cookieSecret: "",
        databaseUrl: "",
        oAuthServerUrl: "",
        ownerOpenId: "",
        isProduction: false,
      })
    ).not.toThrow();
  });

  it("reports missing and unsafe production values without including their contents", () => {
    expect(() =>
      validateProductionConfiguration({
        ...validProductionConfiguration,
        appId: "",
        cookieSecret: "too-short",
        databaseUrl: "postgres://not-supported.example.test/mirage",
        oAuthServerUrl: "http://auth.example.test",
        ownerOpenId: "",
      })
    ).toThrowError(
      "Invalid production configuration: VITE_APP_ID must be set; JWT_SECRET must contain at least 32 characters; DATABASE_URL must use the mysql:// or mysql2:// scheme; OAUTH_SERVER_URL must be an HTTPS URL; OWNER_OPEN_ID must be set"
    );
  });
});
