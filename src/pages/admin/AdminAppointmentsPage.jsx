import { useState } from "react";
import {
  Icon,
  formatDate,
  formatTime,
  labelStatus,
} from "../../components/common/AppUi";
export default function AdminAppointmentsPage({
  appointments,
  onApprove,
  onReject,
}) {
  const [status, setStatus] = useState("");
  const filtered = status
    ? appointments.filter((item) => item.status === status)
    : appointments;
  return (
    <div className="view-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">OPERATIONS</p>
          <h1>Appointment oversight</h1>
          <p className="muted">
            Review requests and keep the hospital queue moving.
          </p>
        </div>
        <button
          className="outline-button"
          onClick={() => window.location.reload()}
        >
          <Icon name="activity" /> Refresh
        </button>
      </div>
      <div className="filter-bar">
        <div className="segmented">
          {["", "PENDING", "APPROVED", "CONFIRMED", "COMPLETED"].map((item) => (
            <button
              key={item || "ALL"}
              className={status === item ? "selected" : ""}
              onClick={() => setStatus(item)}
            >
              {item || "All"}
            </button>
          ))}
        </div>
      </div>
      <section className="panel table-panel">
        <div className="table-head admin-table-head">
          <span>APPOINTMENT</span>
          <span>PATIENT</span>
          <span>DATE</span>
          <span>STATUS</span>
          <span>ACTION</span>
        </div>
        {filtered.length ? (
          filtered.map((item) => (
            <div className="table-row admin-table-row" key={item.id}>
              <div>
                <b>
                  #{item.id} {item.department || "Department"}
                </b>
                <small>Doctor: {item.doctor || "Unassigned"}</small>
              </div>
              <div>
                <b>Patient #{item.patientId || "-"}</b>
                <small>{item.reason || "No reason provided"}</small>
              </div>
              <div>
                <b>{formatDate(item.requestedDate)}</b>
                <small>{formatTime(item.requestedTime)}</small>
              </div>
              <span
                className={`status status-${String(item.status).toLowerCase()}`}
              >
                {labelStatus(item.status)}
              </span>
              <div className="admin-actions">
                {item.status === "PENDING" && (
                  <>
                    <button
                      className="tiny-button approve"
                      onClick={() => onApprove(item)}
                    >
                      Approve
                    </button>
                    <button
                      className="tiny-button reject"
                      onClick={() => onReject(item)}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-table">No appointments found.</div>
        )}
      </section>
    </div>
  );
}
