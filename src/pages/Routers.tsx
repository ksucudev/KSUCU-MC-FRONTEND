import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App.tsx";

// Lazy-loaded components
const LandingPage = lazy(() => import("./LandingPageNew"));
const FinancialsPage = lazy(() => import("./Financials"));
const MinistriesPage = lazy(() => import("./Ministries"));
const Etpage = lazy(() => import("./Et"));
const RivetPage = lazy(() => import("./ets/Rivet"));
const NetPage = lazy(() => import("./ets/Net"));
const EsetPage = lazy(() => import("./ets/Eset"));
const WesoPage = lazy(() => import("./ets/Weso"));
const CetPage = lazy(() => import("./ets/Cet"));
const NoPage = lazy(() => import("./NoPage"));
const SignIn = lazy(() => import("../components/signin"));
const Bs = lazy(() => import("../components/bibleStudy"));
const SavedSouls = lazy(() => import("./savedSouls"));
const ClassesSection = lazy(() => import("./classes"));
const BoardsPage = lazy(() => import("../components/Boards"));
const IctBoardPage = lazy(() => import("./IctBoard"));
const MediaBoardPage = lazy(() => import("./MediaBoard"));
const CommunicationBoardPage = lazy(() => import("./CommunicationBoard"));
const EditorialBoardPage = lazy(() => import("./EditorialBoard"));
const SoftwareDevelopmentBoardPage = lazy(() => import("./SoftwareDevelopmentBoard"));
const BoardApplicationsAdminPage = lazy(() => import("./BoardApplicationsAdmin"));
const ChangeDetails = lazy(() => import("../components/changeDetails"));
const NewsPage = lazy(() => import("./NewsPage"));
const PhotoUploadPage = lazy(() => import("./newsadminText"));
const PasswordReset = lazy(() => import("../components/newPaaswwordInput"));
const SavedSoulsList = lazy(() => import("./adminMission"));
const BsMembersList = lazy(() => import("./adminBs"));
const Library = lazy(() => import("./library"));
const Media = lazy(() => import("./media"));
const MediaAdmin = lazy(() => import("./MediaAdmin"));
const Elders = lazy(() => import("./eldersPage"));
const FeedbackForm = lazy(() => import("../components/feedBackForm"));
const SuperAdmin = lazy(() => import("./superAdmin"));
const PraiseandWorshipCommitment = lazy(() => import("../commitmentForms/praiseandWorship"));
const ChoirCommitment = lazy(() => import("../commitmentForms/Choir"));
const InstrumentalistsCommitment = lazy(() => import("../commitmentForms/instrumentalists"));
const AdmissionAdmin = lazy(() => import("./admissionAdmin"));
const UserProfilePage = lazy(() => import("./userProfile"));
const UserManagement = lazy(() => import("./userManagement"));
const WorshipDocketAdmin = lazy(() => import("./WorshipDocketAdmin"));
const UsheringPage = lazy(() => import("./ministries/ushering"));
const CreativityPage = lazy(() => import("./ministries/creativity"));
const CompassionPage = lazy(() => import("./ministries/compassion"));
const IntercessoryPage = lazy(() => import("./ministries/intercessory"));
const HighSchoolPage = lazy(() => import("./ministries/highSchool"));
const WananzambePage = lazy(() => import("./ministries/wananzambe"));
const ChurchSchoolPage = lazy(() => import("./ministries/churchSchool"));
const PraiseAndWorshipPage = lazy(() => import("./ministries/praiseAndWorship"));
const ChoirPage = lazy(() => import("./ministries/choir"));
const ContactUs = lazy(() => import("./ContactUs"));
const MessagesAdmin = lazy(() => import("./MessagesAdmin"));
const AttendanceSessionManagement = lazy(() => import("./AttendanceSessionManagement"));
const NewsAdmin = lazy(() => import("./NewsAdmin"));
const Requisitions = lazy(() => import("./Requisitions"));
const RequisitionsAdmin = lazy(() => import("./RequisitionsAdmin"));
const CompassionCounselingPage = lazy(() => import("./CompassionCounseling"));
const CompassionCounselingAdmin = lazy(() => import("./CompassionCounselingAdmin"));
const PollingOfficerDashboard = lazy(() => import("./PollingOfficerDashboard"));
const PollingOfficerManagement = lazy(() => import("./PollingOfficerManagement"));
const MyDocs = lazy(() => import("./MyDocs"));
const SuperAdminDocumentDashboard = lazy(() => import("./superAdminDocumentDashboard"));
const ChristianMinds = lazy(() => import("./christianMinds"));
const SistersFellowship = lazy(() => import("./sistersFellowship"));
const BrothersFellowship = lazy(() => import("./brothersFellowship"));
const DiscipleshipClass = lazy(() => import("./discipleshipClass"));
const BestpClass = lazy(() => import("./bestpClass"));
const ClassFellowship = lazy(() => import("./classFellowship"));
const ChatAdmin = lazy(() => import("./ChatAdmin"));
const Kairos = lazy(() => import("./Kairos"));
const Focus = lazy(() => import("./Focus"));
const Leadership = lazy(() => import("../components/Leadership"));
const OtherCommittees = lazy(() => import("../components/OtherCommittees"));
const CommitteeAdmin = lazy(() => import("../components/admin"));
const DirectSignPage = lazy(() => import("./DirectSignPage"));
const WelcomePage = lazy(() => import("./WelcomePage"));
const PatronDashboard = lazy(() => import("./PatronDashboard"));
const ChairpersonDashboard = lazy(() => import("./ChairpersonDashboard"));



