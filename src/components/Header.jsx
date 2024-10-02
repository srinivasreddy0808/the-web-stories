import { useNavigate } from "react-router-dom";
import { Bookmark, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styles from "./Header.module.css";

const Header = ({ user, logout, setShowBookmarks, setYourStory }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/user`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user?.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch userdetails");
        }

        const data = await response.json();

        setUserName(data.data.user.userName);
      }
    };
    fetchUserDetails();
  }, [user]);
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const onLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <>
      <header className={styles.header}>
        {user ? (
          <>
            <div className={styles.desktopActive}>
              <button
                className={styles.bookmarksBtn}
                onClick={() => setShowBookmarks(true)}
              >
                <Bookmark style={{ fill: "#fff" }} />
                Bookmarks
              </button>
              <button
                className={styles.addStoryBtn}
                onClick={() => navigate("/add-story")}
              >
                Add story
              </button>
              <img
                src="/images/avatar.png"
                alt="User avatar"
                className={styles.avatar}
              />
              <button className={styles.menuBtn} onClick={toggleMenu}>
                <Menu />
              </button>
            </div>
            <button
              className={`${styles.mobileActive} ${styles.menuBtn}`}
              onClick={toggleMenu}
            >
              <Menu />
            </button>
            {showMenu && (
              <>
                <div className={styles.menuCard}>
                  <p className={styles.userName}>
                    {userName?.slice(0, 10) || "Your Name"}
                  </p>
                  <button onClick={onLogout} className={styles.logoutBtn}>
                    Logout
                  </button>
                </div>
                <div
                  className={`${styles.mobileActive} ${styles.mobileActiveCard}`}
                >
                  <div className={styles.avatarSection}>
                    <img
                      src="/images/avatar.png"
                      alt="User avatar"
                      className={styles.avatar}
                    />
                    <p className={styles.userName}>{userName || "Your Name"}</p>
                    <X onClick={toggleMenu} />
                  </div>
                  <button
                    className={styles.addStoryBtn}
                    onClick={() => setYourStory(true)}
                  >
                    Your story
                  </button>
                  <button
                    className={styles.addStoryBtn}
                    onClick={() => navigate("/add-story")}
                  >
                    Add story
                  </button>
                  <button
                    className={styles.bookmarksBtn}
                    onClick={() => setShowBookmarks(true)}
                  >
                    <Bookmark style={{ fill: "#fff" }} />
                    Bookmarks
                  </button>
                  <button onClick={onLogout} className={styles.addStoryBtn}>
                    Logout
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className={styles.desktopActive}>
              <button
                className={styles.registerBtn}
                onClick={() => navigate("/register")}
              >
                Register Now
              </button>
              <button
                className={styles.signInBtn}
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </div>
            <button
              className={`${styles.mobileActive} ${styles.menuBtn}`}
              onClick={toggleMenu}
            >
              <Menu />
            </button>
            {showMenu && (
              <div
                className={`${styles.mobileActive} ${styles.mobileActiveCard}`}
              >
                <div className={styles.crossIcon}>
                  <X onClick={toggleMenu} />
                </div>
                <button
                  className={styles.registerBtn}
                  onClick={() => navigate("/register")}
                >
                  Register Now
                </button>
                <button
                  className={styles.signInBtn}
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
              </div>
            )}
          </>
        )}
      </header>
    </>
  );
};
Header.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string,
    token: PropTypes.string.isRequired,
  }),
  logout: PropTypes.func.isRequired,
  setShowBookmarks: PropTypes.func.isRequired,
  setYourStory: PropTypes.func.isRequired,
};
export default Header;
