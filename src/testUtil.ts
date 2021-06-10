import { LoadableData } from "./loadableData";

export enum StateType {
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
export const hasOnlyState = (loadableData: LoadableData<any>, state: StateType): boolean => {
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
