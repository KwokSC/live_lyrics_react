import "./App.scss";
import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage.jsx";
import LoginPage from "./pages/LoginPage.jsx"
import StartPage from "./pages/StartPage.jsx";
import RoomPage from "./pages/RoomPage.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import FollowingPage from "./pages/FollowingPage.jsx";
import ProgramPage from "./pages/ProgramPage.jsx";
import AddProgramPage from "./pages/AddProgramPage.jsx"
import EditProgramPage from "./pages/EditProgramPage.jsx";
import ConsolePage from "./pages/ConsolePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {

  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/following" element={<FollowingPage />} />
      <Route path="/room/:roomId" element={<RoomPage />} />
      <Route path="/console" element={<ConsolePage/> }/>
      <Route path="/start" element={<StartPage/>}/>
      <Route path="/program" element={<ProgramPage />} />
      <Route path="/program/add" element={<AddProgramPage/>} />
      <Route path="/program/edit/:programId" element={<EditProgramPage/>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
