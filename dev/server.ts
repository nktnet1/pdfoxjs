import fs from 'fs';
import path from 'path';
import { AddressInfo } from 'net';
import createExpressApp from '../src/app';
import {
  DEFAULT_CONFIG_FILE_NAME,
  USER_CONFIG_DIRECTORY_NAME,
  USER_CONFIG_FILE_NAME,
} from '../src/config';

const DEFAULT_CONFIG_PATH = `./public/${DEFAULT_CONFIG_FILE_NAME}`;
const DEV_CONFIG_DIR = './.config';
const DEV_CONFIG_FILE_PATH = path.join(
  DEV_CONFIG_DIR,
  USER_CONFIG_DIRECTORY_NAME,
  USER_CONFIG_FILE_NAME
);

const app = createExpressApp({
  resourcesPath: 'public',
  userDataPath: path.resolve(DEV_CONFIG_DIR),
});

const server = app.listen(3000, () => {
  const addresses = server.address() as AddressInfo;
  const port = addresses.port;

  if (!fs.existsSync(DEV_CONFIG_FILE_PATH)) {
    fs.mkdirSync(path.dirname(DEV_CONFIG_FILE_PATH), { recursive: true });
    fs.copyFileSync(
      DEFAULT_CONFIG_PATH,
      DEV_CONFIG_FILE_PATH
    );
  }

  console.log(`Server is listening at http://127.0.0.1:${port}`);
});
