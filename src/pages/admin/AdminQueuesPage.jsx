import { useState } from "react";
import { adminService } from "../../api/adminService";
import { Icon } from "../../components/common/AppUi";
export default function AdminQueuesPage({ onToast }) {
  const [departmentId, setDepartmentId] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    if (!departmentId) return;
    setBusy(true);
    try {
      setAnalytics(await adminService.getQueueAnalytics(departmentId));
    } catch (err) {
      onToast(err.message);
    } finally {
      setBusy(false);
    }
  };
  const recalc = async () => {
    if (!departmentId) return;
    setBusy(true);
    try {
      await adminService.recalculateQueue(departmentId);
      setAnalytics(await adminService.getQueueAnalytics(departmentId));
      onToast("Queue positions recalculated");
    } catch (err) {
      onToast(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="view-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PATIENT FLOW</p>
          <h1>Queue analytics</h1>
          <p className="muted">
            Inspect department demand and refresh queue positions.
          </p>
        </div>
      </div>
      <section className="panel queue-control">
        <div className="queue-search">
          <label className="field">
            <span>Department ID</span>
            <div className="input-wrap">
              <input
                type="number"
                min="1"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                placeholder="Enter department ID"
              />
            </div>
          </label>
          <button
            className="primary-button"
            onClick={load}
            disabled={busy || !departmentId}
          >
            Load analytics
          </button>
          <button
            className="outline-button"
            onClick={recalc}
            disabled={busy || !departmentId}
          >
            <Icon name="activity" /> Recalculate queue
          </button>
        </div>
      </section>
      {analytics && (
        <div className="admin-stat-grid">
          <AdminStat
            label="Department"
            value={analytics.departmentName || "-"}
            icon="activity"
          />
          <AdminStat
            label="Current queue"
            value={analytics.currentQueueLength ?? 0}
            icon="user"
          />
          <AdminStat
            label="Average wait"
            value={`${analytics.averageWaitMinutes ?? 0} min`}
            icon="clock"
          />
          <AdminStat
            label="Utilization"
            value={
              analytics.slotUtilization != null
                ? `${Math.round(analytics.slotUtilization * 100)}%`
                : "-"
            }
            icon="grid"
          />
        </div>
      )}
    </div>
  );
}
function AdminStat({ label, value, icon }) {
  return (
    <div className="stat-card admin-stat">
      <span className="stat-icon">
        <Icon name={icon} />
      </span>
      <div>
        <span className="stat-label">{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
