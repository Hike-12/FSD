import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import StudentNavbar from "./components/Students/StudentNavbar";
import StudentSidebar from "./components/Students/StudentSidebar";
import Layout from "./components/Students/StudentNavbar";
import Chat from "./components/Workspace/Chat";
import HostCompetitionDetails from "./components/Hosts/HostCompetitionDetail";
import Workspace from "./components/Workspace/Workspace";
import LandingPageAliqyaan from "./components/LandingPage/LandingPageAliqyaan";
import HowItWorks from "./components/LandingPage/Working";
import StudentNotifications from "./components/Students/Notifications";
import Collaborators from "./components/Students/StudentCollaborator";
import MentorConsultations from "./components/Mentor/MentorConsultations";
import MentorNotifications from "./components/Mentor/Notifications";
import React from 'react';
import VoiceControl from './components/VoiceControl/VoiceControl';
import AnalyticsPage from "./components/Analytics";
import GuestNavbar from "./components/GuestNavbar/GuestNavbar";
import MentorNavbar from "./components/Mentor/MentorNavbar";
import HostNavbar from "./components/Hosts/HostNavbar";
import MentorLandingPage from "./components/Mentor/MentorLandingPage";

function App() {
    const userRole = localStorage.getItem("role"); 
    const isLoggedIn = !!localStorage.getItem("authToken");

    const getNavbar = () => {
        console.log("User Role:", userRole);
        console.log("Is Logged In:", isLoggedIn);
        if (!isLoggedIn) {
            console.log("Rendering Guest Navbar");
            return (
                <div className="flex justify-end p-4">
                    <button 
                        onClick={() => window.location.href = '/login'} 
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Sign Up
                    </button>
                </div>
            );
        }
        if (userRole === "STUDENT") return <StudentNavbar />;
        if (userRole === "MENTOR") return <MentorNavbar />;
        if (userRole === "HOST") return <HostNavbar />;
        return null;
    };

    return (
        <>
        <BrowserRouter>
            <AuthProvider>
                <Layout navbar={getNavbar()} >
                    <Routes>
                        <Route path="/mentor-navbar" element={<MentorNavbar />} />
                        <Route path="/host-navbar" element={<HostNavbar />}/>
                        {/* LANDING PAGE */}
                        <Route path="/" element={<LandingPageAliqyaan />} />
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
                        <Route path="/student-notifications" element={<StudentNotifications />} />

                        {/* MENTORS */}
                        <Route path="/mentor-landing" element={<MentorLandingPage />} />
                        <Route path="/mentor-profile" element={<MentorProfileForm/>} />
                        <Route path="/mentors" element={<AllMentors />} />
                        <Route path="/mentor/:id" element={<MentorProfile />} />
                        <Route path="/mentor-consultations" element={<MentorConsultations />} />
                        <Route path="/mentor-notifications" element={<MentorNotifications />} />

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
                        
                        {/* Analytics */}
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        {/* CHATROOMS */}
                        <Route path="/chat/:teamId" element={<Chat />} />
                        <Route
                            path="*"
                            element={
                                isLoggedIn && !userRole ? (
                                    <Navigate to="/analytics" />
                                ) : (
                                    <Navigate to="/" />
                                )
                            }
                        />
                    </Routes>
                </Layout>
            </AuthProvider>
        </BrowserRouter>
        </>
    );
}

export default App;
