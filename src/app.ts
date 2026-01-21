import path from 'path';
import url from 'url';
import express, { Request, Response } from 'express';
import {
  PDF_FETCH_PATH,
  USER_CONFIG_DIRECTORY_NAME,
  USER_CONFIG_FILE_NAME,
  viewerPath,
} from './config';
import urlJoin from 'url-join';
import { fromHex } from './utils';

export interface Options {
  resourcesPath: string;
  userDataPath: string;
}

const createExpressApp = (options: Options) => {
  const configPath = path.join(
    options.userDataPath,
    USER_CONFIG_DIRECTORY_NAME,
    USER_CONFIG_FILE_NAME
  );
  console.log('Initialising server:', { configPath });

  const app = express();
  app.disable('x-powered-by');
  app.use(express.static(options.resourcesPath));

  app.get('/config', (_: Request, res: Response) => {
    res.sendFile(path.resolve(configPath), { dotfiles: 'allow' });
  });

  app.get('/', (_: Request, res: Response) => {
    res.redirect(
      url.format({
        pathname: viewerPath,
        query: {
          file: '',
        },
      })
    );
  });

  app.get(urlJoin(PDF_FETCH_PATH, ':filepath'), (req: Request, res: Response) => {
    const filePath = path.resolve(fromHex(req.params.filepath as string));
    console.log('Retrieving PDF:', { filePath });
    res.sendFile(filePath);
  });

  return app;
};

export default createExpressApp;
