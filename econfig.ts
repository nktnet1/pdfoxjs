import { Configuration } from 'electron-builder';

const config: Configuration = {
  icon: 'build/icon.png',
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
    main: 'out/src/main.js'
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
