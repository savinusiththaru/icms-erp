import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        const snapshot = await db.collection('invoices').orderBy('createdAt', 'desc').get();
        const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const now = new Date().toISOString();

        // Save items within the invoice document or use a subcollection if needed. 
        // For simplicity and matching typical JSON usage, storing as array in doc.
        const docRef = await db.collection('invoices').add({
            ...json,
            createdAt: now,
            updatedAt: now
        });

        // Log activity
        await db.collection('activities').add({
            type: 'invoice',
            action: 'create',
            description: `Created invoice for ${json.clientName || 'Client'}`,
            timestamp: now,
            createdAt: now
        });

        return NextResponse.json({ id: docRef.id, ...json, createdAt: now, updatedAt: now }, { status: 201 });
    } catch (error) {
        console.error('Error creating invoice:', error);
        return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const json = await request.json();
        const { id, activityDescription, ...data } = json;
        if (!id) throw new Error('ID is required');

        await db.collection('invoices').doc(id).update({
            ...data,
            updatedAt: new Date().toISOString()
        });

        // Log activity (with deduplication) - ONLY if explicit description provided (Report Status)
        // Generic updates are ignored to prevent spam.
        if (activityDescription) {
            const description = activityDescription;
            const recentLogs = await db.collection('activities')
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            let isDuplicate = false;
            if (!recentLogs.empty) {
                const lastLog = recentLogs.docs[0].data();
                const timeDiff = new Date().getTime() - new Date(lastLog.createdAt).getTime();
                if (lastLog.description === description && timeDiff < 5000) {
                    isDuplicate = true;
                }
            }

            if (!isDuplicate) {
                await db.collection('activities').add({
                    type: 'invoice',
                    action: 'update',
                    description,
                    timestamp: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                });
            }
        }

        return NextResponse.json({ id, ...data }, { status: 200 });
    } catch (error) {
        console.error('Error updating invoice:', error);
        return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) throw new Error('ID is required');

        await db.collection('invoices').doc(id).delete();

        // Log activity
        await db.collection('activities').add({
            type: 'invoice',
            action: 'delete',
            description: `Deleted invoice ${id}`,
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
    }
}
