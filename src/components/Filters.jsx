import { useRef, useEffect, useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";
import styles from "./Filters.module.css"; // You'll need to create this CSS module
import { useNews } from "../context/newsContext";

const Filters = ({ filterCategories, className }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const { state, dispatch } = useNews();
  const { selectedFilters } = state;

  const filterRef = useRef(null);

  const checkScroll = useCallback(() => {
    if (filterRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = filterRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  const scroll = (direction) => {
    if (filterRef.current) {
      const scrollAmount = filterRef.current.clientWidth / 2;
      filterRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };
  const handleFilterClick = useCallback(
    (filter) => {
      dispatch({
        type: "SET_FILTERS",
        payload:
          filter === "All"
            ? ["All"]
            : selectedFilters.includes(filter)
            ? selectedFilters.filter((f) => f !== filter)
            : [...selectedFilters.filter((f) => f !== "All"), filter],
      });
    },
    [selectedFilters, dispatch]
  );

  return (
    <div className={`${styles.filterContainer} ${className}`}>
      {showLeftArrow && (
        <button
          className={`${styles.scrollBtn} ${styles.leftBtn}`}
          onClick={() => scroll("left")}
        >
          <ChevronLeft />
        </button>
      )}
      <div className={styles.filterScroll} ref={filterRef}>
        {filterCategories.map((filter) => (
          <button
            key={filter}
            className={`${styles.filterBtn} ${
              selectedFilters.includes(filter) ? styles.active : ""
            }`}
            onClick={() => handleFilterClick(filter)}
          >
            <img src={`/images/${filter}.png`} alt={filter} />
            <div className={styles.filterOverlay}>
              <span className={styles.overlayText}>{filter}</span>
            </div>
          </button>
        ))}
      </div>
      {showRightArrow && (
        <button
          className={`${styles.scrollBtn} ${styles.rightBtn}`}
          onClick={() => scroll("right")}
        >
          <ChevronRight />
        </button>
      )}
    </div>
  );
};

Filters.propTypes = {
  filterCategories: PropTypes.arrayOf(PropTypes.string).isRequired, // Array of filter categories, required
  className: PropTypes.string,
};

export default Filters;
