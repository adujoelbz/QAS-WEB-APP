import {
  FiActivity,
  FiArrowRight,
  FiBell,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiDownload,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiMapPin,
  FiMenu,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiUpload,
  FiUser,
  FiX,
} from "react-icons/fi";

const icons = {
  activity: FiActivity,
  arrowRight: FiArrowRight,
  bell: FiBell,
  calendar: FiCalendar,
  check: FiCheck,
  chevronDown: FiChevronDown,
  clock: FiClock,
  download: FiDownload,
  grid: FiGrid,
  help: FiHelpCircle,
  logout: FiLogOut,
  pin: FiMapPin,
  menu: FiMenu,
  plus: FiPlus,
  refresh: FiRefreshCw,
  shield: FiShield,
  upload: FiUpload,
  user: FiUser,
  close: FiX,
};

export function Icon({ name, size = 18 }) {
  const Glyph = icons[name] || FiActivity;
  return <Glyph size={size} strokeWidth={1.8} aria-hidden="true" />;
}
export function Logo() {
  return (
    <>
      <img className="brand-logo" src="/queueless-logo.svg" alt="" />
      <span className="brand-word">queueless</span>
    </>
  );
}
export function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  trailing,
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-wrap">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
        />
        {trailing}
      </div>
    </label>
  );
}
export function initials(profile = {}) {
  return (
    `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() ||
    "P"
  );
}
export function formatDate(value) {
  if (!value) return "Date pending";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
}
export function formatTime(value) {
  return value ? String(value).slice(0, 5) : "Time pending";
}
export function labelStatus(status) {
  return (
    {
      CONFIRMED: "Confirmed",
      APPROVED: "Approved",
      PENDING: "Pending review",
      SCHEDULED: "Scheduled",
      IN_PROGRESS: "In progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      NO_SHOW: "No show",
      REJECTED: "Rejected",
    }[status] ||
    status ||
    "Unknown"
  );
}
