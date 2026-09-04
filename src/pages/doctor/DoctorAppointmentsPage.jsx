import { useEffect, useRef, useState } from "react";
import {
  Icon,
  formatDate,
  formatTime,
  labelStatus,
} from "../../components/common/AppUi";
import QuestionsPanel from "../patient/QuestionsPanel";
import { doctorService } from "../../api/doctorService";

export default function DoctorAppointmentsPage({
  appointments,
  onRefresh,
  onStart,
  onStatus,
  onToast,
}) {
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [questionsFor, setQuestionsFor] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);
  const questionsRef = useRef(null);
  useEffect(() => {
    if (questionsFor) {
      questionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [questionsFor]);
  const filtered = appointments.filter(
    (item) =>
      (!status || item.status === status) &&
      (!date || item.requestedDate === date),
  );
  const apply = () =>
    onRefresh({ ...(status ? { status } : {}), ...(date ? { date } : {}) });
  const downloadHistory = async (appointment, file) => {
    try {
      const result = await doctorService.getMedicalHistoryDownload(appointment.id, file.publicId);
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.download = result.originalFilename || file.originalFileName || "medical-history-file";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      onToast(err.message);
    }
  };
  return (
    <div className="view-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CARE DELIVERY</p>
          <h1>Appointments</h1>
          <p className="muted">
            Review your queue and update each consultation as it progresses.
          </p>
        </div>
        <button className="outline-button" onClick={apply}>
          <Icon name="activity" /> Refresh
        </button>
      </div>
      <section className="panel doctor-filter">
        <div className="filter-controls">
          <label className="select-field">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {[
                "PENDING",
                "APPROVED",
                "CONFIRMED",
                "IN_PROGRESS",
                "COMPLETED",
                "NO_SHOW",
                "CANCELLED",
              ].map((value) => (
                <option key={value} value={value}>
                  {labelStatus(value)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <button
            className="text-button clear-filter"
            onClick={() => {
              setStatus("");
              setDate("");
              onRefresh();
            }}
          >
            Clear filters
          </button>
        </div>
      </section>
      <section className="panel table-panel">
        <div className="table-head doctor-table-head">
          <span>APPOINTMENT</span>
          <span>PATIENT</span>
          <span>DATE & TIME</span>
          <span>STATUS</span>
          <span>ACTION</span>
        </div>
        {filtered.length ? (
          filtered.map((item) => (
            <AppointmentRow
              key={item.id}
              item={item}
              onStart={onStart}
              onStatus={onStatus}
              onQuestions={setQuestionsFor}
              onHistory={setHistoryFor}
            />
          ))
        ) : (
          <div className="empty-table">
            No appointments match these filters.
          </div>
        )}
      </section>
      {questionsFor && (
        <section className="panel" ref={questionsRef}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">APPOINTMENT #{questionsFor}</p>
              <h2>Questions & answers</h2>
            </div>
            <button type="button" className="icon-button" onClick={() => setQuestionsFor(null)} aria-label="Close questions">
              <Icon name="close" size={15} />
            </button>
          </div>
          <QuestionsPanel appointmentId={questionsFor} doctorMode onToast={onToast} />
        </section>
      )}
      {historyFor && (
        <section className="panel history-file-list" ref={questionsRef}>
          <div className="panel-heading">
            <div><p className="eyebrow">PATIENT #{historyFor.patientId || "-"}</p><h2>Medical history</h2></div>
            <button type="button" className="icon-button" onClick={() => setHistoryFor(null)} aria-label="Close medical history"><Icon name="close" size={15} /></button>
          </div>
          {(historyFor.medicalHistory?.files || []).map((file) => (
            <div className="history-file" key={file.publicId}>
              <span><b>{file.originalFileName || "Medical history file"}</b><small>{formatFileSize(file.fileSize)}</small></span>
              <button type="button" className="icon-button" onClick={() => downloadHistory(historyFor, file)} aria-label="Download medical history file"><Icon name="download" size={14} /></button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
function AppointmentRow({ item, onStart, onStatus, onQuestions, onHistory }) {
  const actionable = [
    "APPROVED",
    "CONFIRMED",
    "SCHEDULED",
    "IN_PROGRESS",
  ].includes(item.status);
  return (
    <div className="table-row doctor-table-row">
      <div>
        <b>
          #{item.id} {item.department || "Consultation"}
        </b>
        <small>{item.reason || "No reason provided"}</small>
      </div>
      <div>
        <b>Patient #{item.patientId || "-"}</b>
        <small>
          {item.emergencyFlag ? "Emergency request" : "Standard request"}
        </small>
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
      <div className="admin-actions">
        <button type="button" className="tiny-button" onClick={() => onQuestions(item.id)}>Q&A</button>
        {item.medicalHistory?.files?.length > 0 && <button type="button" className="tiny-button" onClick={() => onHistory(item)}>History</button>}
        {actionable &&
          !item.consultationStartedAt &&
          ["APPROVED", "CONFIRMED", "SCHEDULED"].includes(item.status) && (
            <button
              className="tiny-button approve"
              onClick={() => onStart(item.id)}
            >
              Start
            </button>
          )}
        {actionable && (
          <>
            <button
              className="tiny-button approve"
              onClick={() =>
                onStatus(item.id, "COMPLETED", item.actualWaitTimeMinutes)
              }
            >
              Complete
            </button>
            <button
              className="tiny-button reject"
              onClick={() =>
                onStatus(item.id, "NO_SHOW", item.actualWaitTimeMinutes)
              }
            >
              No show
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function formatFileSize(size) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
