import express, { Request, Response } from 'express';
import { viewerPath } from './config';

export interface Options {
  resourcesPath: string;
  pdfPath?: string;
}

const createExpressApp = (
  options: Options = {
    resourcesPath: 'public',
    pdfPath: '',
  }
) => {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.static(options.resourcesPath));

  app.get('/', (_: Request, res: Response) => {
    res.redirect(viewerPath);
  });

  app.get(/^\/pdf(.+)/, (req: Request, res: Response) => {
    const absoluteFilePath = decodeURIComponent(req.params[0]);
    res.sendFile(absoluteFilePath);
  });

  return app;
};

export default createExpressApp;
