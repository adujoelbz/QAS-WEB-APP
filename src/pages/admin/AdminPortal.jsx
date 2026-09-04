import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import { appointmentService } from '../../api/appointmentService';
import { Icon } from '../../components/common/AppUi';
import AdminSidebar from '../../components/layout/AdminSidebar';
import PortalHeader from '../../components/layout/PortalHeader';
import AdminDashboardPage from './AdminDashboardPage';
import AdminAppointmentsPage from './AdminAppointmentsPage';
import AdminQueuesPage from './AdminQueuesPage';
import AdminReportsPage from './AdminReportsPage';
import AdminAuditPage from './AdminAuditPage';
import AdminAiPage from './AdminAiPage';
import AdminHospitalsPage from './AdminHospitalsPage';
import AdminNotificationsPage from './AdminNotificationsPage';
import AdminDoctorsPage from './AdminDoctorsPage';
import AdminDepartmentsPage from './AdminDepartmentsPage';
import AdminAccountsPage from './AdminAccountsPage';

const titles = { dashboard: 'Dashboard', appointments: 'Appointments', queues: 'Queue analytics', hospitals: 'Hospitals', doctors: 'Register doctor', departments: 'Departments', admins: 'Register admin', notifications: 'Notifications', ai: 'AI workspace', reports: 'AI reports', audit: 'Audit logs' };
export default function AdminPortal({ session, onLogout }) {
  const [view, setView] = useState('dashboard'); const [collapsed, setCollapsed] = useState(false); const [mobileNav, setMobileNav] = useState(false); const [stats, setStats] = useState(null); const [appointments, setAppointments] = useState([]); const [reports, setReports] = useState([]); const [logs, setLogs] = useState([]); const [busy, setBusy] = useState(true); const [error, setError] = useState(''); const [toast, setToast] = useState('');
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2800); };
  const load = async () => { setBusy(true); try { const [dashboard, page] = await Promise.all([adminService.getDashboardStats(), appointmentService.listAll()]); setStats(dashboard); setAppointments(page?.content || []); setError(''); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (view === 'dashboard' || view === 'appointments') load(); }, [view]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (view !== 'appointments') return undefined;
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (view === 'reports') adminService.getPredictionReports({ from: '2020-01-01T00:00:00Z', to: new Date().toISOString() }).then(setReports).catch((err) => setError(err.message)); if (view === 'audit') adminService.getAuditLogs().then((page) => setLogs(page?.content || [])).catch((err) => setError(err.message)); }, [view]);
  const approve = async (item) => { try { const updated = await appointmentService.approve(item.id); setAppointments((items) => items.map((entry) => entry.id === item.id ? updated : entry)); notify(`Appointment approved and assigned to ${updated.doctorName || updated.doctor || `doctor #${updated.doctorId}`}`); } catch (err) { notify(err.message); } };
  const reject = async (item) => { try { const updated = await appointmentService.reject(item.id); setAppointments((items) => items.map((entry) => entry.id === item.id ? updated : entry)); notify('Appointment rejected'); } catch (err) { notify(err.message); } };
  let content = <AdminDashboardPage stats={stats} appointments={appointments} onNavigate={setView} />; if (view === 'appointments') content = <AdminAppointmentsPage appointments={appointments} onApprove={approve} onReject={reject} onRefresh={load} />; if (view === 'queues') content = <AdminQueuesPage onToast={notify} />; if (view === 'ai') content = <AdminAiPage onToast={notify} />; if (view === 'reports') content = <AdminReportsPage reports={reports} />; if (view === 'audit') content = <AdminAuditPage logs={logs} />;
  if (view === 'hospitals') content = <AdminHospitalsPage onToast={notify} />;
  if (view === 'notifications') content = <AdminNotificationsPage onToast={notify} />;
  if (view === 'doctors') content = <AdminDoctorsPage onToast={notify} />;
  if (view === 'departments') content = <AdminDepartmentsPage onToast={notify} />;
  if (view === 'admins') content = <AdminAccountsPage onToast={notify} />;
  return <div className="app-shell admin-shell"><AdminSidebar activeView={view} setActiveView={setView} mobileNav={mobileNav} collapsed={collapsed} setCollapsed={setCollapsed} closeMobile={() => setMobileNav(false)} onLogout={onLogout} /><div className="main-column"><PortalHeader admin title={titles[view]} profile={session} onMenu={() => setMobileNav(true)} onNotify={() => notify('You have no new notifications')} /><main className="content">{busy && <div className="loading-bar">Loading admin workspace...</div>}{error && <div className="api-alert">{error}. Check that the backend is running.</div>}{content}</main></div>{toast && <div className="toast"><span className="toast-check"><Icon name="check" size={13} /></span>{toast}</div>}</div>;
}
