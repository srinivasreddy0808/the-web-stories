import { createContext, useContext } from "react";

export const NewsContext = createContext();

export const initialState = {
  selectedFilters: ["All"],
  storiesByFilter: {},
  loading: true,
  error: null,
};

export function newsReducer(state, action) {
  // ... (reducer logic)
  switch (action.type) {
    case "SET_FILTERS":
      return { ...state, selectedFilters: action.payload };
    case "SET_STORIES":
      return {
        ...state,
        storiesByFilter: action.payload,
        /* loading: false ,*/
        error: null,
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function useNews() {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error("useNews must be used within a NewsProvider");
  }
  return context;
}
