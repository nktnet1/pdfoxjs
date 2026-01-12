export const toHex = (str: string): string =>
  Buffer.from(str, 'utf8').toString('hex');

export const fromHex = (hex: string): string =>
  Buffer.from(hex, 'hex').toString('utf8');