export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { path: "", element: <LandingPage /> },
            { path: "/Home", element: <LandingPage /> },
            { path: "/financial", element: <FinancialsPage /> },
            { path: "/ministries", element: <MinistriesPage /> },
            { path: "/ets", element: <Etpage /> },
            { path: "/ets/rivet", element: <RivetPage /> },
            { path: "/ets/net", element: <NetPage /> },
            { path: "/ets/eset", element: <EsetPage /> },
            { path: "/ets/weso", element: <WesoPage /> },
            { path: "/ets/cet", element: <CetPage /> },
            { path: "/signIn", element: <SignIn /> },
            { path: "/Bs", element: <Bs /> },
            { path: "/save", element: <SavedSouls /> },
            { path: "/fellowshipsandclasses", element: <ClassesSection /> },
            { path: "/boards", element: <BoardsPage /> },
            { path: "/boards/ict", element: <IctBoardPage /> },
            { path: "/boards/media", element: <MediaBoardPage /> },
            { path: "/boards/communication", element: <CommunicationBoardPage /> },
            { path: "/boards/editorial", element: <EditorialBoardPage /> },
            { path: "/boards/software", element: <SoftwareDevelopmentBoardPage /> },
            { path: "/admin/board-applications", element: <BoardApplicationsAdminPage /> },
            { path: "/changeDetails", element: <ChangeDetails /> },
            { path: "/news", element: <NewsPage /> },
            { path: "/adminnews", element: <PhotoUploadPage /> },
            { path: "/reset", element: <PasswordReset /> },
            { path: "/adminmission", element: <SavedSoulsList /> },
            { path: "/adminBs", element: <BsMembersList /> },
            { path: "/library", element: <Library /> },
            { path: "/media", element: <Media /> },
            { path: "/elders", element: <Elders /> },
            { path: "/recomendations", element: <FeedbackForm /> },
            { path: "/admin", element: <SuperAdmin /> },
            { path: "/p&w", element: <PraiseandWorshipCommitment /> },
            { path: "/choir", element: <ChoirCommitment /> },
            { path: "/wananzambe", element: <InstrumentalistsCommitment /> },
            { path: "/admission", element: <AdmissionAdmin /> },
            { path: "/user-management", element: <UserManagement /> },
            { path: "/profile", element: <UserProfilePage /> },
            { path: "/worship-docket-admin", element: <WorshipDocketAdmin /> },
            { path: "/media-admin", element: <MediaAdmin /> },
            { path: "/ministries/ushering", element: <UsheringPage /> },
            { path: "/ministries/creativity", element: <CreativityPage /> },
            { path: "/ministries/compassion", element: <CompassionPage /> },
            { path: "/ministries/intercessory", element: <IntercessoryPage /> },
            { path: "/ministries/highSchool", element: <HighSchoolPage /> },
            { path: "/ministries/wananzambe", element: <WananzambePage /> },
            { path: "/ministries/churchSchool", element: <ChurchSchoolPage /> },
            { path: "/ministries/praiseAndWorship", element: <PraiseAndWorshipPage /> },
            { path: "/ministries/choir", element: <ChoirPage /> },
            { path: "/contact-us", element: <ContactUs /> },
            { path: "/messages-admin", element: <MessagesAdmin /> },
            { path: "/attendance-session-management", element: <AttendanceSessionManagement /> },
            { path: "/news-admin", element: <NewsAdmin /> },
            { path: "/requisitions", element: <Requisitions /> },
            { path: "/requisitions-admin", element: <RequisitionsAdmin /> },
            { path: "/compassion-counseling", element: <CompassionCounselingPage /> },
            { path: "/compassion-counseling-admin", element: <CompassionCounselingAdmin /> },
            { path: "/polling-officer-dashboard", element: <PollingOfficerDashboard /> },
            { path: "/polling-officer-management", element: <PollingOfficerManagement /> },
            { path: "/my-docs", element: <MyDocs /> },
            { path: "/admin/documents", element: <SuperAdminDocumentDashboard /> },
            /*newly added Christian Minds*/
            { path: "/christianminds", element: <ChristianMinds /> },
            { path: "/kairos", element: <Kairos /> },
            { path: "/focus", element: <Focus /> },
            { path: "/leadership", element: <Leadership /> },
            { path: "/other-committees", element: <OtherCommittees /> },
            { path: "/committee-admin", element: <CommitteeAdmin /> },
            { path: "/welcome", element: <WelcomePage /> },
            { path: "/patron", element: <PatronDashboard /> },

            /* Fellowships and Classes */
            { path: "/brothersfellowship", element: <BrothersFellowship /> },
            { path: "/sistersfellowship", element: <SistersFellowship /> },
            { path: "/bestpClass", element: <BestpClass /> },
            { path: "/discipleship", element: <DiscipleshipClass /> },
            { path: "/classFellowship", element: <ClassFellowship /> },
            { path: "/chat-admin", element: <ChatAdmin /> },
            { path: "/sign-attendance/:shortId", element: <DirectSignPage /> },
            { path: "/chairperson", element: <ChairpersonDashboard /> },
            { path: "*", element: <NoPage /> }
        ]
    }
]);
