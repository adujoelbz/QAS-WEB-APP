export default function AdminReportsPage({ reports }) {
  return (
    <div className="view-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">DECISION SUPPORT</p>
          <h1>AI prediction reports</h1>
          <p className="muted">
            Review recorded predictions and their outcomes.
          </p>
        </div>
        <span className="live-badge">
          <i /> LOGGED
        </span>
      </div>
      <section className="panel table-panel">
        <div className="table-head report-head">
          <span>TYPE</span>
          <span>APPOINTMENT</span>
          <span>RESULT</span>
          <span>MODEL</span>
          <span>CREATED</span>
        </div>
        {reports.length ? (
          reports.map((report) => (
            <div className="table-row report-row" key={report.id}>
              <b>{report.predictionType}</b>
              <span>#{report.appointmentId || "-"}</span>
              <span className="report-result">
                {report.predictionResult
                  ? JSON.stringify(report.predictionResult)
                  : "-"}
              </span>
              <span>{report.modelVersion || "-"}</span>
              <small>
                {report.createdAt
                  ? new Date(report.createdAt).toLocaleString()
                  : "-"}
              </small>
            </div>
          ))
        ) : (
          <div className="empty-table">No prediction reports returned.</div>
        )}
      </section>
    </div>
  );
}
