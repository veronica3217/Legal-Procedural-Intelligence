import React from 'react';

/**
 * DashboardCard — stat card for the dashboard.
 * Props:
 *   label: string
 *   value: string | number
 *   icon: ReactNode
 *   iconBg: CSS color string
 *   iconColor: CSS color string
 *   sub: string — optional subtext
 */
export default function DashboardCard({ label, value, icon, iconBg = '#EFF6FF', iconColor = '#2563EB', sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg }}>
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
      </div>
    </div>
  );
}
