import { AddressInfo } from 'net';
import createExpressApp from './app';

const app = createExpressApp();
const server = app.listen(3000, () => {
  const addresses = server.address() as AddressInfo;
  const port = addresses.port;
  console.log(`Server is listening at http://127.0.0.1:${port}`);
});
