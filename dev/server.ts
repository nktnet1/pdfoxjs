import path from 'path';
import { AddressInfo } from 'net';
import createExpressApp from '../src/app';
import { APP_NAME } from '../src/config';

// Assume Linux environment with $HOME defined.
const userDataPath = path.join(process.env.HOME ?? '/', '.config', APP_NAME);

const app = createExpressApp({
  resourcesPath: 'public',
  userDataPath,
});

const server = app.listen(3000, () => {
  const addresses = server.address() as AddressInfo;
  const port = addresses.port;
  console.log(`Server is listening at http://127.0.0.1:${port}`);
});
