import { useState } from 'react';
import { notificationService } from '../../api/notificationService';
import { Icon } from '../../components/common/AppUi';

export default function AdminNotificationsPage({ onToast }) {
  const [id, setId] = useState(''); const [busy, setBusy] = useState(false);
  const retry = async (event) => { event.preventDefault(); if (!id) return; setBusy(true); try { await notificationService.retry(id); onToast(`Notification #${id} queued for retry`); setId(''); } catch (err) { onToast(err.message); } finally { setBusy(false); } };
  return <div className="view-stack"><div className="page-heading"><div><p className="eyebrow">DELIVERY OPERATIONS</p><h1>Notifications</h1><p className="muted">Retry a failed notification after resolving its delivery issue.</p></div></div><form className="panel notification-retry-form" onSubmit={retry}><div className="panel-heading"><div><p className="eyebrow">FAILED DELIVERY</p><h2>Retry notification</h2></div><Icon name="bell" /></div><div className="filter-controls"><label className="field"><span>Notification ID</span><input type="number" min="1" value={id} onChange={(e) => setId(e.target.value)} placeholder="Enter notification ID" required /></label><button className="primary-button" disabled={busy}><Icon name="refresh" size={15} /> {busy ? 'Retrying...' : 'Retry delivery'}</button></div></form></div>;
}
