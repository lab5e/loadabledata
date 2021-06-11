import * as LoadableData from "./index";

describe("index", () => {
  it("should have all expected exported members", () => {
    expect(LoadableData.emptyLoadableData).toBeDefined();
    expect(LoadableData.emptyStates).toBeDefined();
    expect(LoadableData.fromPromise).toBeDefined();
    expect(LoadableData.fromUrl).toBeDefined();
  });
});
