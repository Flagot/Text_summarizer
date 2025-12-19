import { Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Home from "./pages/home.jsx";
import SideBar from "./components/sidebar.jsx";

function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <div className="flex-1 h-full ">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
