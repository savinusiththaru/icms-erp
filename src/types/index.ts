export interface Employee {
    id: string;
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
