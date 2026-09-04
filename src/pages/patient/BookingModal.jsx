import { useEffect, useState } from "react";
import { appointmentService } from "../../api/appointmentService";
import { departmentService } from "../../api/departmentService";
import { hospitalService } from "../../api/hospitalService";
import { Icon } from "../../components/common/AppUi";

const listItems = (payload) =>
  Array.isArray(payload) ? payload : payload?.content || payload?.items || [];

export default function BookingModal({ open, close, onBooked }) {
  const [step, setStep] = useState(1);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({
    hospitalId: "",
    departmentId: "",
    requestedDate: "",
    requestedTime: "",
    reason: "",
    emergencyFlag: false,
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  // Load the current hospital list whenever the booking flow opens.
  useEffect(() => {
    if (!open) return undefined;

    let active = true;
    setStep(1);
    setSlots([]);
    setSelectedSlotIndex(null);
    setHospitals([]);
    setDepartments([]);
    setLoadError("");
    setForm({
      hospitalId: "",
      departmentId: "",
      requestedDate: "",
      requestedTime: "",
      reason: "",
      emergencyFlag: false,
    });
    setLoadingHospitals(true);

    hospitalService
      .search({ size: 100 })
      .then((payload) => {
        if (!active) return;
        const items = listItems(payload).filter((hospital) => hospital?.id != null);
        setHospitals(items);
        // Avoid an unnecessary extra choice when the account can only see one hospital.
        if (items.length === 1) {
          setForm((current) => ({ ...current, hospitalId: String(items[0].id) }));
        }
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error.message || "Unable to load hospitals");
      })
      .finally(() => {
        if (active) setLoadingHospitals(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  // Departments are scoped to the selected hospital. This keeps newly created
  // admin departments discoverable even when their specialty is new.
  useEffect(() => {
    if (!open || !form.hospitalId) {
      setDepartments([]);
      return undefined;
    }

    let active = true;
    setLoadingDepartments(true);
    setLoadError("");
    setDepartments([]);
    departmentService
      .listPublic({ hospitalId: form.hospitalId })
      .then((payload) => {
        if (!active) return;
        const unique = new Map();
        listItems(payload).forEach((department) => {
          if (department?.id != null) unique.set(department.id, department);
        });
        setDepartments([...unique.values()]);
      })
      .catch((error) => {
        if (!active) return;
        setDepartments([]);
        setLoadError(error.message || "Unable to load departments");
      })
      .finally(() => {
        if (active) setLoadingDepartments(false);
      });

    return () => {
      active = false;
    };
  }, [open, form.hospitalId]);

  const update = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "hospitalId" ? { departmentId: "" } : {}),
    }));
  };

  const recommend = async () => {
    if (!form.departmentId || !form.requestedDate) return;
    try {
      const response = await appointmentService.recommend({
        departmentId: form.departmentId,
        preferredDate: form.requestedDate,
        ...(form.requestedTime ? { preferredTime: form.requestedTime } : {}),
      });
      setSlots(
        Array.isArray(response)
          ? response
          : response?.slots || response?.value || [],
      );
    } catch {
      setSlots([]);
    }
    setStep(2);
  };

  const handleBook = () => {
    const appointmentForm = { ...form };
    delete appointmentForm.hospitalId;
    onBooked({
      ...appointmentForm,
      departmentId: Number(form.departmentId),
      emergencyFlag: Boolean(form.emergencyFlag),
    });
  };

  // If modal is closed, render nothing
  if (!open) return null;

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

        {loadError && <div className="api-alert">{loadError}</div>}

        {loadingHospitals ? (
          <div className="modal-body">
            <p className="muted">Loading hospitals...</p>
          </div>
        ) : step === 1 ? (
          <div className="modal-body">
            <p className="muted">Choose a hospital, department and preferred date.</p>
            <label className="select-field">
              <span>Hospital</span>
              <select value={form.hospitalId} onChange={update("hospitalId")}>
                <option value="">Select hospital</option>
                {hospitals.map((hospital) => (
                  <option value={hospital.id} key={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
                {!hospitals.length && (
                  <option value="" disabled>
                    No hospitals available
                  </option>
                )}
              </select>
            </label>
            <label className="select-field">
              <span>Department</span>
              <select
                value={form.departmentId}
                onChange={update("departmentId")}
                disabled={!form.hospitalId || loadingDepartments}
              >
                <option value="">
                  {loadingDepartments ? "Loading departments..." : "Select department"}
                </option>
                {departments.map((department) => (
                  <option value={department.id} key={department.id}>
                    {department.name} ({department.specialty})
                  </option>
                ))}
                {form.hospitalId && !loadingDepartments && !departments.length && (
                  <option value="" disabled>
                    No departments available
                  </option>
                )}
              </select>
            </label>
            <div className="field-row">
              <label className="select-field">
                <span>Preferred date</span>
                <input
                  type="date"
                  value={form.requestedDate}
                  onChange={update("requestedDate")}
                  min={new Date().toISOString().slice(0, 10)}
                  required
                />
              </label>
              <label className="select-field">
                <span>Preferred time</span>
                <input
                  type="time"
                  value={form.requestedTime}
                  onChange={update("requestedTime")}
                />
              </label>
            </div>
            <label className="select-field">
              <span>
                Reason <em>Optional</em>
              </span>
              <textarea
                value={form.reason}
                onChange={update("reason")}
                placeholder="Tell us briefly what you need help with"
              />
            </label>
          </div>
        ) : step === 2 ? (
          <div className="modal-body">
            <p className="muted">
              Select a recommended slot or continue with your preferred time.
            </p>
            <div className="slot-grid">
              {slots.length ? (
                slots.map((slot, index) => (
                  <button
                    type="button"
                    className={`slot ${selectedSlotIndex === index ? "selected" : ""}`}
                    key={`${slot.date}-${slot.time}-${index}`}
                    onClick={() => {
                      setSelectedSlotIndex(index);
                      setForm({
                        ...form,
                        requestedDate: slot.date,
                        requestedTime: slot.time,
                      });
                    }}
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
        ) : (
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
            disabled={
              loadingHospitals ||
              loadingDepartments ||
              (step === 1 &&
                (!form.hospitalId || !form.departmentId || !form.requestedDate))
            }
            onClick={
              step === 1
                ? recommend
                : step === 2
                  ? () => setStep(3)
                  : handleBook
            }
          >
            {loadingHospitals || loadingDepartments
              ? "Loading..."
              : step === 3
                ? "Request appointment"
                : "Continue"}{" "}
            <Icon name="arrowRight" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
