import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { validateProductionConfiguration, ENV } from "./env";
import { registerOAuthRoutes } from "./oauth";
import { requestObservability } from "./observability";
import { assessReadiness } from "./readiness";
import { securityHeaders } from "./securityHeaders";
import { registerStorageProxy } from "./storageProxy";
import { isDatabaseReachable } from "../db";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  validateProductionConfiguration();

  const app = express();
  const server = createServer(app);
  app.disable("x-powered-by");
  // Only honor forwarding metadata in the production reverse-proxy topology.
  app.set("trust proxy", ENV.isProduction ? 1 : false);
  app.use(requestObservability);
  app.use(securityHeaders);
  app.get("/healthz", (_request, response) => {
    response.status(200).json({ status: "ok", service: "mirage-soc-lab" });
  });
  app.get("/readyz", async (_request, response) => {
    const readiness = assessReadiness({
      isProduction: ENV.isProduction,
      databaseConfigured: Boolean(ENV.databaseUrl),
      databaseReachable: await isDatabaseReachable(),
    });
    response.status(readiness.statusCode).json({
      status: readiness.ready ? "ready" : "not_ready",
      service: "mirage-soc-lab",
      dependencies: readiness.dependencies,
    });
  });
  // Configure body parser with a bounded request limit for controlled lab imports.
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ limit: "2mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      next: NextFunction
    ) => {
      if (response.headersSent) {
        next(error);
        return;
      }

      const isMalformedBody =
        error instanceof SyntaxError &&
        "body" in error &&
        typeof (error as { body?: unknown }).body === "string";
      const status = isMalformedBody ? 400 : 500;
      const requestId = response.getHeader("x-request-id");
      const safeRequestId =
        typeof requestId === "string" ? requestId : undefined;

      console.error(
        JSON.stringify({
          event: "request_error",
          requestId: safeRequestId,
          status,
          kind: isMalformedBody ? "malformed_request" : "internal_error",
        })
      );
      response.status(status).json({
        error: {
          code: isMalformedBody ? "MALFORMED_REQUEST" : "INTERNAL_ERROR",
          message: isMalformedBody
            ? "The request body could not be parsed."
            : "The request could not be completed.",
          requestId: safeRequestId,
        },
      });
    }
  );

  const preferredPort = Number(process.env.PORT || "3000");
  if (
    !Number.isInteger(preferredPort) ||
    preferredPort < 1 ||
    preferredPort > 65_535
  ) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
