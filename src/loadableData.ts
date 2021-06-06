/**
 * States represents the different states a {@link LoadableData} can be in as an
 * object with bool values.
 */
export interface States {
  none: boolean;
  loading: boolean;
  ready: boolean;
  error: boolean;
}

/**
 * LoadableData is an object structure for easily handling state changes.
 *
 * @see {@link fromPromise} for creating from a LoadableData from promise
 * @see {@link fromUrl} for creating from a LoadableData from url
 */
export interface LoadableData<DataObject> {
  data: DataObject;
  state: States;
  errorMessage: string;
  promise?: Promise<DataObject>;
}

/**
 * Gives an empty {@link LoadableData} for initialization purposes
 */
export const emptyLoadableData = function<T>(initialData: T): LoadableData<T> {
  return {
    data: initialData,
    errorMessage: "",
    state: emptyStates(),
  };
};

/**
 * Convenience method for returning an empty state object for {@link LoadableData}
 *
 * @returns A 'none' state object which is the default initial value for {@link LoadableData}
 */
export const emptyStates = function(): States {
  return {
    none: true,
    loading: false,
    error: false,
    ready: false,
  };
};

/**
 * Creates a {@link LoadableData} object with the type from a given Promise. It will update
 * the {@link LoadableData} according to the Promise lifecycle.
 *
 * @param promise The Promise<T> to be used in the loadable data
 * @param errorHandler [Optional] The error message handler if an error occurs
 * @param initialData [Optional] The initial data to load the data field with
 */
const fromPromise = function<T>(
  promise: Promise<T>,
  errorHandler = (error: Error) => {
    return `Failed to load data. ${error}`;
  },
  initialData = (null as unknown) as T,
): LoadableData<T> {
  const loadableData: LoadableData<T> = {
    data: initialData,
    errorMessage: "",
    state: {
      loading: true,
      error: false,
      none: false,
      ready: false,
    },
    promise: promise,
  };

  promise
    .then((data) => {
      loadableData.data = data;
      loadableData.state.loading = false;
      loadableData.state.ready = true;

      return data;
    })
    .catch((error) => {
      loadableData.state.loading = false;
      loadableData.state.error = true;
      loadableData.errorMessage = errorHandler(error);

      return error;
    });

  return loadableData;
};

/**
 * Creates a LoadableData object and uses fetch to retrieve data from given URL.
 * The type is given by generics. It will update the LoadableData according to
 * the fetch lifecycle.
 *
 * @param promise The Promise<T> to be used in the loadable data
 * @param errorHandler [Optional] The error message handler if an error occurs
 * @param initialData [Optional] The initial data to load the data field with
 */
const fromUrl = function<T>(
  url: string,
  errorHandler = (error: Error) => {
    return `Failed to load data. ${error}`;
  },
  initialData = (null as unknown) as T,
): LoadableData<T> {
  const loadableData: LoadableData<T> = {
    data: initialData,
    errorMessage: "",
    state: {
      loading: true,
      error: false,
      none: false,
      ready: false,
    },
  };

  loadableData.promise = fetch(url)
    .then((response) => {
      if (response.ok) {
        if (response.headers.get("content-type") === "application/json") {
          return response.json();
        } else {
          return response.text();
        }
      }
      throw JSON.stringify({ code: response.status, text: response.statusText });
    })
    .then((data) => {
      loadableData.data = data;
      loadableData.state.loading = false;
      loadableData.state.ready = true;
      return data;
    })
    .catch((error) => {
      loadableData.errorMessage = errorHandler(error);
      loadableData.state.loading = false;
      loadableData.state.error = true;
    });

  return loadableData;
};

export { fromPromise, fromUrl };
