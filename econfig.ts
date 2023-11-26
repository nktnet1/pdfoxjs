import path from 'path';
import { Configuration } from 'electron-builder';

const config: Configuration = {
  icon: path.join('build', 'icon.png'),
  appId: 'com.nktnet.pdfoxjs',
  productName: 'pdfoxjs',
  asar: true,
  directories: {
    output: 'dist',
  },
  files: [
    'out'
  ],
  extraResources: [
    'public'
  ],
  extraMetadata: {
    main: path.join('out', 'main.js'),
  },

  win: {
    target: 'nsis',
  },

  mac: {
    target: 'dmg',
  },

  linux: {
    target: 'AppImage',
    category: 'Office',
  },
  extends: null,
};

export default config;
