import express, { Request, Response } from 'express';

const viewerPath = 'viewer/web/viewer.html';

export interface Options {
  resourcesPath: string;
}

const createExpressApp = (
  options: Options = {
    resourcesPath: 'public',
  }
) => {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.static(options.resourcesPath));

  app.get('/', (_: Request, res: Response) => {
    res.redirect(viewerPath);
  });
  return app;
};

export default createExpressApp;
