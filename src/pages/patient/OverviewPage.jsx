import { Icon, formatDate, formatTime } from "../../components/common/AppUi";
export default function OverviewPage({
  profile,
  appointments,
  onBook,
  onNavigate,
}) {
  const next =
    appointments.find((item) =>
      ["APPROVED", "CONFIRMED"].includes(item.status),
    ) || appointments[0];
  return (
    <div className="view-stack">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">PATIENT PORTAL</p>
          <h1>Good morning, {profile.firstName || "there"}</h1>
          <p className="muted">Here is a clear view of your care today.</p>
        </div>
        <button className="primary-button" onClick={onBook}>
          <Icon name="plus" size={17} /> Book an appointment
        </button>
      </div>
      {next ? (
        <section className="next-appointment">
          <div className="next-label">
            <span className="status-dot" /> NEXT APPOINTMENT
          </div>
          <div className="next-body">
            <div>
              <h2>{next.department || "Medical consultation"}</h2>
              <p className="muted">
                {next.doctorName || next.doctor || (next.doctorId ? `Doctor #${next.doctorId}` : "Doctor assignment pending")}
              </p>
              <div className="appointment-meta">
                <span>
                  <Icon name="calendar" /> {formatDate(next.requestedDate)}
                </span>
                <span>
                  <Icon name="clock" /> {formatTime(next.requestedTime)}
                </span>
              </div>
            </div>
            <div className="queue-pill">
              <small>YOUR QUEUE POSITION</small>
              <strong>
                {next.queuePosition ? `#${next.queuePosition}` : "--"}
              </strong>
              <span>
                {next.queuePosition
                  ? `${Math.max(0, next.queuePosition - 1)} patients ahead`
                  : "Awaiting approval"}
              </span>
            </div>
          </div>
          <div className="next-footer">
            <span>
              <b>Estimated wait</b>{" "}
              <strong>
                {next.estimatedWaitTimeMinutes != null
                  ? `${next.estimatedWaitTimeMinutes} min`
                  : "Pending"}
              </strong>
            </span>
            {next.queuePosition && (
              <button
                className="text-button"
                onClick={() => onNavigate("queue")}
              >
                View live queue <Icon name="arrowRight" size={15} />
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="panel empty-state">
          <Icon name="calendar" size={28} />
          <h2>No appointments yet</h2>
          <p className="muted">
            Request your first appointment to see your care plan here.
          </p>
          <button className="primary-button" onClick={onBook}>
            Book an appointment
          </button>
        </section>
      )}
    </div>
  );
}
