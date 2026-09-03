import { useEffect, useState } from "react";
import { adminService } from "../../api/adminService";
import { aiService } from "../../api/aiService";
import { Icon } from "../../components/common/AppUi";

const initialNoShow = {
  patientId: "",
  doctorId: "",
  appointmentDate: "",
  appointmentTime: "",
  previousNoShows: 0,
  reminderSent: false,
};
const initialWait = {
  departmentId: "",
  date: "",
  time: "",
  queuePosition: 1,
  patientsAhead: 0,
  averageConsultationDuration: 30,
  currentQueueLength: 1,
  previousAppointmentDurations: "",
};

export default function AdminAiPage({ onToast }) {
  const [health, setHealth] = useState(null);
  const [healthBusy, setHealthBusy] = useState(true);
  const [noShow, setNoShow] = useState(initialNoShow);
  const [wait, setWait] = useState(initialWait);
  const [noShowResult, setNoShowResult] = useState(null);
  const [waitResult, setWaitResult] = useState(null);
  const [busy, setBusy] = useState("");
  const [exportForm, setExportForm] = useState({ from: "", to: "" });
  const update = (setter) => (key) => (event) =>
    setter((current) => ({
      ...current,
      [key]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));
  const checkHealth = async () => {
    setHealthBusy(true);
    try {
      setHealth(await aiService.health());
    } catch (error) {
      setHealth({ status: "offline", error: error.message });
    } finally {
      setHealthBusy(false);
    }
  };
  useEffect(() => {
    checkHealth();
  }, []);
  const predictNoShow = async (event) => {
    event.preventDefault();
    setBusy("no-show");
    try {
      setNoShowResult(
        await aiService.predictNoShow({
          ...noShow,
          patientId: numberOrNull(noShow.patientId),
          doctorId: numberOrNull(noShow.doctorId),
          previousNoShows: Number(noShow.previousNoShows),
          appointmentDate: noShow.appointmentDate || null,
          appointmentTime: noShow.appointmentTime || null,
        }),
      );
    } catch (error) {
      onToast(error.message);
    } finally {
      setBusy("");
    }
  };
  const predictWait = async (event) => {
    event.preventDefault();
    setBusy("wait");
    try {
      setWaitResult(
        await aiService.predictWaitTime({
          ...wait,
          departmentId: numberOrNull(wait.departmentId),
          queuePosition: Number(wait.queuePosition),
          patientsAhead: Number(wait.patientsAhead),
          averageConsultationDuration: Number(wait.averageConsultationDuration),
          currentQueueLength: Number(wait.currentQueueLength),
          previousAppointmentDurations: wait.previousAppointmentDurations
            .split(",")
            .map((value) => Number(value.trim()))
            .filter((value) => Number.isFinite(value)),
        }),
      );
    } catch (error) {
      onToast(error.message);
    } finally {
      setBusy("");
    }
  };
  const exportData = async (event) => {
    event.preventDefault();
    if (!exportForm.from || !exportForm.to) return;
    setBusy("export");
    try {
      const csv = await adminService.exportTrainingData(
        exportForm.from,
        exportForm.to,
      );
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `training-data-${exportForm.from}-${exportForm.to}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      onToast("Training data downloaded");
    } catch (error) {
      onToast(error.message);
    } finally {
      setBusy("");
    }
  };
  return (
    <div className="view-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">DECISION SUPPORT</p>
          <h1>AI workspace</h1>
          <p className="muted">
            Run predictions, monitor service availability, and prepare training
            data.
          </p>
        </div>
        <button
          className="outline-button"
          onClick={checkHealth}
          disabled={healthBusy}
        >
          <Icon name="activity" />{" "}
          {healthBusy ? "Checking..." : "Check AI health"}
        </button>
      </div>
      <section
        className={`ai-health-card ${health?.status === "healthy" ? "healthy" : "unhealthy"}`}
      >
        <span className="ai-health-icon">
          <Icon name={health?.status === "healthy" ? "check" : "activity"} />
        </span>
        <div>
          <p className="eyebrow">AI SERVICE</p>
          <h2>
            {healthBusy
              ? "Checking availability..."
              : health?.status === "healthy"
                ? "AI service is online"
                : "AI service is unavailable"}
          </h2>
          <small>
            {health?.service ||
              health?.error ||
              "Flask prediction service at the configured AI URL"}
          </small>
        </div>
        <span className="ai-health-status">{health?.status || "checking"}</span>
      </section>
      <div className="ai-grid">
        <section className="panel ai-card">
          <div className="ai-card-heading">
            <span className="ai-card-icon">
              <Icon name="user" />
            </span>
            <div>
              <p className="eyebrow">RISK MODEL</p>
              <h2>No-show prediction</h2>
            </div>
          </div>
          <p className="muted">
            Estimate the likelihood that a patient misses an appointment.
          </p>
          <form onSubmit={predictNoShow}>
            <div className="form-grid">
              <AiField
                label="Patient ID"
                type="number"
                value={noShow.patientId}
                onChange={update(setNoShow)("patientId")}
                placeholder="1001"
              />
              <AiField
                label="Doctor ID"
                type="number"
                value={noShow.doctorId}
                onChange={update(setNoShow)("doctorId")}
                placeholder="24"
              />
              <AiField
                label="Appointment date"
                type="date"
                value={noShow.appointmentDate}
                onChange={update(setNoShow)("appointmentDate")}
              />
              <AiField
                label="Appointment time"
                type="time"
                value={noShow.appointmentTime}
                onChange={update(setNoShow)("appointmentTime")}
              />
              <AiField
                label="Previous no-shows"
                type="number"
                min="0"
                value={noShow.previousNoShows}
                onChange={update(setNoShow)("previousNoShows")}
              />
              <label className="ai-check">
                <input
                  type="checkbox"
                  checked={noShow.reminderSent}
                  onChange={update(setNoShow)("reminderSent")}
                />{" "}
                Reminder sent
              </label>
            </div>
            <button
              className="primary-button"
              type="submit"
              disabled={busy === "no-show"}
            >
              {busy === "no-show" ? "Predicting..." : "Run prediction"}{" "}
              <Icon name="arrowRight" size={15} />
            </button>
          </form>
          {noShowResult && (
            <PredictionResult
              label="No-show risk"
              value={`${Math.round(noShowResult.probability * 100)}%`}
              detail={`${noShowResult.riskLevel} risk - ${noShowResult.recommendation}`}
              tone={noShowResult.riskLevel?.toLowerCase()}
            />
          )}
        </section>
        <section className="panel ai-card">
          <div className="ai-card-heading">
            <span className="ai-card-icon mint">
              <Icon name="clock" />
            </span>
            <div>
              <p className="eyebrow">QUEUE MODEL</p>
              <h2>Wait-time prediction</h2>
            </div>
          </div>
          <p className="muted">
            Refine the expected wait using queue and consultation history.
          </p>
          <form onSubmit={predictWait}>
            <div className="form-grid">
              <AiField
                label="Department ID"
                type="number"
                value={wait.departmentId}
                onChange={update(setWait)("departmentId")}
                placeholder="10"
              />
              <AiField
                label="Date"
                type="date"
                value={wait.date}
                onChange={update(setWait)("date")}
              />
              <AiField
                label="Time"
                type="time"
                value={wait.time}
                onChange={update(setWait)("time")}
              />
              <AiField
                label="Queue position"
                type="number"
                min="1"
                value={wait.queuePosition}
                onChange={update(setWait)("queuePosition")}
              />
              <AiField
                label="Patients ahead"
                type="number"
                min="0"
                value={wait.patientsAhead}
                onChange={update(setWait)("patientsAhead")}
              />
              <AiField
                label="Avg consultation (min)"
                type="number"
                min="5"
                value={wait.averageConsultationDuration}
                onChange={update(setWait)("averageConsultationDuration")}
              />
              <AiField
                label="Current queue length"
                type="number"
                min="0"
                value={wait.currentQueueLength}
                onChange={update(setWait)("currentQueueLength")}
              />
              <AiField
                label="Previous durations"
                value={wait.previousAppointmentDurations}
                onChange={update(setWait)("previousAppointmentDurations")}
                placeholder="30, 25, 35"
              />
            </div>
            <button
              className="primary-button"
              type="submit"
              disabled={busy === "wait"}
            >
              {busy === "wait" ? "Predicting..." : "Run prediction"}{" "}
              <Icon name="arrowRight" size={15} />
            </button>
          </form>
          {waitResult && (
            <PredictionResult
              label="Predicted wait"
              value={`${waitResult.predictedWaitMinutes} min`}
              detail={`${waitResult.confidence}% model confidence`}
              tone="mint"
            />
          )}
        </section>
      </div>
      <section className="panel export-card">
        <div>
          <p className="eyebrow">MODEL OPERATIONS</p>
          <h2>Export training data</h2>
          <p className="muted">
            Download completed, no-show, and cancelled appointment records as
            CSV.
          </p>
        </div>
        <form className="export-form" onSubmit={exportData}>
          <AiField
            label="From"
            type="date"
            value={exportForm.from}
            onChange={update(setExportForm)("from")}
          />
          <AiField
            label="To"
            type="date"
            value={exportForm.to}
            onChange={update(setExportForm)("to")}
          />
          <button
            className="outline-button"
            type="submit"
            disabled={busy === "export" || !exportForm.from || !exportForm.to}
          >
            <Icon name="download" />{" "}
            {busy === "export" ? "Preparing..." : "Download CSV"}
          </button>
        </form>
      </section>
    </div>
  );
}
function AiField({ label, type = "text", value, onChange, placeholder, min }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        min={min}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  );
}
function PredictionResult({ label, value, detail, tone }) {
  return (
    <div className={`prediction-result ${tone || ""}`}>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
      <span>{detail}</span>
    </div>
  );
}
function numberOrNull(value) {
  return value === "" ? null : Number(value);
}
