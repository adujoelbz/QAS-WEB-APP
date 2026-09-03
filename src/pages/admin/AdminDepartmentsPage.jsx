import { useEffect, useState } from "react";
import { departmentService } from "../../api/departmentService";
import { hospitalService } from "../../api/hospitalService";
import { Icon } from "../../components/common/AppUi";

const empty = { name: "", specialty: "", estimatedConsultationDurationMinutes: 30, hospitalId: "" };
const items = (payload) => Array.isArray(payload) ? payload : payload?.content || payload?.items || [];

export default function AdminDepartmentsPage({ onToast }) {
  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const hospitalPayload = await hospitalService.search();
      const hospitalList = items(hospitalPayload);
      const departmentGroups = await Promise.all(hospitalList.map((hospital) => departmentService.listPublic({ hospitalId: hospital.id })));
      setDepartments(departmentGroups.flatMap((group) => items(group)));
      setHospitals(hospitalList);
    } catch (error) {
      onToast(error.message);
    }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    const payload = {
      name: form.name,
      specialty: form.specialty,
      estimatedConsultationDurationMinutes: Number(form.estimatedConsultationDurationMinutes),
    };
    try {
      const result = editing
        ? await departmentService.update(editing, payload)
        : await departmentService.create(Number(form.hospitalId), payload);
      setDepartments((current) => editing ? current.map((item) => item.id === editing ? result : item) : [result, ...current]);
      setForm({ ...empty, hospitalId: form.hospitalId });
      setEditing(null);
      onToast(editing ? "Department updated" : "Department created");
    } catch (error) {
      onToast(error.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await departmentService.remove(id);
      setDepartments((current) => current.filter((item) => item.id !== id));
      onToast("Department deleted");
    } catch (error) {
      onToast(error.message);
    }
  };
  return (
    <div className="view-stack">
      <div className="page-heading"><div><p className="eyebrow">SYSTEM CONFIGURATION</p><h1>Departments</h1><p className="muted">Organize specialties and consultation capacity by hospital.</p></div></div>
      <form className="panel department-form" onSubmit={save}>
        <div className="panel-heading"><div><p className="eyebrow">{editing ? "EDIT DEPARTMENT" : "NEW DEPARTMENT"}</p><h2>{editing ? "Update department" : "Add department"}</h2></div><Icon name="grid" /></div>
        <div className="form-grid">
          <label className="field"><span>Name</span><input value={form.name} onChange={update("name")} placeholder="Cardiology Unit" required /></label>
          <label className="field"><span>Specialty</span><input value={form.specialty} onChange={update("specialty")} placeholder="Cardiology" required /></label>
          <label className="field"><span>Consultation duration (minutes)</span><input type="number" min="5" max="240" step="5" value={form.estimatedConsultationDurationMinutes} onChange={update("estimatedConsultationDurationMinutes")} required /></label>
          {!editing && <label className="select-field"><span>Hospital</span><select value={form.hospitalId} onChange={update("hospitalId")} required><option value="">Select hospital</option>{hospitals.map((hospital) => <option value={hospital.id} key={hospital.id}>{hospital.name}</option>)}</select></label>}
        </div>
        <div className="admin-form-actions"><button className="primary-button" disabled={busy || (!editing && !hospitals.length)}><Icon name="check" size={15} /> {busy ? "Saving..." : editing ? "Save changes" : "Create department"}</button>{editing && <button type="button" className="outline-button" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}</div>
      </form>
      <section className="panel table-panel"><div className="table-head department-table-head"><span>DEPARTMENT</span><span>SPECIALTY</span><span>HOSPITAL</span><span>DURATION</span><span>ACTION</span></div>{departments.length ? departments.map((item) => <div className="table-row department-table-row" key={item.id}><div><b>{item.name}</b><small>#{item.id}</small></div><span>{item.specialty || "-"}</span><span>{item.hospitalName || hospitals.find((hospital) => hospital.id === item.hospitalId)?.name || `Hospital #${item.hospitalId || "-"}`}</span><span>{item.estimatedConsultationDurationMinutes || item.consultationDurationMinutes || "-"} min</span><div className="admin-actions"><button className="tiny-button approve" onClick={() => { setEditing(item.id); setForm({ ...empty, ...item, hospitalId: item.hospitalId || "" }); }}>Edit</button><button className="tiny-button reject" onClick={() => remove(item.id)}>Delete</button></div></div>) : <div className="empty-table">No departments found.</div>}</section>
    </div>
  );
}
