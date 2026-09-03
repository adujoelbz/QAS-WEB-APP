import { useState } from "react";
import { doctorService } from "../../api/doctorService";
import { Icon, formatDate, formatTime } from "../../components/common/AppUi";

const iso = (date) => date.toISOString().slice(0, 10);
export default function DoctorSchedulePage({ initialSchedule, onError }) {
  const today = new Date();
  const next = new Date();
  next.setDate(next.getDate() + 7);
  const [from, setFrom] = useState(iso(today));
  const [to, setTo] = useState(iso(next));
  const [days, setDays] = useState(initialSchedule || []);
  const [loading, setLoading] = useState(false);
  const load = async (event) => {
    event?.preventDefault();
    setLoading(true);
    try {
      const payload = await doctorService.getSchedule(from, to);
      setDays(
        Array.isArray(payload)
          ? payload
          : payload?.content || payload?.items || [],
      );
      onError("");
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="view-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PRACTICE PLANNING</p>
          <h1>Schedule</h1>
          <p className="muted">
            See booked consultations and available slots across a date range.
          </p>
        </div>
      </div>
      <form className="panel schedule-controls" onSubmit={load}>
        <div className="filter-controls">
          <label className="field">
            <span>From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="field">
            <span>To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            <Icon name="calendar" size={16} />{" "}
            {loading ? "Loading..." : "Load schedule"}
          </button>
        </div>
      </form>
      <div className="schedule-list">
        {days.length ? (
          days.map((day, index) => (
            <section
              className="panel schedule-day"
              key={`${day.date || index}`}
            >
              <div className="schedule-day-head">
                <div>
                  <p className="eyebrow">DAY</p>
                  <h2>{formatDate(day.date)}</h2>
                </div>
                <span className="schedule-slot-count">
                  {(day.availableSlots || []).length} open slots
                </span>
              </div>
              <div className="schedule-columns">
                <div>
                  <h3>Appointments</h3>
                  {(day.appointments || []).length ? (
                    day.appointments.map((item) => (
                      <div className="schedule-item" key={item.id}>
                        <span className="schedule-time">
                          {formatTime(item.requestedTime)}
                        </span>
                        <div>
                          <b>Patient #{item.patientId || "-"}</b>
                          <small>
                            {item.reason || item.department || "Consultation"}
                          </small>
                        </div>
                        <span
                          className={`status status-${String(item.status || "").toLowerCase()}`}
                        >
                          {item.status || "Booked"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="muted">No appointments booked.</p>
                  )}
                </div>
                <div>
                  <h3>Available slots</h3>
                  <div className="slot-list">
                    {(day.availableSlots || []).length ? (
                      day.availableSlots.map((slot) => (
                        <span key={slot} className="slot-chip">
                          {formatTime(slot)}
                        </span>
                      ))
                    ) : (
                      <p className="muted">No open slots.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ))
        ) : (
          <section className="panel empty-state">
            <Icon name="calendar" size={28} />
            <h2>No schedule data</h2>
            <p className="muted">Choose a date range and load your schedule.</p>
          </section>
        )}
      </div>
    </div>
  );
}
