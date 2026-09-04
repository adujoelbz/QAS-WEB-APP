import { useEffect, useState } from "react";
import { doctorService } from "../../api/doctorService";
import { Icon, initials } from "../../components/common/AppUi";

const dayOptions = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
const selectedDays = (availableDays) =>
  Array.isArray(availableDays)
    ? availableDays
    : availableDays && typeof availableDays === "object"
      ? dayOptions.filter((day) => Object.prototype.hasOwnProperty.call(availableDays, day))
      : [];

export default function DoctorProfilePage({ profile, mode, onSaved, onToast }) {
  const [duration, setDuration] = useState(
    profile.consultationDurationMinutes || 30,
  );
  const [days, setDays] = useState(selectedDays(profile.availableDays));
  const [dayOfWeek, setDayOfWeek] = useState(
    selectedDays(profile.availableDays)[0] || "MONDAY",
  );
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setDuration(profile.consultationDurationMinutes || 30);
    const nextDays = selectedDays(profile.availableDays);
    setDays(nextDays);
    setDayOfWeek((current) =>
      nextDays.includes(current) ? current : nextDays[0] || "MONDAY",
    );
  }, [profile]);
  const saveDuration = async () => {
    setSaving(true);
    try {
      const updated = await doctorService.setConsultationDuration({
        consultationDurationMinutes: Number(duration),
      });
      onSaved((current) => ({
        ...current,
        ...(updated || {}),
        consultationDurationMinutes: Number(duration),
      }));
      onToast("Consultation duration updated");
    } catch (err) {
      onToast(err.message);
    } finally {
      setSaving(false);
    }
  };
  const saveAvailability = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const existingAvailability =
        profile.availableDays && typeof profile.availableDays === "object" && !Array.isArray(profile.availableDays)
          ? profile.availableDays
          : {};
      const availableDays = days.reduce(
        (result, day) => ({
          ...result,
          [day]: existingAvailability[day] || [`${startTime}-${endTime}`],
        }),
        {},
      );
      const payload = {
        doctorId: profile.id,
        dayOfWeek,
        startTime,
        endTime,
        slotDurationMinutes: Number(duration),
        availableDays,
      };
      const updated = await doctorService.updateAvailability(payload);
      onSaved((current) => ({
        ...current,
        ...(updated || {}),
        availableDays,
      }));
      onToast("Availability updated");
    } catch (err) {
      onToast(err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="view-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PRACTICE SETTINGS</p>
          <h1>{mode === "availability" ? "Availability" : "Profile"}</h1>
          <p className="muted">
            {mode === "availability"
              ? "Set when patients can request consultations."
              : "Review your professional details and consultation preferences."}
          </p>
        </div>
      </div>
      <div className="profile-grid doctor-profile-grid">
        <section className="panel profile-card">
          <div className="profile-identity">
            <span className="profile-avatar">{initials(profile)}</span>
            <div>
              <h2>
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="muted">{profile.email}</p>
            </div>
            <span className="verified">Verified doctor</span>
          </div>
          <div className="doctor-detail-list">
            <Detail
              label="Specialty"
              value={profile.specialty || "Not specified"}
            />
            <Detail
              label="Hospital"
              value={profile.hospitalName || "Not assigned"}
            />
            <Detail label="Hospital ID" value={profile.hospitalId || "-"} />
          </div>
        </section>
        <section className="panel">
          <p className="eyebrow">CONSULTATION</p>
          <h2>Duration</h2>
          <p className="muted">Used to generate available appointment slots.</p>
          <div className="duration-control">
            <label className="field">
              <span>Minutes</span>
              <input
                type="number"
                min="5"
                max="240"
                step="5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </label>
            <button
              className="primary-button"
              onClick={saveDuration}
              disabled={saving}
            >
              Save duration
            </button>
          </div>
        </section>
      </div>
      {mode === "availability" && (
        <form className="panel availability-panel" onSubmit={saveAvailability}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">WEEKLY HOURS</p>
              <h2>Availability rules</h2>
            </div>
            <button className="primary-button" type="submit" disabled={saving}>
              <Icon name="check" size={15} /> Save availability
            </button>
          </div>
          <div className="day-picker">
            {dayOptions.map((day) => (
              <label
                key={day}
                className={
                  days.includes(day) ? "day-option selected" : "day-option"
                }
              >
                <input
                  type="checkbox"
                  checked={days.includes(day)}
                  onChange={() =>
                    setDays((current) =>
                      current.includes(day)
                        ? current.filter((item) => item !== day)
                        : [...current, day],
                    )
                  }
                />
                <span>{day.slice(0, 3)}</span>
              </label>
            ))}
          </div>
          <div className="form-grid availability-fields">
            <label className="select-field">
              <span>Rule day</span>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
              >
                {dayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day[0] + day.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Start time</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>
            <label className="field">
              <span>End time</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>
          </div>
        </form>
      )}
    </div>
  );
}
function Detail({ label, value }) {
  return (
    <div className="doctor-detail">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
