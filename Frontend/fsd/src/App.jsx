import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Registration/Login";
import Register from "./components/Login/Registration/Register";
import Logout from "./components/Login/Registration/Logout";
import { AuthProvider } from "./context/AuthContext";
import MentorProfileForm from "./components/Mentor/MentorProfileForm";
import StudentProfileForm from "./components/Students/StudentProfileForm";
import LoginRegister from "./components/Login/Registration/LoginRegister";
import ProductGrid from "./components/Cart/ProductGrid";
import LandingPage from "./components/LandingPage/landingPage"; // Fix casing if needed
import AllMentors from "./components/Mentor/AllMentors";
import MentorProfile from "./components/Mentor/ViewProfile";
import AllStudents from "./components/Students/AllStudents";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/mentor-profile" element={<MentorProfileForm/>} />
                    <Route path="/student-profile" element={<StudentProfileForm/>} />
                    <Route path="/login" element={<LoginRegister />} />
                    <Route path="/products" element={<ProductGrid />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/mentors" element={<AllMentors />} />
                    <Route path="/mentor/:id" element={<MentorProfile />} />
                    <Route path="/students" element={<AllStudents />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
