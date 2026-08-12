import type { RequestHandler, Response } from "express";
import { ENV } from "./env";

function contentSecurityPolicy(isProduction: boolean): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline'",
    isProduction ? "script-src 'self'" : "script-src 'self' 'unsafe-inline'",
    isProduction
      ? "connect-src 'self' https:"
      : "connect-src 'self' https: ws:",
    "font-src 'self' data:",
    "manifest-src 'self'",
  ].join("; ");
}

/**
 * Applies baseline browser protections at the application boundary. The policy
 * deliberately permits only the external HTTPS image and connection resources
 * needed by the controlled analyst interface. Production never permits inline
 * scripts, plugins, framing, or cross-origin default content; development
 * additionally permits Vite's inline refresh preamble and local WebSocket.
 */
export function applySecurityHeaders(
  response: Pick<Response, "setHeader">,
  isProduction: boolean = ENV.isProduction
): void {
  response.setHeader(
    "Content-Security-Policy",
    contentSecurityPolicy(isProduction)
  );
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  response.setHeader(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), microphone=(), payment=(), usb=()"
  );
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (isProduction) {
    response.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
}

export const securityHeaders: RequestHandler = (_request, response, next) => {
  applySecurityHeaders(response);
  next();
};
