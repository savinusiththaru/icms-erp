'use client';

import { useState, useEffect } from 'react';

import { Users, FileText, Briefcase, CreditCard, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    employees: 0,
    pendingInvoices: 0,
    pendingAmount: 0,
    quotations: 0
  });
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [invoicesRes, employeesRes, quotationsRes, activitiesRes] = await Promise.all([
          fetch('/api/invoices'),
          fetch('/api/employees'),
          fetch('/api/quotations'),
          fetch('/api/activities')
        ]);

        const invoices = await invoicesRes.json();
        const employees = await employeesRes.json();
        const quotations = await quotationsRes.json();
        const activitiesData = await activitiesRes.json();

        // Calculate Revenue (assuming all non-pending/cancelled are revenue, or simplified sum for now)
        // In a real app, check for 'Paid' status. For now, assuming standard statuses.
        const revenue = Array.isArray(invoices)
          ? invoices.reduce((sum: number, inv: any) => sum + (inv.status === 'Paid' ? (inv.amount || 0) : 0), 0)
          : 0;

        const pendingInv = Array.isArray(invoices)
          ? invoices.filter((inv: any) => inv.status === 'Pending')
          : [];

        const pendingAmount = pendingInv.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);

        setMetrics({
          revenue,
          employees: Array.isArray(employees) ? employees.length : 0,
          pendingInvoices: pendingInv.length,
          pendingAmount,
          quotations: Array.isArray(quotations) ? quotations.length : 0
        });

        if (Array.isArray(activitiesData)) {
          setActivities(activitiesData);
        }

      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, Admin User</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Total Revenue</div>
          <div className={styles.metricValue}>LKR {metrics.revenue.toLocaleString()}</div>
          <div className={`${styles.metricTrend} ${styles.trendUp}`}>
            <TrendingUp size={16} />
            <span>Updated just now</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Active Employees</div>
          <div className={styles.metricValue}>{metrics.employees}</div>
          <div className={`${styles.metricTrend} ${styles.trendUp}`}>
            <Users size={16} />
            <span>Total Staff</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Pending Invoices</div>
          <div className={styles.metricValue}>{metrics.pendingInvoices}</div>
          <div className={styles.metricTrend} style={{ color: 'var(--text-muted)' }}>
            <span>LKR {metrics.pendingAmount.toLocaleString()} outstanding</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Active Quotations</div>
          <div className={styles.metricValue}>{metrics.quotations}</div>
          <div className={styles.metricTrend} style={{ color: 'var(--text-muted)' }}>
            <span>Open Projects/Leads</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Recent Activity</div>
        <div className={styles.activityList}>
          {activities.length === 0 ? (
            <div style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>
              No recent activity.
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className={styles.activityItem} style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <Activity size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{activity.description}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
