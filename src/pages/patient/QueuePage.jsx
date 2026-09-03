import { useEffect, useState } from "react";
import { queueService } from "../../api/queueService";
import { Icon, formatDate, formatTime } from "../../components/common/AppUi";
export default function QueuePage({ appointments, onToast }) {
  const appointment =
    appointments.find((item) => item.queuePosition) ||
    appointments.find((item) => item.status === "CONFIRMED");
  const [queue, setQueue] = useState(null);
  useEffect(() => {
    if (!appointment?.id) { setQueue(null); return undefined; }
    let active = true;
    const poll = async () => { try { const next = await queueService.getAppointmentStatus(appointment.id); if (active) setQueue(next); } catch (err) { if (active) onToast(err.message); } };
    poll(); const timer = window.setInterval(poll, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, [appointment?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const current = { ...appointment, ...(queue || {}) };
  if (!current)
    return (
      <div className="view-stack">
        <div className="page-heading">
          <div>
            <p className="eyebrow">REAL-TIME STATUS</p>
            <h1>Live queue</h1>
            <p className="muted">
              Your queue appears after an appointment is approved.
            </p>
          </div>
        </div>
        <section className="panel empty-state">
          <Icon name="calendar" size={28} />
          <h2>No active queue</h2>
          <p className="muted">An approved appointment will appear here.</p>
        </section>
      </div>
    );
  return (
    <div className="view-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">REAL-TIME STATUS</p>
          <h1>Live queue</h1>
          <p className="muted">Your place in line updates automatically.</p>
        </div>
        <span className="live-badge">
          <i /> LIVE
        </span>
      </div>
      <section className="queue-hero">
        <div className="queue-hero-copy">
          <span className="status-dot" /> {current.department || "DEPARTMENT"}
          <h2>
            You are in position{" "}
            <strong>#{current.queuePosition || "--"}</strong>
          </h2>
          <p>
            {current.doctor || "Assigned doctor"} -{" "}
            {formatDate(current.requestedDate)} at{" "}
            {formatTime(current.requestedTime)}
          </p>
          <div className="progress-track">
            <span
              style={{
                width: `${Math.max(15, 100 - ((current.queuePosition || 1) - 1) * 18)}%`,
              }}
            />
          </div>
          <small>
            {Math.max(0, (current.queuePosition || 1) - 1)} patients ahead of
            you
          </small>
        </div>
        <div className="queue-time">
          <small>ESTIMATED WAIT</small>
          <strong>
            {current.estimatedWaitTimeMinutes || "--"}
            <span> min</span>
          </strong>
          <button
            className="outline-button light"
            onClick={() => onToast("We will notify you when you are next")}
          >
            Notify me when next
          </button>
        </div>
      </section>
    </div>
  );
}
