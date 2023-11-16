import path from 'path';
import url from 'url';
import express, { Request, Response } from 'express';
import { PDF_FETCH_PATH, USER_CONFIG_DIRECTORY_NAME, USER_CONFIG_FILE_NAME, viewerPath } from './config';

export interface Options {
  resourcesPath: string;
  userDataPath: string;
}

const createExpressApp = (options: Options) => {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.static(options.resourcesPath));

  app.get('/config', (req: Request, res: Response) => {
    res.sendFile(path.join(options.userDataPath, USER_CONFIG_DIRECTORY_NAME, USER_CONFIG_FILE_NAME));
  });

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
