import { useMemo, useState } from "react";
import {
  Icon,
  formatDate,
  formatTime,
  labelStatus,
} from "../../components/common/AppUi";
export default function AppointmentsPage({ appointments, onBook, onOpen }) {
  const [filter, setFilter] = useState("All");
  const filtered = useMemo(
    () =>
      filter === "All"
        ? appointments
        : appointments.filter((item) =>
            filter === "Upcoming"
              ? !["COMPLETED", "CANCELLED", "NO_SHOW", "REJECTED"].includes(
                  item.status,
                )
              : item.status === "COMPLETED",
          ),
    [appointments, filter],
  );
  return (
    <div className="view-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PATIENT RECORD</p>
          <h1>Appointments</h1>
          <p className="muted">
            Keep track of upcoming visits and your care history.
          </p>
        </div>
        <button className="primary-button" onClick={onBook}>
          <Icon name="plus" size={17} /> Book an appointment
        </button>
      </div>
      <div className="filter-bar">
        <div className="segmented">
          {["All", "Upcoming", "Completed"].map((item) => (
            <button
              key={item}
              className={filter === item ? "selected" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <section className="panel table-panel">
        <div className="table-head">
          <span>APPOINTMENT</span>
          <span>DATE & TIME</span>
          <span>STATUS</span>
          <span>QUEUE</span>
          <span />
        </div>
        {filtered.length ? (
          filtered.map((item) => (
            <div className="table-row" key={item.id}>
              <div className="table-appointment">
                <span className="mini-date green">
                  <Icon name="calendar" size={15} />
                </span>
                <div>
                  <b>{item.department || "Department"}</b>
                    <small>{item.doctorName || item.doctor || (item.doctorId ? `Doctor #${item.doctorId}` : "Doctor pending")}</small>
                </div>
              </div>
              <div>
                <b>{formatDate(item.requestedDate)}</b>
                <small>{formatTime(item.requestedTime)}</small>
              </div>
              <span
                className={`status status-${String(item.status || "").toLowerCase()}`}
              >
                {labelStatus(item.status)}
              </span>
              <div>
                {item.queuePosition ? (
                  <>
                    <b className="queue-number">#{item.queuePosition}</b>
                    <small>
                      {item.estimatedWaitTimeMinutes ?? "--"} min est.
                    </small>
                  </>
                ) : (
                  <span className="muted">-</span>
                )}
              </div>
              <button className="icon-button" aria-label="Open appointment" onClick={() => onOpen(item)}>
                <Icon name="arrowRight" size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="empty-table">No appointments match this filter.</div>
        )}
      </section>
    </div>
  );
}
