import { useCallback, useEffect, useMemo, useState } from "react";
import { doctorService } from "../../api/doctorService";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import PortalHeader from "../../components/layout/PortalHeader";
import DoctorDashboardPage from "./DoctorDashboardPage";
import DoctorAppointmentsPage from "./DoctorAppointmentsPage";
import DoctorSchedulePage from "./DoctorSchedulePage";
import DoctorProfilePage from "./DoctorProfilePage";
import { Icon } from "../../components/common/AppUi";

const titles = {
  dashboard: "Overview",
  appointments: "Appointments",
  schedule: "Schedule",
  availability: "Availability",
  profile: "Profile",
};
const listItems = (payload) =>
  Array.isArray(payload)
    ? payload
    : payload?.content || payload?.items || (payload?.date ? [payload] : []);
const iso = (date) => date.toISOString().slice(0, 10);

export default function DoctorPortal({ session, onLogout }) {
  const [view, setView] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };
  const range = useMemo(() => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 7);
    return { from: iso(from), to: iso(to) };
  }, []);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [doctorResult, appointmentsResult, scheduleResult] =
        await Promise.allSettled([
        doctorService.getProfile(),
        doctorService.getAppointments(),
        doctorService.getSchedule(range.from, range.to),
      ]);

      const failures = [];
      if (doctorResult.status === "fulfilled") {
        setProfile(doctorResult.value);
      } else {
        failures.push(`Profile: ${doctorResult.reason?.message || "request failed"}`);
      }
      if (appointmentsResult.status === "fulfilled") {
        setAppointments(listItems(appointmentsResult.value));
      } else {
        failures.push(
          `Appointments: ${appointmentsResult.reason?.message || "request failed"}`,
        );
      }
      if (scheduleResult.status === "fulfilled") {
        setSchedule(listItems(scheduleResult.value));
      } else {
        failures.push(`Schedule: ${scheduleResult.reason?.message || "request failed"}`);
      }
      setError(failures.join(" | "));
    } finally {
      setBusy(false);
    }
  }, [range.from, range.to]);
  useEffect(() => {
    load();
  }, [load]);

  const refreshAppointments = async (params = {}) => {
    try {
      setAppointments(listItems(await doctorService.getAppointments(params)));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };
  const startConsultation = async (id) => {
    try {
      const updated = await doctorService.startConsultation(id);
      setAppointments((items) =>
        items.map((item) =>
          item.id === id ? updated || { ...item, status: "IN_PROGRESS" } : item,
        ),
      );
      notify("Consultation started");
    } catch (err) {
      notify(err.message);
    }
  };
  const updateStatus = async (id, status, actualWaitTime) => {
    try {
      const updated = await doctorService.updateAppointmentStatus(
        id,
        status,
        actualWaitTime,
      );
      setAppointments((items) =>
        items.map((item) =>
          item.id === id ? updated || { ...item, status } : item,
        ),
      );
      notify(`Appointment marked ${status.toLowerCase().replace("_", " ")}`);
    } catch (err) {
      notify(err.message);
    }
  };
  const patient = profile || {
    firstName: "Doctor",
    lastName: "",
    email: session.email,
  };
  let content = (
    <DoctorDashboardPage
      profile={patient}
      appointments={appointments}
      schedule={schedule}
      onNavigate={setView}
    />
  );
  if (view === "appointments")
    content = (
      <DoctorAppointmentsPage
        appointments={appointments}
        onRefresh={refreshAppointments}
        onStart={startConsultation}
        onStatus={updateStatus}
        onToast={notify}
      />
    );
  if (view === "schedule")
    content = (
      <DoctorSchedulePage initialSchedule={schedule} onError={setError} />
    );
  if (view === "availability" || view === "profile")
    content = (
      <DoctorProfilePage
        profile={patient}
        mode={view}
        onSaved={setProfile}
        onToast={notify}
      />
    );
  return (
    <div className="app-shell doctor-shell">
      <DoctorSidebar
        activeView={view}
        setActiveView={setView}
        mobileNav={mobileNav}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        closeMobile={() => setMobileNav(false)}
        onLogout={onLogout}
      />
      <div className="main-column">
        <PortalHeader
          role={session.role}
          title={titles[view]}
          profile={patient}
          onMenu={() => setMobileNav(true)}
          onNotify={() => notify("You have no new notifications")}
        />
        <main className="content">
          {busy && (
            <div className="loading-bar">Loading doctor workspace...</div>
          )}
          {error && (
            <div className="api-alert">
              {error}. Check that the backend is running.
            </div>
          )}
          {content}
        </main>
      </div>
      {toast && (
        <div className="toast">
          <span className="toast-check"><Icon name="check" size={13} /></span>
          {toast}
        </div>
      )}
    </div>
  );
}
