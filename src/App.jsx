import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Home from "./Pages/Home";
import Header from "./Components/Header";
import Error from "./Pages/Error";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import { UserProvider } from "./Context";
import 'react-toastify/dist/ReactToastify.css';
import UserHeader from "./Components/UserHeader";
import UserInfo from "./Pages/UserInfo";
import AboutInfo from "./Components/AboutInfo";
import UsernameInfo from "./Components/UsernameInfo";
import EducationInfo from "./Components/EducationInfo";
import ExperienceInfo from "./Components/ExperienceInfo";
import ProjectInfo from "./Components/ProjectInfo";
import CertificationInfo from "./Components/CertificationInfo";
import SkillInfo from "./Components/SkillInfo";
import ContactInfo from "./Components/ContactInfo";
import ThemeInfo from "./Components/ThemeInfo";
import SubmitInfo from "./Components/SubmitInfo";
import AnalyticsInfo from "./Components/AnalyticsInfo";
import SectionOrderInfo from "./Components/SectionOrderInfo";
import AdminDashboard from "./Pages/AdminDashboard";
import ForgotPassword from "./Pages/ForgotPassword";
import NoUser from "./Pages/NoUser";
import UserHome from "./Pages/UserHome";
import UserEducation from "./Pages/UserEducation";
import UserProjects from "./Pages/UserProjects";
import UserCertifications from "./Pages/UserCertifications";
import UserSkills from "./Pages/UserSkills";
import UserContacts from "./Pages/UserContacts";
import UserExperience from "./Pages/UserExperience";
import CustomSectionInfo from "./Components/CustomSectionInfo";
import UserCustomSection from "./Pages/UserCustomSection";

function App() {
  const router = createBrowserRouter([
    {
      index: '/', element: <Header />,
      children: [
        { index: true, element: <Home /> },
        { path: "/sign-in", element: <SignIn /> },
        { path: "/sign-up", element: <SignUp /> },
        { path: "/admin-dashboard", element: <AdminDashboard /> },
        { path: "/forgot-password", element: <ForgotPassword /> },
        {
          path: "/dashboard", element: <UserInfo />,
          children: [
            { path: "general",        element: <UsernameInfo /> },
            { path: "about",          element: <AboutInfo /> },
            { path: "education",      element: <EducationInfo /> },
            { path: "experience",     element: <ExperienceInfo /> },
            { path: "projects",       element: <ProjectInfo /> },
            { path: "certifications", element: <CertificationInfo /> },
            { path: "skills",         element: <SkillInfo /> },
            { path: "contacts",       element: <ContactInfo /> },
            { path: "themes",         element: <ThemeInfo /> },
            { path: "sections",       element: <SectionOrderInfo /> },
            { path: "analytics",      element: <AnalyticsInfo /> },
            { path: "submit",         element: <SubmitInfo /> },
            { path: "custom-sections",         element: <CustomSectionInfo /> },
            { path: "custom-sections/:sectionId", element: <CustomSectionInfo /> },
          ]
        },
      ],
    },
    {
      path: "/:username",
      element: <UserHeader />,
      children: [
        { index: true,          element: <UserHome /> },
        { path: "education",    element: <UserEducation /> },
        { path: "projects",     element: <UserProjects /> },
        { path: "experience",   element: <UserExperience /> },
        { path: "certifications", element: <UserCertifications /> },
        { path: "skills",       element: <UserSkills /> },
        { path: "contacts",     element: <UserContacts /> },
        { path: "custom/:sectionId", element: <UserCustomSection /> },
      ]
    },
    { path: "/no-user", element: <NoUser /> },
    { path: "*",        element: <Error /> }
  ]);

  return (
    <HelmetProvider>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </HelmetProvider>
  );
}

export default App;
