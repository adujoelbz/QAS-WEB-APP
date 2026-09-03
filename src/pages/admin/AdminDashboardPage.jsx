import { Icon, formatDate, labelStatus } from "../../components/common/AppUi";
export default function AdminDashboardPage({
  stats,
  appointments,
  onNavigate,
}) {
  const value = (key) => stats?.[key] ?? 0;
  return (
    <div className="view-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SYSTEM OVERVIEW</p>
          <h1>Good morning, Admin</h1>
          <p className="muted">
            Monitor patient flow, appointments, and model performance.
          </p>
        </div>
        <button
          className="outline-button"
          onClick={() => onNavigate("appointments")}
        >
          <Icon name="calendar" /> Review appointments
        </button>
      </div>
      <div className="admin-stat-grid">
        <AdminStat
          label="Patients"
          value={value("totalPatients")}
          icon="user"
        />
        <AdminStat
          label="Doctors"
          value={value("totalDoctors")}
          icon="activity"
        />
        <AdminStat
          label="Appointments today"
          value={value("totalAppointmentsToday")}
          icon="calendar"
        />
        <AdminStat
          label="Average wait"
          value={
            stats?.averageWaitTimeMinutes != null
              ? `${stats.averageWaitTimeMinutes} min`
              : "-"
          }
          icon="clock"
        />
      </div>
      <div className="admin-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">RECENT FLOW</p>
              <h2>Latest appointments</h2>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("appointments")}
            >
              View all <Icon name="arrowRight" size={15} />
            </button>
          </div>
          {appointments.slice(0, 5).map((item) => (
            <div className="admin-row" key={item.id}>
              <div>
                <b>{item.department || "Department"}</b>
                <small>
                  Patient #{item.patientId || "-"} -{" "}
                  {formatDate(item.requestedDate)}
                </small>
              </div>
              <span
                className={`status status-${String(item.status).toLowerCase()}`}
              >
                {labelStatus(item.status)}
              </span>
            </div>
          ))}
        </section>
        <section className="panel admin-health">
          <p className="eyebrow">PERFORMANCE</p>
          <h2>Platform health</h2>
          <div className="health-line">
            <span className="status-dot" />
            <div>
              <b>Queue operations</b>
              <small>Running normally</small>
            </div>
          </div>
          <div className="health-line">
            <span className="status-dot" />
            <div>
              <b>AI predictions</b>
              <small>Available for decision support</small>
            </div>
          </div>
          <button className="outline-button" onClick={() => onNavigate("ai")}>
            Open AI workspace <Icon name="arrowRight" size={15} />
          </button>
        </section>
      </div>
    </div>
  );
}
function AdminStat({ label, value, icon }) {
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
