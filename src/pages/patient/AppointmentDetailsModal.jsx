import { useState } from "react";
import { appointmentService } from "../../api/appointmentService";
import {
  Icon,
  formatDate,
  formatTime,
  labelStatus,
} from "../../components/common/AppUi";
import QuestionsPanel from "./QuestionsPanel";

export default function AppointmentDetailsModal({
  appointment,
  close,
  onUpdated,
  onToast,
}) {
  const [date, setDate] = useState(appointment.requestedDate || "");
  const [time, setTime] = useState(appointment.requestedTime || "");
  const [busy, setBusy] = useState(false);
  const [joined, setJoined] = useState(false);
  const canChange = !["COMPLETED", "CANCELLED", "NO_SHOW", "REJECTED"].includes(
    appointment.status,
  );
  const canConfirm = appointment.status === "APPROVED";
  const reschedule = async () => {
    if (!date || !time) return;
    setBusy(true);
    try {
      onUpdated(
        await appointmentService.reschedule(appointment.id, {
          newDate: date,
          newTime: time,
        }),
      );
      onToast("Appointment rescheduled");
    } catch (error) {
      onToast(error.message);
    } finally {
      setBusy(false);
    }
  };
  const confirm = async () => {
    setBusy(true);
    try {
      onUpdated(
        (await appointmentService.confirm(appointment.id)) || {
          ...appointment,
          status: "CONFIRMED",
        },
      );
      onToast("Appointment confirmed");
    } catch (error) {
      onToast(error.message);
    } finally {
      setBusy(false);
    }
  };
  const cancel = async () => {
    if (!window.confirm("Cancel this appointment?")) return;
    setBusy(true);
    try {
      await appointmentService.cancel(appointment.id);
      onUpdated({ ...appointment, status: "CANCELLED" });
      onToast("Appointment cancelled");
    } catch (error) {
      onToast(error.message);
    } finally {
      setBusy(false);
    }
  };
  const standby = async () => {
    setBusy(true);
    try {
      await appointmentService.joinStandby(appointment.id);
      setJoined(true);
      onToast("Joined standby queue");
    } catch (error) {
      onToast(error.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="modal-backdrop">
      <div className="modal appointment-modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">APPOINTMENT #{appointment.id}</p>
            <h2>{appointment.department || "Consultation"}</h2>
            <p className="muted">
              {formatDate(appointment.requestedDate)} at{" "}
              {formatTime(appointment.requestedTime)} ·{" "}
              {labelStatus(appointment.status)}
            </p>
          </div>
          <button className="icon-button" onClick={close} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="modal-body">
          <div className="appointment-detail-grid">
            <div>
              <span>Doctor</span>
              <b>{appointment.doctorName || appointment.doctor || (appointment.doctorId ? `Doctor #${appointment.doctorId}` : "Assignment pending")}</b>
            </div>
            <div>
              <span>Reason</span>
              <b>{appointment.reason || "Not provided"}</b>
            </div>
          </div>
          {canConfirm && (
            <div className="confirm-box">
              <div>
                <b>Your appointment is approved</b>
                <small>
                  Confirm to reserve your slot with the assigned care team.
                </small>
              </div>
              <button
                className="primary-button"
                onClick={confirm}
                disabled={busy}
              >
                Confirm appointment
              </button>
            </div>
          )}
          {canChange && (
            <>
              <div className="reschedule-box">
                <p className="eyebrow">RESCHEDULE</p>
                <div className="field-row">
                  <label className="field">
                    <span>New date</span>
                    <input
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>New time</span>
                    <input
                      type="time"
                      value={time}
                      onChange={(event) => setTime(event.target.value)}
                    />
                  </label>
                </div>
                <button
                  className="outline-button"
                  onClick={reschedule}
                  disabled={busy}
                >
                  Save new time
                </button>
              </div>
              <div className="standby-box">
                <div>
                  <b>Need an earlier opening?</b>
                  <small>
                    Join the standby queue and we will keep your request in
                    line.
                  </small>
                </div>
                <button
                  className="outline-button"
                  onClick={standby}
                  disabled={busy || joined}
                >
                  {joined ? "Joined standby" : "Join standby"}
                </button>
              </div>
            </>
          )}
          <QuestionsPanel appointmentId={appointment.id} onToast={onToast} />
        </div>
        <div className="modal-foot">
          {canChange && (
            <button
              className="tiny-button reject"
              onClick={cancel}
              disabled={busy}
            >
              Cancel appointment
            </button>
          )}
          <button className="outline-button" onClick={close}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
