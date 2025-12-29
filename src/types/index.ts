export interface Employee {
    id: string; // Database ID
    employeeId: string; // Custom Employee ID (e.g. EMP-001)
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    status: 'Active' | 'On Leave' | 'Terminated';
    joinDate: string;
    salary: number;
}

export interface Invoice {
    id: string;
    clientName: string;
    companyName: string;
    issueDate: string;
    dueDate: string;
    amount: number;
    status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
    reportStatus?: 'Released' | 'Pending';
    items: InvoiceItem[];
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Quotation {
    id: string;
    clientName: string;
    companyName: string;
    date: string;
    expiryDate: string;
    totalAmount: number;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
}

export interface Payment {
    id: string;
    invoiceId: string;
    amount: number;
    date: string;
    method: 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Cheque';
    status: 'Completed' | 'Pending' | 'Failed';
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string; // e.g., 'Office', 'Travel', 'Software'
    date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    receiptUrl?: string;
}

export interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    type: 'Client' | 'Vendor' | 'Partner';
    address?: string;
}

export interface RentalItem {
    id: string;
    name: string;
    dailyRate: number;
    quantity: number;
    description?: string;
    status: 'Available' | 'Out of Stock';
}

export interface RentalAgreement {
    id: string;
    clientId: string;
    clientName: string;
    itemId: string;
    itemName: string;
    startDate: string;
    endDate: string;
    dailyRate: number;
    totalCost: number;
    status: 'Active' | 'Returned' | 'Overdue';
}


