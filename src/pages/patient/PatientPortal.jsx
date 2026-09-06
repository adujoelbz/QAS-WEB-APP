import { useEffect, useState } from "react";
import { appointmentService } from "../../api/appointmentService";
import { patientService } from "../../api/patientService";
import PatientSidebar from "../../components/layout/PatientSidebar";
import PortalHeader from "../../components/layout/PortalHeader";
import OverviewPage from "./OverviewPage";
import AppointmentsPage from "./AppointmentsPage";
import QueuePage from "./QueuePage";
import ProfilePage from "./ProfilePage";
import BookingModal from "./BookingModal";
import HospitalsPage from "./HospitalsPage";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import { Icon } from "../../components/common/AppUi";

const titles = {
  overview: "Overview",
  appointments: "Appointments",
  queue: "Live queue",
  hospitals: "Find hospitals",
  profile: "My profile",
};

export default function PatientPortal({ session, onLogout }) {
  const [view, setView] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  useEffect(() => {
    setBusy(true);
    Promise.all([patientService.getProfile(), appointmentService.listMine()])
      .then(([patient, page]) => {
        setProfile(patient);
        setAppointments(page?.content || []);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  }, []);

  const patient = profile || {
    firstName: "Patient",
    lastName: "",
    email: session.email,
  };

  const book = async (payload) => {
    try {
      const created = await appointmentService.create(payload);
      setAppointments((items) => [created, ...items]);
      setBookingOpen(false);
      setView("appointments");
      notify("Appointment request submitted");
    } catch (err) {
      notify(err.message);
    }
  };

  return (
    <div className="app-shell">
      <PatientSidebar
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
        />
        <main className="content">
          {busy && <div className="loading-bar">Loading your care hub...</div>}
          {error && (
            <div className="api-alert">
              {error}. Check that the backend is running.
            </div>
          )}
          {view === "overview" && (
            <OverviewPage
              profile={patient}
              appointments={appointments}
              onBook={() => setBookingOpen(true)}
              onNavigate={setView}
            />
          )}
          {view === "appointments" && (
            <AppointmentsPage
              appointments={appointments}
              onBook={() => setBookingOpen(true)}
              onToast={notify}
              onOpen={setSelectedAppointment}
            />
          )}
          {view === "queue" && (
            <QueuePage appointments={appointments} onToast={notify} />
          )}
          {view === "hospitals" && <HospitalsPage onToast={notify} />}
          {view === "profile" && (
            <ProfilePage
              profile={patient}
              onSaved={setProfile}
              onToast={notify}
            />
          )}
        </main>
      </div>

      {bookingOpen && (
        <BookingModal
          open={bookingOpen}
          close={() => setBookingOpen(false)}
          onBooked={book}
        />
      )}

      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          close={() => setSelectedAppointment(null)}
          onToast={notify}
          onUpdated={(updated) => {
            setAppointments((items) =>
              items.map((item) => (item.id === updated.id ? updated : item)),
            );
            setSelectedAppointment(updated);
          }}
        />
      )}

      {toast && (
        <div className="toast">
          <span className="toast-check">
            <Icon name="check" size={13} />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}
