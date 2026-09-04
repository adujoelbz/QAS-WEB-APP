import { useState } from "react";
import { clearSession, loadSession, saveSession } from "./api/client";
import AuthPage from "./pages/AuthPage";
import PatientPortal from "./pages/patient/PatientPortal";
import AdminPortal from "./pages/admin/AdminPortal";
import DoctorPortal from "./pages/doctor/DoctorPortal";
import "./App.css";

export default function App() {
  const [session, setSession] = useState(loadSession);
  const [authMode, setAuthMode] = useState("login");
  const signIn = (nextSession) => {
    saveSession(nextSession);
    setSession(nextSession);
  };
  const signOut = () => {
    clearSession();
    setSession(null);
  };
  if (!session)
    return (
      <AuthPage mode={authMode} setMode={setAuthMode} onSuccess={signIn} />
    );
  if (session.role === "ADMIN")
    return <AdminPortal session={session} onLogout={signOut} />;
  if (session.role === "DOCTOR")
    return <DoctorPortal session={session} onLogout={signOut} />;
  return <PatientPortal session={session} onLogout={signOut} />;
}
