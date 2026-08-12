import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const REQUEST_ID_HEADER = "x-request-id";

function safeRequestId(value: string | undefined) {
  return value && /^[a-zA-Z0-9._-]{8,128}$/.test(value) ? value : randomUUID();
}

/**
 * Emits one structured, metadata-only record per HTTP response. Request bodies,
 * authentication headers, cookies, query values, and telemetry content are
 * intentionally excluded from logs.
 */
export function requestObservability(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const requestId = safeRequestId(request.header(REQUEST_ID_HEADER));
  const startedAt = performance.now();
  response.setHeader(REQUEST_ID_HEADER, requestId);

  response.once("finish", () => {
    console.info(
      JSON.stringify({
        event: "http_request_completed",
        requestId,
        method: request.method,
        path: request.path,
        statusCode: response.statusCode,
        durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
      })
    );
  });

  next();
}
