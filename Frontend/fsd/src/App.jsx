import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MentorProfileForm from "./components/Mentor/MentorProfileForm";
import StudentProfileForm from "./components/Students/StudentProfileForm";
import LoginRegister from "./components/Login/Registration/LoginRegister";
import LandingPage from "./components/LandingPage/LandingPage"; // Fix casing if needed
import AllMentors from "./components/Mentor/AllMentors";
import MentorProfile from "./components/Mentor/ViewMentorProfile";
import AllStudents from "./components/Students/AllStudents";
import StudentProfile from "./components/Students/ViewStudentProfile";
import HostProfileForm from "./components/Hosts/HostProfileForm";
import CreateCompetition from "./components/Competitions/CreateCompetition";
import CompetitionsList from "./components/Competitions/DisplayCompetitions";
import CompetitionDetail from "./components/Competitions/CompetitionDetail";
import StudentLandingPage from "./components/Students/StudentLandingPage";
import AdminLandingPage from "./components/Hosts/AdminLandingPage";
import TeamDetail from "./components/TeamDetail";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginRegister />} />
                    <Route path="/mentor-profile" element={<MentorProfileForm/>} />
                    <Route path="/student-profile" element={<StudentProfileForm/>} />
                    <Route path="/admin-profile" element={<HostProfileForm/>} />
                    <Route path="/mentors" element={<AllMentors />} />
                    <Route path="/mentor/:id" element={<MentorProfile />} />
                    <Route path="/students" element={<AllStudents />} />
                    <Route path="/students/:id" element={<StudentProfile />} />
                    <Route path="/competition-create" element={<CreateCompetition />} />
                    <Route path="/competitions" element={<CompetitionsList />} />
                    <Route path="/competitions/:id" element={<CompetitionDetail />} />
                    <Route path="/student-landing" element={<StudentLandingPage />} />
                    <Route path="/admin-landing" element={<AdminLandingPage />} />
                    <Route path="/team/:teamId" element={<TeamDetail />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
