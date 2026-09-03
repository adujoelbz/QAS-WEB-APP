import { useState } from "react";
import { patientService } from "../../api/patientService";
import { Field, Icon, initials } from "../../components/common/AppUi";
export default function ProfilePage({ profile, onSaved, onToast }) {
  const [form, setForm] = useState({
    firstName: profile.firstName || "",
    phone: profile.phone || "",
    address: profile.address || "",
  });
  const [saving, setSaving] = useState(false);
  const downloadHistory = async () => { const publicId = profile.medicalHistory?.publicId || profile.medicalHistoryPublicId; if (!publicId) { onToast("No medical history file available"); return; } try { const result = await patientService.getMedicalHistoryDownload(publicId); const link = document.createElement("a"); link.href = result.downloadUrl; link.target = "_blank"; link.rel = "noreferrer"; link.download = result.originalFilename || "medical-history"; document.body.appendChild(link); link.click(); link.remove(); onToast("Medical history download started"); } catch (err) { onToast(err.message); } };
  const save = async () => {
    setSaving(true);
    try {
      const updated = await patientService.updateProfile(form);
      onSaved(updated);
      onToast("Profile changes saved");
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
          <p className="eyebrow">ACCOUNT SETTINGS</p>
          <h1>My profile</h1>
          <p className="muted">
            Manage your personal details and health information.
          </p>
        </div>
        <button className="outline-button" onClick={save} disabled={saving}>
          <Icon name="check" /> {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
      <div className="profile-grid">
        <section className="panel profile-card">
          <div className="profile-identity">
            <span className="profile-avatar">{initials(profile)}</span>
            <div>
              <h2>
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="muted">{profile.email}</p>
            </div>
          </div>
          <div className="form-grid">
            <Field
              label="First name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="John"
            />
            <Field
              label="Phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+233 50 123 4567"
            />
          </div>
          <label className="field">
            <span>Address</span>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Main Street, Accra"
            />
          </label>
        </section>
        <section className="panel privacy-card">
          <p className="eyebrow">HEALTH INFORMATION</p>
          <h2>Medical history</h2>
          <p className="muted">
            Upload documents your care team may need before your visit.
          </p>
          <label className="upload-zone">
            <Icon name="upload" size={22} />
            <b>Choose a file to upload</b>
            <small>PDF, JPG or PNG - Max 10 MB</small>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  try {
                    await patientService.uploadMedicalHistory(
                      e.target.files[0],
                    );
                    onToast("Medical history uploaded");
                  } catch (err) {
                    onToast(err.message);
                  }
                }
              }}
            />
          </label>
          <button className="outline-button history-download" onClick={downloadHistory} disabled={!profile.medicalHistory?.publicId && !profile.medicalHistoryPublicId}><Icon name="download" size={16} /> Download medical history</button>
        </section>
      </div>
    </div>
  );
}
