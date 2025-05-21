/**
 * @typedef {Object} Config
 * @property {string} [outFile] - Output file path
 * @property {string} [outDir] - Output directory
 * @property {Object} [esbuild] - esbuild options (see https://esbuild.github.io/api/)
 * @property {string[]} [assets] - Assets to include in the blob
 * @property {boolean} [modifyMetadata] - Defaults to true. If false, the metadata (icon, copyright) will not be modified.
 * @property {{ icon: string, companyName: string, fileDescription: string, productName: string, fileVersion: string, productVersion: string, copyright: string }} [exe] - Application metadata (like icon, name, description etc.)
 */
export default {
  outFile: 'dist/app.exe',

  esbuild: {
    // esbuild options (optional)
  },

  modifyMetadata: true, // modify metadata of the executable (useful if you have macOS and don't have wine installed)

  exe: {
    companyName: 'Your Company',             // your company name
    productName: 'Your App',                 // name of your app
    fileDescription: 'Your App Description', // description of your app
    productVersion: '1.0.0',                 // version of your app
    fileVersion: '1.0.0.0',                  // file version
    icon: 'path/to/icon.ico',                // path to the app icon (optional)
  }
}