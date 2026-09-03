export default function AdminAuditPage({ logs }) {
  return (
    <div className="view-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ACCOUNTABILITY</p>
          <h1>Audit logs</h1>
          <p className="muted">Every administrative action is recorded here.</p>
        </div>
      </div>
      <section className="panel table-panel">
        <div className="table-head audit-head">
          <span>ACTION</span>
          <span>ADMIN</span>
          <span>DETAILS</span>
          <span>IP ADDRESS</span>
          <span>CREATED</span>
        </div>
        {logs.length ? (
          logs.map((log) => (
            <div className="table-row audit-row" key={log.id}>
              <b>{log.action}</b>
              <span>#{log.adminId}</span>
              <span>{log.details ? JSON.stringify(log.details) : "-"}</span>
              <span>{log.ipAddress || "-"}</span>
              <small>
                {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
              </small>
            </div>
          ))
        ) : (
          <div className="empty-table">No audit logs returned.</div>
        )}
      </section>
    </div>
  );
}
