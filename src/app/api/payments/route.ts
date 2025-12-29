import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        const snapshot = await db.collection('payments').orderBy('createdAt', 'desc').get();
        const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const now = new Date().toISOString();

        // Note: 'invoice' relation was included in Prisma. 
        // In Firestore, we should store necessary invoice details here or fetch separately.
        // Assuming client sends necessary data.

        const docRef = await db.collection('payments').add({
            ...json,
            createdAt: now,
            updatedAt: now
        });

        // Simple update to invoice status if invoiceId is present
        if (json.invoiceId) {
            // Optional: Update invoice status logic
            try {
                await db.collection('invoices').doc(json.invoiceId).update({
                    status: 'Paid', // Simplified logic
                    updatedAt: now
                });
            } catch (e) {
                console.warn('Failed to update invoice status', e);
            }
        }

        return NextResponse.json({ id: docRef.id, ...json, createdAt: now, updatedAt: now }, { status: 201 });
    } catch (error) {
        console.error('Error creating payment:', error);
        return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const json = await request.json();
        const { id, ...data } = json;
        if (!id) throw new Error('ID is required');

        await db.collection('payments').doc(id).update({
            ...data,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({ id, ...data }, { status: 200 });
    } catch (error) {
        console.error('Error updating payment:', error);
        return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) throw new Error('ID is required');

        await db.collection('payments').doc(id).delete();
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error deleting payment:', error);
        return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
    }
}
