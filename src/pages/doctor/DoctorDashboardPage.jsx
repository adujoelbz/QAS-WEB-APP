import {
  Icon,
  formatDate,
  formatTime,
  labelStatus,
} from "../../components/common/AppUi";

const availableDayNames = (availableDays) =>
  Array.isArray(availableDays)
    ? availableDays
    : availableDays && typeof availableDays === "object"
      ? Object.keys(availableDays)
      : [];

export default function DoctorDashboardPage({
  profile,
  appointments,
  schedule,
  onNavigate,
}) {
  const dayNames = availableDayNames(profile.availableDays);
  const today = new Date().toISOString().slice(0, 10);
  const todays = appointments.filter((item) => item.requestedDate === today);
  const upcoming = appointments
    .filter(
      (item) =>
        !["COMPLETED", "CANCELLED", "NO_SHOW", "REJECTED"].includes(
          item.status,
        ),
    )
    .slice(0, 5);
  const nextSlot = schedule
    .flatMap((day) => day.availableSlots || [])
    .find(Boolean);
  return (
    <div className="view-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">DOCTOR WORKSPACE</p>
          <h1>Good morning, {profile.firstName || "Doctor"}</h1>
          <p className="muted">
            Keep today’s consultations focused and on schedule.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => onNavigate("appointments")}
        >
          <Icon name="calendar" size={16} /> View appointments
        </button>
      </div>
      <div className="admin-stat-grid doctor-stat-grid">
        <Stat
          label="Today’s appointments"
          value={todays.length}
          icon="calendar"
        />
        <Stat label="Upcoming" value={upcoming.length} icon="clock" />
        <Stat
          label="Consultation length"
          value={
            profile.consultationDurationMinutes
              ? `${profile.consultationDurationMinutes} min`
              : "-"
          }
          icon="activity"
        />
        <Stat label="Next open slot" value={nextSlot || "--"} icon="check" />
      </div>
      <div className="admin-grid doctor-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">TODAY</p>
              <h2>Upcoming consultations</h2>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("appointments")}
            >
              View all <Icon name="arrowRight" size={15} />
            </button>
          </div>
          {upcoming.length ? (
            upcoming.map((item) => (
              <div className="admin-row" key={item.id}>
                <div>
                  <b>
                    {item.reason || item.department || "Medical consultation"}
                  </b>
                  <small>
                    Patient #{item.patientId || "-"} ·{" "}
                    {formatDate(item.requestedDate)} at{" "}
                    {formatTime(item.requestedTime)}
                  </small>
                </div>
                <span
                  className={`status status-${String(item.status || "").toLowerCase()}`}
                >
                  {labelStatus(item.status)}
                </span>
              </div>
            ))
          ) : (
            <div className="empty-table">No upcoming consultations.</div>
          )}
        </section>
        <section className="panel doctor-profile-summary">
          <p className="eyebrow">PRACTICE</p>
          <h2>{profile.specialty || "General practice"}</h2>
          <p className="muted">
            {profile.hospitalName || "Hospital not assigned"}
          </p>
          <div className="doctor-summary-line">
            <Icon name="calendar" size={15} />
            <span>
              Available{" "}
              {dayNames.length
                ? dayNames.join(", ")
                : "days not configured"}
            </span>
          </div>
          <button
            className="outline-button"
            onClick={() => onNavigate("availability")}
          >
            Manage availability <Icon name="arrowRight" size={15} />
          </button>
        </section>
      </div>
    </div>
  );
}
function Stat({ label, value, icon }) {
  return (
    <div className="stat-card admin-stat">
      <span className="stat-icon">
        <Icon name={icon} />
      </span>
      <div>
        <span className="stat-label">{label}</span>
        <strong>{value}</strong>
        <small>Live from backend</small>
      </div>
    </div>
  );
}
