import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";
import { XCircle } from "lucide-react";
import { useUser } from "../context/userContext"; // Assume this context exists
import { determineMediaType } from "../utils/mediaTypeChecker";
import styles from "./AddStoryModal.module.css";

const AddStoryModal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const [activeSlide, setActiveSlide] = useState(1);
  const [slides, setSlides] = useState(
    location.state?.slides?.map((slide) => ({
      ...slide,
      image: slide.url,
    })) || [{}, {}, {}]
  );
  const [category, setCategory] = useState(location.state?.category || "");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");
  const [videoErrors, setVideoErrors] = useState({});

  const onClose = () => navigate("/");

  const checkVideoDuration = (url, slideIndex) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        console.log(`Video duration: ${video.duration} seconds`);
        if (video.duration > 15.5) {
          setVideoErrors((prev) => ({
            ...prev,
            [slideIndex]: "Video length is more than 15 sec",
          }));
          resolve(false);
        } else {
          setVideoErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[slideIndex];
            return newErrors;
          });
          resolve(true);
        }
      };
      video.onerror = () => {
        setVideoErrors((prev) => ({
          ...prev,
          [slideIndex]: "Invalid video URL",
        }));
        resolve(false);
      };
      video.src = url;
    });
  };

  const handleNext = () => {
    if (activeSlide < slides.length) {
      setActiveSlide(activeSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (activeSlide > 1) {
      setActiveSlide(activeSlide - 1);
    }
  };

  const handleAddSlide = () => {
    if (slides.length < 6) {
      setSlides([...slides, {}]);
    }
  };

  const handleRemoveSlide = (index) => {
    if (slides.length > 3) {
      const newSlides = slides.filter((_, i) => i !== index);
      setSlides(newSlides);
      if (activeSlide > newSlides.length) {
        setActiveSlide(newSlides.length);
      }
    }
  };

  const handleInputChange = async (field, value) => {
    console.log(handleInputChange, "handleInputChange");
    const updatedSlides = [...slides];
    updatedSlides[activeSlide - 1] = {
      ...updatedSlides[activeSlide - 1],
      [field]: value,
    };
    setSlides(updatedSlides);

    if (field === "image") {
      // Clear the error message when a new URL is entered
      setVideoErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[activeSlide - 1];
        return newErrors;
      });
      // Check video duration
      if (value) {
        await determineMediaType(value)
          .then(async (type) => {
            if (type === "video") {
              await checkVideoDuration(value, activeSlide - 1);
            }
          })
          .catch(() => {
            setVideoErrors((prev) => ({
              ...prev,
              [activeSlide - 1]: "Error determining media type",
            }));
          });
      }
    }
  };

  const handlePost = async () => {
    setIsPosting(true);
    setError("");

    if (!user || !user.token) {
      setError("User not authenticated");
      setIsPosting(false);
      return;
    }

    let userId;
    try {
      const decodedToken = jwtDecode(user.token);
      userId = decodedToken.id; // Assuming the user ID is stored in the 'id' field of the token
    } catch (err) {
      setError("Authentication error");
      setIsPosting(false);
      return;
    }

    const formattedSlides = slides.map((slide) => ({
      heading: slide.heading || "",
      description: slide.description || "",
      url: slide.image || "",
    }));

    const body = {
      slides: formattedSlides,
      user: userId,
      category: category,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/stories/story`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`, // Add the token to the headers
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to post story");
      }

      await response.json();
      onClose();
    } catch (err) {
      setError("Failed to post story. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <button onClick={onClose} className={styles.closeButton}>
            <XCircle size={28} color="red" />
          </button>
        </div>
        <div className={styles.slideContainer}>
          <div className={styles.slideNavigation}>
            {slides.map((_, index) => (
              <button
                key={index}
                className={`${styles.slideButton} ${
                  activeSlide === index + 1 ? styles.activeSlide : ""
                }`}
                onClick={() => setActiveSlide(index + 1)}
              >
                Slide {index + 1}
                {index > 2 && (
                  <span
                    className={styles.removeSlide}
                    onClick={() => handleRemoveSlide(index)}
                  >
                    <XCircle size={14} color="red" />
                  </span>
                )}
              </button>
            ))}
            {slides.length < 6 && (
              <button className={styles.slideButton} onClick={handleAddSlide}>
                Add +
              </button>
            )}
            <span className={styles.slidesLimitText}>Add up to 6 slides</span>
          </div>
          <div className={styles.slideContentContainer}>
            <div className={styles.slideContent}>
              <div className={styles.inputField}>
                <label className={styles.inputLabel}>Heading</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    placeholder="Your heading"
                    value={slides[activeSlide - 1]?.heading || ""}
                    onChange={(e) =>
                      handleInputChange("heading", e.target.value)
                    }
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.inputField}>
                <label className={styles.inputLabel}>Description</label>
                <div className={styles.inputWrapper}>
                  <textarea
                    type="text"
                    placeholder="story description"
                    value={slides[activeSlide - 1]?.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className={`${styles.input} ${styles.descriptionInput}`}
                  />
                </div>
              </div>

              <div className={styles.inputField}>
                <label className={styles.inputLabel}>Image/Video</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    placeholder="Add Image/video url"
                    value={slides[activeSlide - 1]?.image || ""}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    className={`${styles.input} ${
                      videoErrors[activeSlide - 1] && styles.errorInputUrl
                    }`}
                  />
                  {videoErrors[activeSlide - 1] && (
                    <p className={styles.errorMessage}>
                      {videoErrors[activeSlide - 1]}
                    </p>
                  )}
                </div>
              </div>
              <div className={styles.inputField}>
                <label className={styles.inputLabel}>Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Medical">Medical</option>
                  <option value="World">World</option>
                  <option value="India">India</option>
                  <option value="Sports">Sports</option>
                  <option value="Technology">Technology</option>
                </select>
                <span className={styles.categoryNote}>
                  This field will be common for all slides
                </span>
              </div>
            </div>
            <div className={styles.navigationButtons}>
              <div className={styles.navLeft}>
                <button
                  className={`${styles.navButton} ${styles.previousButton}`}
                  onClick={handlePrevious}
                  disabled={activeSlide === 1 || isPosting}
                >
                  Previous
                </button>
                <button
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={handleNext}
                  disabled={activeSlide === slides.length || isPosting}
                >
                  Next
                </button>
              </div>
              <div className={styles.navRight}>
                <button
                  className={styles.postButton}
                  onClick={handlePost}
                  disabled={isPosting || !user}
                >
                  {isPosting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
};

export default AddStoryModal;
