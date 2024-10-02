import { X, Bookmark, Heart, Download, Send } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { determineMediaType } from "../utils/mediaTypeChecker";
import { useUser } from "../context/userContext";
import { showToast } from "../components/Toastify";
import styles from "./StoryModal.module.css";
import PropTypes from "prop-types";

const StoryModal = ({ setHomeKey }) => {
  const { id, slideIndex } = useParams();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(
    slideIndex ? parseInt(slideIndex, 10) : 0
  );
  const { user } = useUser();
  const { userId = "" } = user || {};
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slides, setSlides] = useState([]);
  const [currentMediaType, setCurrentMediaType] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    const determineCurrentMediaType = async () => {
      if (slides[currentSlideIndex]) {
        const mediaType = await determineMediaType(
          slides[currentSlideIndex].url
        );
        setCurrentMediaType(mediaType);
      }
    };

    determineCurrentMediaType();
  }, [currentSlideIndex, slides]);

  useEffect(() => {
    const fetchStory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/stories/${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch story");
        }

        const data = await response.json();
        setStory(data.data.story);
        setSlides(data.data.story.slides);
      } catch (error) {
        showToast("error", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  const onClose = useCallback(() => {
    setHomeKey((key) => key + 1);
    navigate("/", { replace: true });
  }, [navigate, setHomeKey]);

  useEffect(() => {
    if (!story) return;
    const timer = setTimeout(() => {
      if (currentSlideIndex < story.slides.length - 1) {
        setCurrentSlideIndex(currentSlideIndex + 1);
      } else {
        onClose();
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [currentSlideIndex, story, onClose]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      if (currentSlideIndex > 0) {
        setCurrentSlideIndex(currentSlideIndex - 1);
      }
    } else {
      if (currentSlideIndex < story.slides.length - 1) {
        setCurrentSlideIndex(currentSlideIndex + 1);
      } else {
        onClose();
      }
    }
  };

  const updateSlide = useCallback(
    async (action, e) => {
      e.stopPropagation();
      console.log("updateSlide");
      if (!user) {
        console.log("User not logged in");
        navigate("/login");
      }

      if (!userId || !story) return;

      // Don't proceed if we don't have a user ID

      const currentSlide = slides[currentSlideIndex];
      let updatedSlide = { ...currentSlide };

      if (action === "bookmark") {
        const isBookMarked = currentSlide.bookMarked.includes(userId);
        updatedSlide.bookMarked = isBookMarked
          ? currentSlide.bookMarked.filter((id) => id !== userId)
          : [...currentSlide.bookMarked, userId];
      } else if (action === "like") {
        const isLiked = currentSlide.liked.includes(userId);
        updatedSlide.liked = isLiked
          ? currentSlide.liked.filter((id) => id !== userId)
          : [...currentSlide.liked, userId];
        updatedSlide.likesCount = updatedSlide.liked.length;
      }

      setSlides((prevSlides) => {
        const newSlides = [...prevSlides];
        newSlides[currentSlideIndex] = updatedSlide;
        return newSlides;
      });

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/stories/story/${
            story._id
          }/slide/${currentSlide._id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              bookMarked: updatedSlide.bookMarked,
              liked: updatedSlide.liked,
              likesCount: updatedSlide.likesCount,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update slide");
        }
      } catch (error) {
        setSlides((prevSlides) => {
          const newSlides = [...prevSlides];
          newSlides[currentSlideIndex] = currentSlide;
          return newSlides;
        });
      }
    },
    [currentSlideIndex, slides, story, user, navigate, userId]
  );

  const handleDownload = useCallback(
    async (e) => {
      e.stopPropagation();
      const currentSlide = slides[currentSlideIndex];

      try {
        const response = await fetch(currentSlide.url);
        if (!response.ok) throw new Error("Network response was not ok");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `slide_${currentSlideIndex + 1}.${
          blob.type.split("/")[1]
        }`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showToast("Download completed successfully!");
      } catch (error) {
        console.error("Download failed:", error);
        showToast("Download failed. Please try again.");
      }
    },
    [currentSlideIndex, slides]
  );
  const handleShare = useCallback(
    (e) => {
      e.stopPropagation();
      const shareUrl = `${
        import.meta.env.VITE_FRONTEND_URL
      }/story/${id}/${currentSlideIndex}`;
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          showToast("Link copied to clipboard");
        })
        .catch((err) => {
          showToast("Failed to copy link", err?.message || "");
        });
    },
    [id, currentSlideIndex]
  );
  const handleLeftArrowClick = (e) => {
    e.stopPropagation();
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };
  const handleRightArrowClick = (e) => {
    e.stopPropagation();
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!story) {
    return <div className={styles.error}>Failed to load story</div>;
  }

  const currentSlide = slides[currentSlideIndex];
  const isBookMarked = userId
    ? currentSlide?.bookMarked.includes(userId)
    : false;
  const isLiked = userId ? currentSlide?.liked.includes(userId) : false;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer}>
        <button className={styles.leftArrow} onClick={handleLeftArrowClick}>
          <ChevronLeft size={59} color="#fff" />
        </button>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.storyContainer} onClick={handleClick}>
            <div className={styles.gradientOverlay}> </div>

            <div className={styles.storyTop}>
              <div className={styles.progressBar}>
                {slides.map((_, index) => (
                  <div
                    key={index}
                    className={`${styles.progressSegment} ${
                      index <= currentSlideIndex ? styles.active : ""
                    }`}
                  />
                ))}
              </div>
              <div className={styles.storyHeader}>
                <button className={styles.closeButton} onClick={onClose}>
                  <X />
                </button>
                <button onClick={handleShare} className={styles.shareButton}>
                  <Send color="white" />
                </button>
              </div>
            </div>

            {currentMediaType === "video" ? (
              <video
                src={currentSlide.url}
                autoPlay
                controls
                className={styles.storyVideo}
              />
            ) : (
              <img
                src={currentSlide.url}
                alt={currentSlide.heading}
                className={styles.storyImage}
              />
            )}
            <div className={styles.storyBottom}>
              <div className={styles.storyText}>
                <h3>{currentSlide.heading}</h3>
                <p>{currentSlide.description}</p>
              </div>
              <div className={styles.actionButtons}>
                <button
                  onClick={(e) => updateSlide("bookmark", e)}
                  className={`${styles.actionButton} ${
                    isBookMarked ? styles.active : ""
                  }`}
                >
                  <Bookmark
                    size={30}
                    color={isBookMarked ? "blue" : "white"}
                    fill={isBookMarked ? "blue" : "white"}
                  />
                </button>
                {user && (
                  <button
                    onClick={handleDownload}
                    className={styles.actionButton}
                  >
                    <Download size={30} color="#fff" />
                  </button>
                )}
                <button
                  onClick={(e) => updateSlide("like", e)}
                  className={`${styles.actionButton} ${
                    isLiked ? styles.active : ""
                  }`}
                >
                  <Heart
                    size={30}
                    color={isLiked ? "red" : "white"}
                    fill={isLiked ? "red" : "white"}
                  />
                  <span>{currentSlide.likesCount}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <button className={styles.rightArrow} onClick={handleRightArrowClick}>
          <ChevronRight size={59} color="#fff" />
        </button>
      </div>
    </div>
  );
};

StoryModal.propTypes = {
  setHomeKey: PropTypes.func.isRequired,
};

export default StoryModal;
