<p align=center><img src="https://raw.githubusercontent.com/astracompiler/cli/main/astra.png" width="100"/></p>
<h1 align=center>Astra</h1>
<p align=center>🚀 Fast, reliable and easy-to-use js-to-exe compiler.</p>
<p align=center><a href="https://astra-js.netlify.app">Docs</a> | <a href="https://npmjs.com/package/astra-cli">npm</a> | <a href="https://github.com/astracompiler/cli">GitHub</a></p>
<p align=center>
    <a href="#"><img alt="NPM Downloads" src="https://img.shields.io/npm/dw/astra-cli?label="></a>
    <a href="https://npmjs.com/package/astra-cli"><img alt="NPM Version" src="https://img.shields.io/npm/v/astra-cli?label="></a>
    <a href="https://github.com/astracompiler/cli/actions"><img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/astracompiler/cli/main.yml?label="></a>
    <br/>
    <a href="https://app.netlify.com/projects/astra-js/deploys"><img alt="Netlify status" src="https://api.netlify.com/api/v1/badges/1737b126-dce7-4d82-9b76-8743c4ec3b67/deploy-status"/></a>
    <a href="https://codecov.io/gh/astracompiler/cli"><img src="https://codecov.io/gh/astracompiler/cli/graph/badge.svg?token=OJVP05V5YB"/></a>
    <a href="https://app.codacy.com/gh/astracompiler/cli/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade"><img src="https://app.codacy.com/project/badge/Grade/a6cdab2a4e974051890141c53ce8bb58"/></a>
    <a href="https://github.com/astracompiler/cli/"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/astracompiler/cli"></a>
</p>

## Why Astra?
Astra is (probably) the best compiler available on npm.

Average exe is ~70-80MB (depends on your code) so it's lighter than most compilers

Using [upx](https://github.com/upx/upx) you can go down up to ~30MB

It's aiming to compile servers (express, fastify) or CLIs (commander) so it's not replacement of electron. 

For now it only compiles windows applications. (working on macOS and linux)

### Features
- **Different than the others** - Astra is a new approach to compiling JavaScript/TypeScript applications. It uses a different method than other compilers like pkg or nexe. 

- **Compile newest versions of Node.js** - Astra supports the latest Node.js versions.

- **Fast build time** - Powered by [esbuild](https://npmjs.com/package/esbuild), Astra ensures the fastest possible compilation speed.

- **Improved support for ECMAScript** - Astra supports compiling ESM-based applications, with workarounds for limitations in Node.js SEA.

- **Delightful DX** - With [signale](https://npmjs.com/package/signale), [inquirer](https://www.npmjs.com/package/@inquirer/prompts) and [chalk](https://npmjs.com/package/chalk), Astra provides a great developer experience.

- **Standalone Executable** - Generates a single `.exe` or binary file that includes all dependencies.

- **Make exe your own** - Modify metadata (icon, name, version, etc.) of the generated executable.

- **Future-proof** - Made with trusted, constantly evolving tools.

## Contributing
🤝 I welcome pull requests! Every contribution will be reviewed and appreciated - even small fixes.

## Getting Started
Install Astra globally using Yarn or npm:

```sh
# npm 
npm i -g astra-cli
# yarn (classic)
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

## License
Astra is licensed under the MIT License.

---
<p align=center>Made with ❤️ by QwertyCodeQC</p>

