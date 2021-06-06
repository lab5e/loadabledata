# LoadableData

Simple wrapper around loadable data to help encapsulate and use state changes in a UI.

## Example: Vue in browser

```html
<body>
  ...
  <div id="app">
    <span v-if="myAsyncData.state.loading">Loading data</span>
    <span v-if="myAsyncData.state.ready">
      We actually got some data: {{ JSON.stringify(myAsyncData.data) }}
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
          myAsyncData: loadableData.fromUrl(
            "https://example.com/json",
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
npm i @lab5e/loadabledata
```

## Available convenience functions

### loadableDataFromPromise example

### loadableDataFromUrl example
