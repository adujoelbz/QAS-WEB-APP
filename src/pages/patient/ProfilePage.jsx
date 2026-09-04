import { useState } from "react";
import { patientService } from "../../api/patientService";
import { Field, Icon, initials } from "../../components/common/AppUi";
export default function ProfilePage({ profile, onSaved, onToast }) {
  const storedFiles = Array.isArray(profile.medicalHistory?.files)
    ? profile.medicalHistory.files
    : [];
  const [form, setForm] = useState({
    firstName: profile.firstName || "",
    phone: profile.phone || "",
    address: profile.address || "",
  });
  const [saving, setSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState(storedFiles);
  const [uploading, setUploading] = useState(false);
  const uploadSelectedFiles = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of selectedFiles) {
        const result = await patientService.uploadMedicalHistory(file);
        uploaded.push({
          publicId: result.publicId,
          originalFileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        });
      }
      setUploadedFiles((files) => [...files, ...uploaded]);
      setSelectedFiles([]);
      onToast(`${uploaded.length} medical histor${uploaded.length === 1 ? "y file" : "y files"} uploaded`);
    } catch (err) {
      onToast(err.message);
    } finally {
      setUploading(false);
    }
  };
  const downloadFile = async (file) => {
    try {
      const result = await patientService.getMedicalHistoryDownload(file.publicId);
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
            <b>Choose files to upload</b>
            <small>PDF, JPG or PNG - Max 10 MB each</small>
            <input
              type="file"
              multiple
              accept="application/pdf,image/jpeg,image/png"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
            />
          </label>
          {selectedFiles.length > 0 && (
            <div className="history-file-list pending-files">
              <p className="eyebrow">SELECTED FILES</p>
              {selectedFiles.map((file, index) => (
                <div className="history-file" key={`${file.name}-${file.lastModified}`}>
                  <span><b>{file.name}</b><small>{formatFileSize(file.size)}</small></span>
                  <button type="button" className="icon-button" onClick={() => setSelectedFiles((files) => files.filter((_, i) => i !== index))} aria-label={`Remove ${file.name}`}><Icon name="close" size={14} /></button>
                </div>
              ))}
              <button type="button" className="primary-button" onClick={uploadSelectedFiles} disabled={uploading}>
                <Icon name="upload" size={15} /> {uploading ? "Uploading..." : `Upload ${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"}`}
              </button>
            </div>
          )}
          {uploadedFiles.length > 0 && (
            <div className="history-file-list">
              <p className="eyebrow">UPLOADED FILES</p>
              {uploadedFiles.map((file) => (
                <div className="history-file" key={file.publicId}>
                  <span><b>{file.originalFileName || file.originalFilename || "Medical history file"}</b><small>{formatFileSize(file.fileSize)}</small></span>
                  <button type="button" className="icon-button" onClick={() => downloadFile(file)} aria-label="Download medical history file"><Icon name="download" size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function formatFileSize(size) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
