import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MentorProfileForm from "./components/Mentor/MentorProfileForm";
import StudentProfileForm from "./components/Students/StudentProfileForm";
import LoginRegister from "./components/Login/Registration/LoginRegister";
import LandingPage from "./components/LandingPage/LandingPage"; // Fix casing if needed
import AllMentors from "./components/Mentor/AllMentors";
import MentorProfile from "./components/Mentor/ViewMentorProfile";
import RecommendedStudents from "./components/Students/RecommendedStudents";
import StudentProfile from "./components/Students/ViewStudentProfile";
import HostProfileForm from "./components/Hosts/HostProfileForm";
import CreateCompetition from "./components/Competitions/CreateCompetition";
import CompetitionsList from "./components/Competitions/DisplayCompetitions";
import CompetitionDetail from "./components/Competitions/CompetitionDetail";
import StudentLandingPage from "./components/Students/StudentLandingPage";
import AdminLandingPage from "./components/Hosts/AdminLandingPage";
import TeamDetail from "./components/Competitions/TeamDetail";
import StudentCompetitions from "./components/Students/StudentCompetitions";
import StudentTeams from "./components/Students/StudentTeams";
import HostCompetitions from "./components/Hosts/HostCompetitions";
import MentorNavbar from "./components/Mentor/MentorNavbar";
import StudentNavbar from "./components/Students/StudentNavbar";
import HostNavbar from "./components/Hosts/HostNavbar";
import MentorSidebar from "./components/Mentor/MentorSidebar";
import StudentSidebar from "./components/Students/StudentSidebar";
import HostSidebar from "./components/Hosts/HostSidebar";
import Layout from "./components/Students/StudentNavbar";
import Chat from "./components/Workspace/Chat";
import HostCompetitionDetails from "./components/Hosts/HostCompetitionDetail";
import Workspace from "./components/Workspace/Workspace";
import LandingPageAliqyaan from "./components/LandingPage/LandingPageAliqyaan";
import HowItWorks from "./components/LandingPage/Working";
import Notifications from "./components/Notifications";
import Collaborators from "./components/Students/StudentCollaborator";

function App() {
    const userRole = localStorage.getItem("role"); 

    const getNavbar = () => {
        if (userRole === "STUDENT") return <StudentNavbar />;
        if (userRole === "MENTOR") return <StudentNavbar />;
        if (userRole === "HOST") return <StudentNavbar />;
        return null;
      };
    
      const getSidebar = () => {
        if (userRole === "STUDENT") return <StudentNavbar />;
        if (userRole === "MENTOR") return <StudentNavbar />;
        if (userRole === "HOST") return <StudentNavbar />;
        return null;
      };

    return (
        <>
        <BrowserRouter>
            <AuthProvider>
                <Layout navbar={getNavbar()} sidebar={getSidebar()}>
                    <Routes>

                        {/* LANDING PAGE */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/landing" element={<LandingPageAliqyaan />} />
                        <Route path="/how-it-works" element={<HowItWorks/>}/>

                        {/* LOGIN/REGISTER */}
                        <Route path="/login" element={<LoginRegister />} />

                        {/* STUDENTS */}
                        <Route path="/student-landing" element={<StudentLandingPage />} />
                        <Route path="/student-profile" element={<StudentProfileForm/>} />
                        <Route path="/students" element={<RecommendedStudents />} />
                        <Route path="/students/:id" element={<StudentProfile />} />
                        <Route path="/student-teams" element={<StudentTeams />} />
                        <Route path="/student-competitions" element={<StudentCompetitions />} />
                        <Route path="/student-collaborators" element={<Collaborators />} />

                        {/* MENTORS */}
                        <Route path="/mentor-profile" element={<MentorProfileForm/>} />
                        <Route path="/mentors" element={<AllMentors />} />
                        <Route path="/mentor/:id" element={<MentorProfile />} />

                        {/* ADMIN */}
                        <Route path="/admin-landing" element={<AdminLandingPage />} />
                        <Route path="/admin-profile" element={<HostProfileForm/>} />
                        <Route path="/admin-competitions" element={<HostCompetitions />} />
                        <Route path="/admin-competitions/:competitionId" element={<HostCompetitionDetails />} />

                        {/* COMPETITION/TEAM */}
                        <Route path="/competition-create" element={<CreateCompetition />} />
                        <Route path="/competitions" element={<CompetitionsList />} />
                        <Route path="/competitions/:id" element={<CompetitionDetail />} />
                        <Route path="/team/:teamId" element={<TeamDetail />} />
                        <Route path="/chat/:teamId" element = {<Chat />} />
                        <Route path="/workspace/:teamId" element = {<Workspace />} />
                        
                        {/* NOTIFICATION */}
                        <Route path="/notifications" element={<Notifications />} />

                        {/* CHATROOMS */}
                        <Route path="/chat/:teamId" element={<Chat />} />
                    </Routes>
                </Layout>
            </AuthProvider>
        </BrowserRouter>
        </>
    );
}

export default App;
