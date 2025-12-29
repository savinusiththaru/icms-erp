import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        const snapshot = await db.collection('quotations').orderBy('createdAt', 'desc').get();
        const quotations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(quotations);
    } catch (error) {
        console.error('Error fetching quotations:', error);
        return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const now = new Date().toISOString();
        const docRef = await db.collection('quotations').add({
            ...json,
            createdAt: now,
            updatedAt: now
        });

        // Log activity
        await db.collection('activities').add({
            type: 'quotation',
            action: 'create',
            description: `Created quotation for ${json.clientName || 'Client'}`,
            timestamp: now,
            createdAt: now
        });
        return NextResponse.json({ id: docRef.id, ...json, createdAt: now, updatedAt: now }, { status: 201 });
    } catch (error) {
        console.error('Error creating quotation:', error);
        return NextResponse.json({ error: 'Failed to create quotation' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const json = await request.json();
        const { id, ...data } = json;
        if (!id) throw new Error('ID is required');

        await db.collection('quotations').doc(id).update({
            ...data,
            updatedAt: new Date().toISOString()
        });

        // Log activity - DISABLED as per user request (Only "Add New" events)
        // await db.collection('activities').add({
        //     type: 'quotation',
        //     action: 'update',
        //     description: `Updated quotation ${id}`,
        //     timestamp: new Date().toISOString(),
        //     createdAt: new Date().toISOString()
        // });

        return NextResponse.json({ id, ...data }, { status: 200 });
    } catch (error) {
        console.error('Error updating quotation:', error);
        return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) throw new Error('ID is required');

        await db.collection('quotations').doc(id).delete();

        // Log activity
        await db.collection('activities').add({
            type: 'quotation',
            action: 'delete',
            description: `Deleted quotation ${id}`,
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error deleting quotation:', error);
        return NextResponse.json({ error: 'Failed to delete quotation' }, { status: 500 });
    }
}
