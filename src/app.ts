import url from 'url';
import express, { Request, Response } from 'express';
import { PDF_FETCH_PATH, viewerPath } from './config';

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
    res.redirect(url.format({
      pathname: viewerPath,
      query: {
        file: '',
      }
    }));
  });

  app.get(PDF_FETCH_PATH, (req: Request, res: Response) => {
    const absoluteFilePath = decodeURIComponent(req.query.filepath as string);
    res.sendFile(absoluteFilePath);
  });

  return app;
};

export default createExpressApp;
