import esbuild from 'esbuild';
/**
 * @typedef {Object} Config
 * @property {string} [outFile] - Output file path
 * @property {string} [outDir] - Output directory
 * @property {esbuild.BuildOptions} [esbuild] - esbuild options
 * @property {string[]} [assets] - Assets to include in the blob
 * @property {{ icon: string, companyName: string, fileDescription: string, productName: string, fileVersion: string, productVersion: string, copyright: string }} [exe] - Application metadata (like icon, name, description etc.)
 */ 
 