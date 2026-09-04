import { Icon, initials } from "../common/AppUi";

export default function PortalHeader({
  admin = false,
  role,
  title,
  profile,
  onNotify,
  onMenu,
}) {
  const userRole = admin ? "ADMIN" : String(role || profile?.role || "PATIENT").toUpperCase();
  const roleLabel = {
    ADMIN: "Administrator",
    DOCTOR: "Doctor",
    PATIENT: "Patient",
  }[userRole] || "User";
  const displayName = admin
    ? "Administrator"
    : `${profile?.firstName || roleLabel} ${profile?.lastName || ""}`.trim();
  return (
    <header className="topbar">
      <button
        className="icon-button menu-button"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Icon name="menu" />
      </button>
      <div className="crumb">
        <span>{admin ? "Admin console" : "Workspace"}</span>
        <b>/</b>
        <strong>{title}</strong>
      </div>
      <div className="top-actions">
        <button
          className="icon-button notification-button"
          onClick={onNotify}
          aria-label="Notifications"
        >
          <Icon name="bell" />
          <i />
        </button>
        <div className="user-chip">
          <span className="avatar">{admin ? "AD" : initials(profile)}</span>
          <span className="user-copy">
            <b>{displayName}</b>
            <small>{roleLabel}</small>
          </span>
          <Icon name="chevronDown" size={15} />
        </div>
      </div>
    </header>
  );
}
