# LoadableData

Simple framework-agnostic wrapper around loadable data to help encapsulate and use state changes in a UI.

[Codepen example](https://codepen.io/pkkummermo/pen/abJGxbx)

## Example: Vue in browser

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

## Example: In ts

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

## Available convenience functions

### loadableDataFromPromise example

Given that you have a method that returns a `Promise` with the signature `Promise<Todo[]>`:

```ts
listTodos(): Promise<Todo[]>() { ... }
```

You can then use the convenience method `fromPromise` which can be imported directly from the loadabledata package. A fully working example can be shown underneath:

```html
<template>
  <div>
    <loader-spinner v-if="todos.loadingState.loading"></loader-spinner>
    <span v-if="todos.loadingState.error">
      {{ todos.errorMessage }}
    </span>
    <todo-component
      v-if="todos.loadingState.ready"
      v-for="todo of todos.data"
      :key="todo.id"
      :todo="todo"
    >
    </todo-component>
  </div>
</template>

<script lang="ts">
  import { fromPromise, LoadableData } from "@lab5e/loadabledata";

  import Vue from "vue";
  export default Vue.extend({
    data(): { todos: LoadableData<Todo[]> } {
      return {
        todos: fromPromise(listTodos(), (error) => `Failed to list available todos. ${error}`, []),
      };
    },
  });
</script>
```

### loadableDataFromUrl example
