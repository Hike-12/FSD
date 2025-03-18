import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Registration/Login";
import Register from "./components/Login/Registration/Register";
import Logout from "./components/Login/Registration/Logout";
import { AuthProvider } from "./context/AuthContext";
import MentorProfileForm from "./components/Profiles/MentorProfileForm";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/mentor-profile" element={<MentorProfileForm/>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
