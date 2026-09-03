import { Icon, Logo } from "../common/AppUi";

export default function PatientSidebar({
  activeView,
  setActiveView,
  mobileNav,
  collapsed,
  setCollapsed,
  closeMobile,
  onLogout,
}) {
  const sections = [
    {
      label: "Workspace",
      items: [
        ["overview", "grid", "Overview"],
        ["appointments", "calendar", "Appointments"],
        ["queue", "activity", "Live queue"],
        ["hospitals", "pin", "Find hospitals"],
      ],
    },
    { label: "Account", items: [["profile", "user", "My profile"]] },
  ];
  return (
    <>
      <div
        className={`sidebar-overlay ${mobileNav ? "show" : ""}`}
        onClick={closeMobile}
      />
      <aside
        className={`sidebar ${mobileNav ? "open" : ""} ${collapsed ? "collapsed" : ""}`}
      >
        <div className="sidebar-top">
          <div className="brand brand-dark">
            <Logo />
          </div>
          <button
            className="icon-button close-nav"
            onClick={closeMobile}
            aria-label="Close navigation"
          >
            <Icon name="close" />
          </button>
          <button
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon name="arrowRight" size={16} />
          </button>
        </div>
        {sections.map((section) => (
          <div className="sidebar-section" key={section.label}>
            <div className="sidebar-section-title">{section.label}</div>
            <nav>
              {section.items.map(([id, icon, label]) => (
                <button
                  key={id}
                  className={`nav-item ${activeView === id ? "active" : ""}`}
                  onClick={() => {
                    setActiveView(id);
                    closeMobile();
                  }}
                  title={collapsed ? label : undefined}
                >
                  <Icon name={icon} />
                  <span>{label}</span>
                  {id === "queue" && <em>LIVE</em>}
                </button>
              ))}
            </nav>
          </div>
        ))}
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">
              <Icon name="help" size={15} />
            </span>
            <div>
              <b>Need help?</b>
              <small>Contact support</small>
            </div>
            <span className="arrow">
              <Icon name="arrowRight" size={15} />
            </span>
          </div>
          <button className="nav-item logout" onClick={onLogout}>
            <Icon name="logout" />
            <span>Sign out</span>
          </button>
          <small className="version">Queueless v1.0 - Accra</small>
        </div>
      </aside>
    </>
  );
}
