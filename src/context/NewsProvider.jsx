import { NewsContext, initialState, newsReducer } from "./newsContext";
import { useReducer } from "react";
import PropTypes from "prop-types";
export function NewsProvider({ children }) {
  const [state, dispatch] = useReducer(newsReducer, initialState);

  return (
    <NewsContext.Provider value={{ state, dispatch }}>
      {children}
    </NewsContext.Provider>
  );
}

NewsProvider.propTypes = {
  children: PropTypes.node.isRequired, // Specify that children is required and should be a React node
};
