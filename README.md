# LoadableData

Simple framework-agnostic wrapper around loadable data to help encapsulate and use state changes in a UI.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Documentation](https://img.shields.io/badge/docs-tsdoc-blue.svg)](https://lab5e.github.io/loadabledata)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@lab5e/loadabledata.svg)](#tiny)
[![loadabledata](https://img.shields.io/npm/v/@lab5e/loadabledata.svg)](https://www.npmjs.com/package/@lab5e/loadabledata)
[![CI](https://github.com/lab5e/loadabledata/actions/workflows/main.yml/badge.svg)](https://github.com/lab5e/loadabledata/actions/workflows/main.yml)

## Examples

We have a [TSDoc](https://lab5e.github.io/loadabledata/) that will include all documentation as well as the examples below.

### Play around in codepen

[Codepen example](https://codepen.io/pkkummermo/pen/abJGxbx)

### Example: Vue in browser

```html
<body>
  ...
  <div id="app" v-cloak>
    <span v-if="myAsyncData.state.loading">Loading data</span>
    <span v-if="myAsyncData.state.ready">
      Lab5e has {{ myAsyncData.data.length }} public repositories!
    </span>
    <span v-if="myAsyncData.state.error">{{ myAsyncData.errorMessage }}</span>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/vue@2"></script>
  <script src="https://cdn.jsdelivr.net/npm/@lab5e/loadabledata"></script>
  <script>
    var app = new Vue({
      el: "#app",
      data() {
        return {
          myAsyncData: loadabledata.fromUrl(
            "https://api.github.com/users/lab5e/repos",
            (error) => `Error trying to fetch data. Error: ${error}`,
          ),
        };
      },
    });
  </script>
</body>
```

### Example: In ts

You must first install the dependency

```bash
npm i -S @lab5e/loadabledata
```

Then you can have a `Lab5eRepos.vue`-file which details the number of repositories Lab5e has publically available.

```html
<template>
  <div>
    <span v-if="myAsyncData.state.loading">Loading data</span>
    <span v-if="myAsyncData.state.ready">
      Lab5e has {{ myAsyncData.data.length }} public repositories!
    </span>
    <span v-if="myAsyncData.state.error">{{ myAsyncData.errorMessage }}</span>
  </div>
</template>

<script lang="ts">
  import { fromPromise, LoadableData } from "@lab5e/loadabledata";

  import Vue from "vue";
  export default Vue.extend({
    data(): { todos: LoadableData<Repositories[]> } {
      return {
        todos: fromUrl(
          "https://api.github.com/users/lab5e/repos",
          (error) => `Failed to list available todos. ${error}`,
          [],
        ),
      };
    },
  });
</script>
```

## Development

We use [TSDX](https://github.com/formium/tsdx) for pretty much everything, and most npm scripts just proxy to `tsdx`.

### Run single build

Use `npm run build`.

### Run tests

To run tests, use `npm test`.

## Configuration

Code quality is set up with `prettier`, `husky`, and `lint-staged`.

### Jest

Jest tests are set up to run with `npm test`.

#### Watch mode

To run in watch mode run `npm run test:watch`

#### Coverage

To see coverage run `npm run test:coverage`

### Bundle Analysis

[`size-limit`](https://github.com/ai/size-limit) is set up to calculate the real cost of your library with `npm run size` and visualize the bundle with `npm run analyze`.

### Rollup

We us TSDX which uses [Rollup](https://rollupjs.org) as a bundler and generates multiple rollup configs for various module formats and build settings. See [Optimizations](#optimizations) for details.

We create UMD, CommonJS, and JavaScript Modules in our build. The appropriate paths are configured in `package.json` and `dist/index.js`

### TypeScript

We use TypeScript for everything, giving us types for all the published packages.

## Continuous Integration

### GitHub Actions

- `main` which installs deps w/ cache, lints, tests, and builds on all pushes against a Node and OS matrix
- `size` which comments cost comparison of your library on every pull request using [`size-limit`](https://github.com/ai/size-limit)

## Publishing to NPM

We use `np`. To publish a new version, write `npx np` and follow the interactive tutorial.
