import { Icon, Logo } from "../common/AppUi";

export default function AdminSidebar({
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
      label: "Operations",
      items: [
        ["dashboard", "grid", "Dashboard"],
        ["appointments", "calendar", "Appointments"],
        ["queues", "activity", "Queue analytics"],
        ["hospitals", "pin", "Hospitals"],
        ["doctors", "user", "Register doctor"],
        ["departments", "grid", "Departments"],
        ["admins", "shield", "Register admin"],
      ],
    },
    {
      label: "Insights",
      items: [
        ["ai", "activity", "AI workspace"],
        ["reports", "activity", "AI reports"],
        ["audit", "check", "Audit logs"],
        ["notifications", "bell", "Notifications"],
      ],
    },
  ];
  return (
    <>
      <div
        className={`sidebar-overlay ${mobileNav ? "show" : ""}`}
        onClick={closeMobile}
      />
      <aside
        className={`sidebar admin-sidebar ${mobileNav ? "open" : ""} ${collapsed ? "collapsed" : ""}`}
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
        <div className="admin-badge">
          <span>
            <Icon name="shield" size={14} />
          </span>
          <div>
            <b>Admin console</b>
            <small>System oversight</small>
          </div>
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
                </button>
              ))}
            </nav>
          </div>
        ))}
        <div className="sidebar-bottom">
          <button className="nav-item logout" onClick={onLogout}>
            <Icon name="logout" />
            <span>Sign out</span>
          </button>
          <small className="version">Queueless v1.0 - Admin</small>
        </div>
      </aside>
    </>
  );
}
