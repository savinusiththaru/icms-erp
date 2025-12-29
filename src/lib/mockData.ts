import { Employee, Invoice, Quotation, Payment } from '@/types';

export const mockEmployees: Employee[] = [
    {
        id: 'EMP-001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        position: 'Senior Consultant',
        department: 'Compliance',
        status: 'Active',
        joinDate: '2023-01-15',
        salary: 85000,
    },
    {
        id: 'EMP-002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1987654321',
        position: 'HR Manager',
        department: 'Human Resources',
        status: 'Active',
        joinDate: '2023-03-10',
        salary: 75000,
    },
    {
        id: 'EMP-003',
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'robert.j@example.com',
        phone: '+1122334455',
        position: 'Legal Advisor',
        department: 'Legal',
        status: 'On Leave',
        joinDate: '2022-11-05',
        salary: 95000,
    },
];

export const mockInvoices: Invoice[] = [
    {
        id: 'INV-2024-001',
        clientName: 'Acme Corp',
        companyName: 'Acme International Ltd',
        issueDate: '2024-05-01',
        dueDate: '2024-05-15',
        amount: 5000,
        status: 'Paid',
        items: [],
    },
    {
        id: 'INV-2024-002',
        clientName: 'Globex Inc',
        companyName: 'Globex Corporation',
        issueDate: '2024-05-10',
        dueDate: '2024-05-24',
        amount: 12500,
        status: 'Sent',
        items: [],
    },
];

export const mockQuotations: Quotation[] = [
    {
        id: 'QT-2024-001',
        clientName: 'TechStart Solutions',
        companyName: 'TechStart',
        date: '2024-06-01',
        expiryDate: '2024-06-15',
        totalAmount: 3500,
        status: 'Draft',
    },
    {
        id: 'QT-2024-002',
        clientName: 'MegaCorp Industries',
        companyName: 'MegaCorp',
        date: '2024-05-20',
        expiryDate: '2024-07-20',
        totalAmount: 15000,
        status: 'Accepted',
    },
    {
        id: 'QT-2024-003',
        clientName: 'Small Biz Inc',
        companyName: 'Small Biz',
        date: '2024-06-05',
        expiryDate: '2024-06-19',
        totalAmount: 1200,
        status: 'Sent',
    },
];

export const mockPayments: Payment[] = [
    {
        id: 'PAY-2024-001',
        invoiceId: 'INV-2024-001',
        amount: 5000,
        date: '2024-05-14',
        method: 'Bank Transfer',
        status: 'Completed',
    },
    {
        id: 'PAY-2024-002',
        invoiceId: 'INV-2024-002',
        amount: 1000,
        date: '2024-05-12',
        method: 'Credit Card',
        status: 'Completed',
    },
];
