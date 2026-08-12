import { describe, expect, it } from "vitest";
import { applySecurityHeaders } from "./securityHeaders";

type HeaderValue = string | number | readonly string[];

function captureHeaders(isProduction: boolean) {
  const headers = new Map<string, HeaderValue>();
  applySecurityHeaders(
    {
      setHeader(name: string, value: HeaderValue) {
        headers.set(name, value);
      },
    },
    isProduction
  );
  return headers;
}

describe("applySecurityHeaders", () => {
  it("sets a restrictive browser baseline", () => {
    const headers = captureHeaders(false);

    expect(headers.get("Content-Security-Policy")).toContain(
      "default-src 'self'"
    );
    expect(headers.get("Content-Security-Policy")).toContain(
      "script-src 'self' 'unsafe-inline'"
    );
    expect(headers.get("Content-Security-Policy")).toContain(
      "connect-src 'self' https: ws:"
    );
    expect(headers.get("Content-Security-Policy")).toContain(
      "object-src 'none'"
    );
    expect(headers.get("Content-Security-Policy")).toContain(
      "frame-ancestors 'none'"
    );
    expect(headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.has("Strict-Transport-Security")).toBe(false);
  });

  it("adds HSTS only for production responses", () => {
    const headers = captureHeaders(true);
    expect(headers.get("Content-Security-Policy")).toContain(
      "script-src 'self'"
    );
    expect(headers.get("Content-Security-Policy")).not.toContain(
      "script-src 'self' 'unsafe-inline'"
    );
    expect(headers.get("Content-Security-Policy")).toContain(
      "connect-src 'self' https:"
    );
    expect(headers.get("Content-Security-Policy")).not.toContain(" ws:");
    expect(headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000; includeSubDomains"
    );
  });
});
