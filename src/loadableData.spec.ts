const fetch = require("node-fetch");

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

import { emptyLoadableData, fromPromise, fromUrl, LoadableData } from "./loadableData";
import { setupServer } from "msw/node";
import { rest } from "msw";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const TEST_URL = "https://example.com";

describe("loadableData", () => {
  describe("emptyLoadableData", () => {
    it("should return an empty LoadableData", () => {
      const loadableData = emptyLoadableData("Initial data");

      expect(hasOnlyState(loadableData, StateType.NONE)).toBe(true);
      expect(loadableData.data).toBe("Initial data");
    });
  });

  describe("fromPromise", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it("should change state upon successful promise", async () => {
      const testPromise = Promise.resolve("success");

      const loadableData = fromPromise(testPromise);

      expect(hasOnlyState(loadableData, StateType.LOADING)).toBe(true);
      expect(loadableData.data).toBe(null);

      await testPromise?.then(() => {
        expect(hasOnlyState(loadableData, StateType.READY)).toBe(true);
        expect(loadableData.data).toBe("success");
      });
    });

    it("should change state upon failed promise", async () => {
      const testPromise = new Promise((_, rej) => {
        setTimeout(() => {
          rej("failure");
        }, 50);
      });

      const loadableData = fromPromise(testPromise);

      expect(hasOnlyState(loadableData, StateType.LOADING)).toBe(true);
      expect(loadableData.errorMessage).toBe("");
      expect(loadableData.data).toBe(null);

      jest.runAllTimers();

      try {
        await testPromise?.then(() => {
          throw new Error("Failed to create error");
        });
      } catch {
        expect(hasOnlyState(loadableData, StateType.ERROR)).toBe(true);
        expect(loadableData.errorMessage).toBe("Failed to load data. failure");
      }
    });

    it("should allow for an initial state", async () => {
      const testPromise = Promise.resolve("success");

      const loadableData = fromPromise(
        testPromise,
        (error) => `Test promise failed. ${error}`,
        "My initial data",
      );

      expect(hasOnlyState(loadableData, StateType.LOADING)).toBe(true);
      expect(loadableData.data).toBe("My initial data");

      await loadableData.promise?.then(() => {
        expect(hasOnlyState(loadableData, StateType.READY)).toBe(true);
        expect(loadableData.data).toBe("success");
      });
    });

    it("should allow for an initial state and error msg for failed promise", async () => {
      const testPromise = new Promise((_, rej) => {
        setTimeout(() => {
          rej("failure");
        }, 50);
      });

      const loadableData = fromPromise(
        testPromise,
        (error) => `Custom error: ${error}`,
        "My initial data",
      );

      expect(hasOnlyState(loadableData, StateType.LOADING)).toBe(true);
      expect(loadableData.errorMessage).toBe("");
      expect(loadableData.data).toBe("My initial data");

      jest.runAllTimers();

      try {
        await testPromise?.then(() => {
          throw new Error("Failed to create error");
        });
      } catch {
        expect(hasOnlyState(loadableData, StateType.ERROR)).toBe(true);
        expect(loadableData.errorMessage).toBe("Custom error: failure");
      }
    });
  });

  describe("fromUrl", () => {
    beforeAll(() => {
      jest.useRealTimers();
    });

    it("should change state upon successful response", async () => {
      server.use(
        rest.get(TEST_URL, (_, res, ctx) => {
          return res(ctx.status(200), ctx.body("success"), ctx.set("content-type", "text/plain"));
        }),
      );

      const loadableData = fromUrl(TEST_URL);

      expect(hasOnlyState(loadableData, StateType.LOADING)).toBe(true);
      expect(loadableData.data).toBe(null);

      await loadableData.promise?.then(() => {
        expect(hasOnlyState(loadableData, StateType.READY)).toBe(true);
        expect(loadableData.data).toBe("success");
      });
    });

    it("should change state upon failed response", async () => {
      server.use(
        rest.get(TEST_URL, (_, res, ctx) => {
          return res(ctx.status(401));
        }),
      );

      const loadableData = fromUrl(TEST_URL);

      expect(hasOnlyState(loadableData, StateType.LOADING)).toBe(true);
      expect(loadableData.data).toBe(null);

      await loadableData.promise?.then(() => {
        expect(hasOnlyState(loadableData, StateType.ERROR)).toBe(true);
        expect(loadableData.errorMessage).toBe(
          `Failed to load data. {\"code\":401,\"text\":\"Unauthorized\"}`,
        );
      });
    });

    it("should allow for an initial state", async () => {
      server.use(
        rest.get(TEST_URL, (_, res, ctx) => {
          return res(ctx.status(200), ctx.body("success"), ctx.set("content-type", "text/plain"));
        }),
      );

      const loadableData = fromUrl(
        TEST_URL,
        (error) => `Test response failed. ${error}`,
        "My initial data",
      );

      expect(hasOnlyState(loadableData, StateType.LOADING)).toBe(true);
      expect(loadableData.data).toBe("My initial data");

      await loadableData.promise?.then(() => {
        expect(hasOnlyState(loadableData, StateType.READY)).toBe(true);
        expect(loadableData.data).toBe("success");
      });
    });

    it("should allow for an initial state and error msg for failed response", async () => {
      server.use(
        rest.get(TEST_URL, (_, res, ctx) => {
          return res(ctx.status(401));
        }),
      );

      const loadableData = fromUrl(
        TEST_URL,
        (error) => `Test response failed. ${error}`,
        "My initial data",
      );

      expect(hasOnlyState(loadableData, StateType.LOADING)).toBe(true);
      expect(loadableData.data).toBe("My initial data");

      await loadableData.promise?.then(() => {
        expect(hasOnlyState(loadableData, StateType.ERROR)).toBe(true);
        expect(loadableData.errorMessage).toBe(
          `Test response failed. {\"code\":401,\"text\":\"Unauthorized\"}`,
        );
      });
    });

    it("should handle payloads with no specific content-type", async () => {
      server.use(
        rest.get(TEST_URL, (_, res, ctx) => {
          return res(ctx.status(200), ctx.body("success"));
        }),
      );

      const loadableData = fromUrl(TEST_URL);

      expect(hasOnlyState(loadableData, StateType.LOADING)).toBe(true);
      expect(loadableData.data).toBe(null);

      await loadableData.promise?.then(() => {
        expect(hasOnlyState(loadableData, StateType.READY)).toBe(true);
        expect(loadableData.data).toBe("success");
      });
    });

    it("should handle non-JSON payloads", async () => {
      server.use(
        rest.get(TEST_URL, (_, res, ctx) => {
          return res(ctx.status(200), ctx.body("success"), ctx.set("content-type", "text/plain"));
        }),
      );

      const loadableData = fromUrl(TEST_URL);

      expect(hasOnlyState(loadableData, StateType.LOADING)).toBe(true);
      expect(loadableData.data).toBe(null);

      await loadableData.promise?.then(() => {
        expect(hasOnlyState(loadableData, StateType.READY)).toBe(true);
        expect(loadableData.data).toBe("success");
      });
    });

    it("should handle JSON payloads", async () => {
      server.use(
        rest.get(TEST_URL, (_, res, ctx) => {
          return res(ctx.status(200), ctx.json({ myData: "is amazing" }));
        }),
      );

      const loadableData = fromUrl(TEST_URL);

      expect(hasOnlyState(loadableData, StateType.LOADING)).toBe(true);
      expect(loadableData.data).toBe(null);

      await loadableData.promise?.then(() => {
        expect(hasOnlyState(loadableData, StateType.READY)).toBe(true);
        expect(loadableData.data).toStrictEqual({ myData: "is amazing" });
      });
    });
  });
});

enum StateType {
  NONE,
  LOADING,
  READY,
  ERROR,
}

/**
 * Helper function to ensure that a LoadableData only has one
 * state set
 *
 * @param loadableData LoadableData to test for state
 * @param state The only state that should be true
 * @returns Boolean dependent if only given state is true
 */
const hasOnlyState = (loadableData: LoadableData<any>, state: StateType): boolean => {
  switch (state) {
    case StateType.NONE: {
      return (
        loadableData.state.none &&
        !loadableData.state.loading &&
        !loadableData.state.ready &&
        !loadableData.state.error
      );
    }
    case StateType.LOADING: {
      return (
        !loadableData.state.none &&
        loadableData.state.loading &&
        !loadableData.state.ready &&
        !loadableData.state.error
      );
    }
    case StateType.READY: {
      return (
        !loadableData.state.none &&
        !loadableData.state.loading &&
        loadableData.state.ready &&
        !loadableData.state.error
      );
    }
    case StateType.ERROR: {
      return (
        !loadableData.state.none &&
        !loadableData.state.loading &&
        !loadableData.state.ready &&
        loadableData.state.error
      );
    }
  }
};
