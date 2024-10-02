import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { determineMediaType } from "../utils/mediaTypeChecker";
import PropTypes from "prop-types";
import styles from "./StoryGrid.module.css";

const StoryGrid = ({ stories, title, showEdit = false, className = "" }) => {
  const navigate = useNavigate();
  const [showAllStories, setShowAllStories] = useState(false);
  const [storiesMediaType, setStoriesMediaType] = useState([]);

  useEffect(() => {
    const fetchStoriesMediaType = async () => {
      const mediaTypes = await Promise.all(
        stories.map(async (story) => {
          const mediaType = await determineMediaType(story.slides[0].url);
          return mediaType;
        })
      );
      setStoriesMediaType(mediaTypes);
    };
    fetchStoriesMediaType();
  }, [stories]);

  const handleStoryClick = useCallback(
    (story) => {
      navigate(`/story/${story._id}`);
    },
    [navigate]
  );

  const handleSeeMore = () => {
    setShowAllStories((prevShowAllStories) => !prevShowAllStories);
  };

  const handleEditClick = (e, story) => {
    e.stopPropagation();
    navigate(`/add-story`, { state: { ...story } });
    console.log(story, "story");
  };

  if (!stories || stories.length === 0) {
    return (
      <div className={`${styles.storyNotFound} ${className}`}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.noStoriesContainer}>
          <p className={styles.noStories}>No stories found.</p>
        </div>
      </div>
    );
  }

  const visibleStories = showAllStories ? stories : stories.slice(0, 4);

  return (
    <div className={`${styles.storySection} ${className}`}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.storiesGrid}>
        {visibleStories.map((story, index) => (
          <div
            key={index}
            className={styles.storyCard}
            onClick={() => handleStoryClick(story)}
          >
            <div className={styles.imageContainer}>
              <img
                src={
                  storiesMediaType[index] === "video"
                    ? `/images/dummy.png`
                    : story.slides[0].url
                }
                alt={story.slides[0].heading}
                className={styles.storyImage}
              />

              <div className={styles.gradientOverlay}></div>
            </div>

            <div className={styles.contentContainer}>
              <h3 className={styles.storyTitle}>{story.slides[0].heading}</h3>
              <p className={styles.storyDescription}>
                {story.slides[0].description}
              </p>
            </div>
            {showEdit && (
              <button
                className={styles.editBtn}
                onClick={(e) => handleEditClick(e, story)}
              >
                <span className={styles.editIcon}>
                  <FiEdit size={20} />
                </span>{" "}
                Edit
              </button>
            )}
          </div>
        ))}
      </div>
      <button className={styles.seeMoreBtn} onClick={() => handleSeeMore()}>
        {showAllStories ? "See Less" : "See More"}
      </button>
    </div>
  );
};
StoryGrid.propTypes = {
  stories: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      slides: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.string.isRequired,
          heading: PropTypes.string.isRequired,
          description: PropTypes.string,
        })
      ),
    })
  ),
  title: PropTypes.string.isRequired,
  showEdit: PropTypes.bool,
  className: PropTypes.string,
};

export default StoryGrid;
