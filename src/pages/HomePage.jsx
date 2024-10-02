import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useNews } from "../context/newsContext";
import { useUser } from "../context/userContext";
import styles from "./HomePage.module.css";
import BookMarks from "./BookMarks";
import Header from "../components/Header";
import Filters from "../components/Filters";
import StoryGrid from "../components/StoryGrid";

const filterCategories = [
  "All",
  "Medical",
  "Fruits",
  "World",
  "India",
  "Sports",
  "Technology",
];

const HomePage = () => {
  const { state, dispatch } = useNews();
  const { user, logout } = useUser(); // Get user info from usercontext
  const { selectedFilters, storiesByFilter, loading, error } = state;

  const [showBookmarks, setShowBookmarks] = useState(false);
  const [userStories, setUserStories] = useState([]);
  const [yourStory, setYourStory] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      const newStoriesByFilter = {};
      const filtersToFetch = selectedFilters.includes("All")
        ? filterCategories.filter((f) => f !== "All")
        : selectedFilters;

      try {
        // Fetch user stories if logged in
        if (user) {
          const userStoriesResponse = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/v1/stories`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${user.token}`,
                "Content-Type": "application/json", // If you're sending JSON data
              },
            }
          );

          const userStoriesData = await userStoriesResponse.json();
          setUserStories(userStoriesData.data.stories);
        }
        for (const filter of filtersToFetch) {
          const response = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/api/v1/stories/story/${filter}`
          );
          const data = await response.json();
          newStoriesByFilter[filter] = data;
        }

        dispatch({ type: "SET_STORIES", payload: newStoriesByFilter });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to fetch stories. Please try again.",
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    fetchStories();
  }, [selectedFilters, dispatch, user]);

  return (
    <div className={styles.container}>
      <Header
        user={user}
        logout={logout}
        setShowBookmarks={setShowBookmarks}
        setYourStory={setYourStory}
      />

      {showBookmarks ? (
        <BookMarks />
      ) : (
        <>
          <Filters
            filterCategories={filterCategories}
            className={yourStory ? `${styles.mobileActive}` : ""}
          />

          <main>
            {loading && <div className={styles.loadingSpinner}></div>}
            {error && <p className={styles.error}>{error}</p>}
            {!loading && !error && (
              <>
                {user && userStories.length > 0 && (
                  <StoryGrid
                    stories={userStories}
                    title="Your Stories"
                    showEdit={true}
                    className={`${
                      yourStory ? "" : `${styles.mobileActive}`
                    }   `}
                  />
                )}
                {selectedFilters.includes("All")
                  ? filterCategories
                      .filter((f) => f !== "All")
                      .map((filter) => (
                        <StoryGrid
                          key={filter}
                          stories={storiesByFilter[filter]?.data?.stories}
                          title={`Top Stories About ${filter}`}
                          className={yourStory ? styles.mobileActive : ""}
                        />
                      ))
                  : selectedFilters.map((filter) => (
                      <StoryGrid
                        key={filter}
                        stories={storiesByFilter[filter]?.data?.stories}
                        title={`Top Stories About ${filter}`}
                        className={yourStory ? styles.mobileActive : ""}
                      />
                    ))}
              </>
            )}
          </main>
        </>
      )}

      <Outlet />
    </div>
  );
};

export default HomePage;
