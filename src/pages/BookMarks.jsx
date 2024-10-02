import { useState, useEffect } from "react";
import { useUser } from "../context/userContext";
import styles from "./BookMarks.module.css";

const BookMarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/bookmarks`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch bookmarks");
        }

        const data = await response.json();
        setBookmarks(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  const renderBookmarks = () => (
    <div className={styles.bookmarksContainer}>
      <h1 className={styles.title}>Your Bookmarks</h1>
      <div className={styles.bookmarksGrid}>
        {bookmarks.map((bookmark, index) => (
          <div key={index} className={styles.bookmarkCard}>
            <img
              src={bookmark.url}
              alt={bookmark.heading}
              className={styles.bookmarkImage}
            />
            <div className={styles.contentContainer}>
              <h2 className={styles.bookmarkHeading}>{bookmark.heading}</h2>
              <p className={styles.bookmarkDescription}>
                {bookmark.description}
              </p>
            </div>
            <div className={styles.gradientOverlay}> </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {loading && <p>Loading bookmarks...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && renderBookmarks()}
    </div>
  );
};

export default BookMarks;
