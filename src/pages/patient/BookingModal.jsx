import { useState } from "react";
import { appointmentService } from "../../api/appointmentService";
import { Icon } from "../../components/common/AppUi";
export default function BookingModal({ departments, close, onBooked }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    departmentId: departments[0]?.id || "",
    requestedDate: "",
    requestedTime: "",
    reason: "",
    emergencyFlag: false,
  });
  const [slots, setSlots] = useState([]);
  const recommend = async () => {
    if (!form.departmentId || !form.requestedDate) return;
    try {
      const response = await appointmentService.recommend({
          departmentId: form.departmentId,
          preferredDate: form.requestedDate,
          ...(form.requestedTime ? { preferredTime: form.requestedTime } : {}),
        });
      setSlots(Array.isArray(response) ? response : response?.slots || response?.value || []);
    } catch {
      setSlots([]);
    }
    setStep(2);
  };
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">NEW APPOINTMENT</p>
            <h2>Find a time that works</h2>
          </div>
          <button className="icon-button" onClick={close} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="steps">
          <span className="done">1</span>
          <i />
          <span className={step > 1 ? "done" : ""}>2</span>
          <i />
          <span className={step > 2 ? "done" : ""}>3</span>
        </div>
        {step === 1 && (
          <div className="modal-body">
            <p className="muted">Choose a department and preferred date.</p>
            <label className="select-field">
              <span>Department</span>
              <select
                value={form.departmentId}
                onChange={(e) =>
                  setForm({ ...form, departmentId: e.target.value })
                }
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option value={department.id} key={department.id}>
                    {department.name}
                  </option>
                ))}
                {!departments.length && (
                  <option value="10">Cardiology Unit</option>
                )}
              </select>
            </label>
            <div className="field-row">
              <label className="select-field">
                <span>Preferred date</span>
                <input
                  type="date"
                  value={form.requestedDate}
                  onChange={(e) =>
                    setForm({ ...form, requestedDate: e.target.value })
                  }
                  required
                />
              </label>
              <label className="select-field">
                <span>Preferred time</span>
                <input
                  type="time"
                  value={form.requestedTime}
                  onChange={(e) =>
                    setForm({ ...form, requestedTime: e.target.value })
                  }
                />
              </label>
            </div>
            <label className="select-field">
              <span>
                Reason <em>Optional</em>
              </span>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Tell us briefly what you need help with"
              />
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="modal-body">
            <p className="muted">
              Select a recommended slot or continue with your preferred time.
            </p>
            <div className="slot-grid">
              {slots.length ? (
                slots.map((slot) => (
                  <button
                    className="slot"
                    key={`${slot.date}-${slot.time}`}
                    onClick={() =>
                      setForm({
                        ...form,
                        requestedDate: slot.date,
                        requestedTime: slot.time,
                      })
                    }
                  >
                    {slot.date}
                    <strong>{slot.time}</strong>
                    <small>
                      {slot.estimatedWaitMinutes} min estimated wait
                    </small>
                  </button>
                ))
              ) : (
                <div className="empty-table">
                  No recommendations returned. You can continue with your
                  selected time.
                </div>
              )}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="modal-body confirmation">
            <span className="confirm-icon">
              <Icon name="check" />
            </span>
            <h3>Ready to request?</h3>
            <p className="muted">
              Your request will be reviewed by the hospital team.
            </p>
          </div>
        )}
        <div className="modal-foot">
          <button
            className="outline-button"
            onClick={step === 1 ? close : () => setStep(step - 1)}
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <button
            className="primary-button"
            disabled={step === 1 && (!form.departmentId || !form.requestedDate)}
            onClick={
              step === 1
                ? recommend
                : step === 2
                  ? () => setStep(3)
                  : () =>
                      onBooked({
                        ...form,
                        departmentId: Number(form.departmentId),
                        emergencyFlag: Boolean(form.emergencyFlag),
                      })
            }
          >
            {step === 3 ? "Request appointment" : "Continue"}{" "}
            <Icon name="arrowRight" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
