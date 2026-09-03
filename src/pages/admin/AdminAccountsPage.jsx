import { useState } from "react";
import { adminService } from "../../api/adminService";
import { Icon } from "../../components/common/AppUi";

const initial = { email: "", password: "" };
export default function AdminAccountsPage({ onToast }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setBusy(true);
    try { const result = await adminService.createAdmin(form); onToast(`Admin account created for ${result.email}`); setForm(initial); }
    catch (error) { onToast(error.message); }
    finally { setBusy(false); }
  };
  return <div className="view-stack"><div className="page-heading"><div><p className="eyebrow">STAFF MANAGEMENT</p><h1>Register an admin</h1><p className="muted">Provision another administrator with access to system oversight.</p></div></div><form className="panel admin-registration-form" onSubmit={submit}><div className="panel-heading"><div><p className="eyebrow">ACCOUNT DETAILS</p><h2>Admin registration</h2></div><Icon name="shield" /></div><div className="form-grid"><label className="field"><span>Email address</span><input type="email" value={form.email} onChange={update("email")} required /></label><label className="field"><span>Temporary password</span><input type="password" minLength="6" value={form.password} onChange={update("password")} required /></label></div><button className="primary-button" disabled={busy}><Icon name="check" size={15} /> {busy ? "Creating account..." : "Create admin account"}</button></form></div>;
}
