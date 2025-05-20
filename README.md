<p align=center><img src="astra.png" width="100"/></p>
<h1 align=center>Astra</h1>
<p align=center>🚀 Fast, reliable and easy-to-use js-to-exe compiler.</p>
<p align=center><a href="https://astra-js.netlify.app">Docs</a> | <a href="https://npmjs.com/package/astra-cli">npm</a> | <a href="https://github.com/astracompiler/cli">GitHub</a></p>
<p align=center>
    <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/astra-cli">
    <img alt="NPM License" src="https://img.shields.io/npm/l/astra-cli">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/astra-cli">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/astracompiler/cli/main.yml">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/astracompiler/cli">
</p>

## Why Astra?
Astra is (probably) the best compiler available on npm.

Average exe is ~70-80MB (depends on your code) so it's lighter than most compilers

It's aiming to compile servers (express, fastify) or CLIs (commander) so it's not replacement of electron. 

For now it only compiles windows applications. (working on macOS and linux)
### Features
- **Delightful DX** - With [signale](https://npmjs.com/package/signale), [inquirer](https://www.npmjs.com/package/@inquirer/prompts) and [chalk](https://npmjs.com/package/chalk), Astra provides a great developer experience.
- **Fast build time** - Powered by [esbuild](https://npmjs.com/package/esbuild), Astra ensures the fastest possible compilation speed.
- **Improved support for ECMAScript** - Astra supports compiling ESM-based applications, with workarounds for limitations in Node.js SEA.
- **Standalone Executable** - Generates a single `.exe` or binary file that includes all dependencies.
- **Make exe your own** - Modify metadata (icon, name, version, etc.) of the generated executable.
- **Built-in Compression** - Reduces the size of the final executable.
## Getting Started
Install Astra globally using Yarn or npm:

```sh
# npm 
npm i -g astra-cli
# yarn
yarn global add astra-cli
# pnpm
pnpm add -g astra-cli

# for one project only
# npm
npm i --save-dev astra-cli
# yarn
yarn add --dev astra-cli
# pnpm
pnpm add -D astra-cli
```

Then, compile your JavaScript/TypeScript project:

```sh
astra build src/index.js
```

For more options, run:
```sh
astra --help
```

## How it works?
1. Code is linted and bundled with esbuild,
2. Then astra is generating blob which will be injected into node.exe binary,
3. Next astra is editing metadata of your binary (adding icon, copyright),
4. And finally postject injects blob into final executable.

## Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.

## License
Astra is licensed under the MIT License.

---
<p align=center>Made with ❤️ by QwertyCodeQC</p>

