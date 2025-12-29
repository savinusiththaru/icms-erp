'use client';

import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import formStyles from '@/styles/Forms.module.css';
import Modal from '@/components/Modal';

interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
    status: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { can } = useAuth();

    const [formData, setFormData] = useState({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        status: 'Active',
        salary: 0,
        joinDate: new Date().toISOString().split('T')[0]
    });

    const fetchEmployees = () => {
        fetch('/api/employees')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setEmployees(data);
                } else {
                    console.error('API returned non-array:', data);
                    setEmployees([]);
                }
            })
            .catch(err => {
                console.error('Failed to load employees', err);
                setEmployees([]);
            });
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const [editingId, setEditingId] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { ...formData, id: editingId } : formData;

            const res = await fetch('/api/employees', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...body,
                    joinDate: new Date(formData.joinDate).toISOString()
                })
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingId(null);
                fetchEmployees();
                resetForm();
            }
        } catch (error) {
            console.error('Failed to save employee', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;
        try {
            const res = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchEmployees();
        } catch (error) {
            console.error('Failed to delete employee', error);
        }
    };

    const handleEdit = (emp: Employee) => {
        setFormData({
            employeeId: (emp as any).employeeId || '',
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            phone: (emp as any).phone || '',
            department: emp.department,
            position: emp.position,
            status: emp.status,
            salary: (emp as any).salary || 0,
            joinDate: new Date().toISOString().split('T')[0] // simplified for now
        });
        setEditingId(emp.id);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            employeeId: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            position: '',
            department: '',
            status: 'Active',
            salary: 0,
            joinDate: new Date().toISOString().split('T')[0]
        });
        setEditingId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };



    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Active': return styles.statusActive;
            case 'On Leave': return styles.statusOnLeave;
            case 'Terminated': return styles.statusInactive;
            default: return '';
        }
    };

    const [filterStatus, setFilterStatus] = useState('All');
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const filteredEmployees = employees.filter(emp => {
        if (filterStatus === 'All') return true;
        return emp.status === filterStatus;
    });

    const handleFilterSelect = (status: string) => {
        setFilterStatus(status);
        setShowFilterMenu(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Employees</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                        Manage your employee directory and details
                    </p>
                </div>
                <div className={styles.controls}>
                    <div className={styles.filterContainer}>
                        <button
                            className="btn"
                            style={{ border: '1px solid var(--border-medium)', background: 'white', color: filterStatus !== 'All' ? 'var(--primary)' : 'inherit' }}
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                        >
                            <Filter size={18} style={{ marginRight: '8px' }} />
                            {filterStatus === 'All' ? 'Filter' : filterStatus}
                        </button>
                        {showFilterMenu && (
                            <div className={styles.dropdownMenu}>
                                {['All', 'Active', 'On Leave', 'Terminated'].map(status => (
                                    <button
                                        key={status}
                                        className={`${styles.dropdownItem} ${filterStatus === status ? styles.active : ''}`}
                                        onClick={() => handleFilterSelect(status)}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {can('manage_employees') && (
                        <button className="btn btn-primary" onClick={openCreateModal}>
                            <Plus size={18} style={{ marginRight: '8px' }} />
                            Add Employee
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>EMP ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((emp) => (
                            <tr key={emp.id}>
                                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{emp.employeeId || '-'}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.8rem', fontWeight: '600', color: '#475569'
                                        }}>
                                            {emp.firstName[0]}{emp.lastName[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{emp.firstName} {emp.lastName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{emp.department}</td>
                                <td>{emp.position}</td>
                                <td>{emp.email}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${getStatusClass(emp.status)}`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className={styles.actionBtn} onClick={() => handleEdit(emp)} title="Edit">
                                            Edit
                                        </button>
                                        <button className={styles.actionBtn} onClick={() => handleDelete(emp.id)} style={{ color: '#ef4444' }} title="Delete">
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Employee" : "Add Employee"}>
                <form onSubmit={handleCreate} className={formStyles.form}>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Employee ID</label>
                        <input className={formStyles.input} required value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} placeholder="e.g. EMP-001" />
                    </div>
                    <div className={formStyles.row}>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>First Name</label>
                            <input className={formStyles.input} required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="e.g. John" />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Last Name</label>
                            <input className={formStyles.input} required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="e.g. Doe" />
                        </div>
                    </div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Email</label>
                        <input className={formStyles.input} type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john.doe@company.com" />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Phone</label>
                        <input className={formStyles.input} required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className={formStyles.row}>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Department</label>
                            <input className={formStyles.input} required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. Engineering" />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Position</label>
                            <input className={formStyles.input} required value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} placeholder="e.g. Senior Developer" />
                        </div>
                    </div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Salary</label>
                        <input className={formStyles.input} type="number" required min="0" value={formData.salary} onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })} />
                    </div>
                    <div className={formStyles.actions}>
                        <button type="button" className={formStyles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className={formStyles.btnSubmit}>
                            {editingId ? 'Save Changes' : 'Create Employee'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
