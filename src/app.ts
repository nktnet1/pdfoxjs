import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import urlJoin from "url-join";
import {
  PDF_FETCH_PATH,
  USER_CONFIG_DIRECTORY_NAME,
  USER_CONFIG_FILE_NAME,
  viewerPath,
} from "./config";
import { fromHex } from "./utils";

export interface Options {
  resourcesPath: string;
  userDataPath: string;
}

const createHonoApp = (options: Options) => {
  const configPath = path.join(
    options.userDataPath,
    USER_CONFIG_DIRECTORY_NAME,
    USER_CONFIG_FILE_NAME,
  );
  console.log("Initialising server:", { configPath });

  const app = new Hono();

  app.use("/*", serveStatic({ root: options.resourcesPath }));

  app.get("/config", async (c) => {
    try {
      const resolvedPath = path.resolve(configPath);
      const fileBuffer = await fs.readFile(resolvedPath);
      return c.body(fileBuffer);
    } catch (_error: unknown) {
      return c.text("Configuration file not found", 404);
    }
  });

  app.get("/", (c) => {
    const redirectUrl = url.format({
      pathname: viewerPath,
      query: {
        file: "",
      },
    });
    return c.redirect(redirectUrl);
  });

  app.get(urlJoin(PDF_FETCH_PATH, ":filepath"), async (c) => {
    const filepathParam = c.req.param("filepath");
    if (!filepathParam) {
      return c.text("Missing file path param", 400);
    }

    const filePath = path.resolve(fromHex(filepathParam));
    console.log("Retrieving PDF:", { filePath });

    try {
      const fileBuffer = await fs.readFile(filePath);
      c.header("Content-Type", "application/pdf");
      return c.body(fileBuffer);
    } catch (error: unknown) {
      console.error(error);
      return c.text("File not found", 404);
    }
  });

  return app;
};

export default createHonoApp;
