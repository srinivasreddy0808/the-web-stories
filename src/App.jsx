import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { NewsProvider } from "./context/NewsProvider";
import { UserProvider } from "./context/userContextProvider";
import LoginModal from "./modals/LoginModal";
import RegisterModal from "./modals/RegisterModal";
import StoryModal from "./modals/StoryModal";
import AddStoryModal from "./modals/AddStoryModal";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [homeKey, setHomeKey] = useState(0);
  return (
    <NewsProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage key={homeKey} />}>
              <Route path="login" element={<LoginModal />} />
              <Route path="register" element={<RegisterModal />} />
              <Route
                path="story/:id/:slideIndex?"
                element={<StoryModal setHomeKey={setHomeKey} />}
              />
              <Route path="add-story" element={<AddStoryModal />} />
            </Route>
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </UserProvider>
    </NewsProvider>
  );
}

export default App;
