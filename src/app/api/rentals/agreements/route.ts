import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        const snapshot = await db.collection('rental_agreements').orderBy('startDate', 'desc').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching rental agreements:', error);
        return NextResponse.json({ error: 'Failed to fetch rental agreements' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const now = new Date().toISOString();

        // Save agreement
        const docRef = await db.collection('rental_agreements').add({
            ...json,
            status: 'Active',
            createdAt: now,
            updatedAt: now
        });

        // Ideally, we decrease quantity of the item here, but for mock DB simple implementation we skip complex transactions for now.
        // Or update item status if qty 1. Let's assume quantity management is manual or simplified.

        // Log activity
        await db.collection('activities').add({
            type: 'rental_agreement',
            action: 'create',
            description: `New rental agreement for ${json.clientName}: ${json.itemName}`,
            timestamp: now,
            createdAt: now
        });

        return NextResponse.json({ id: docRef.id, ...json, createdAt: now, updatedAt: now }, { status: 201 });
    } catch (error) {
        console.error('Error creating rental agreement:', error);
        return NextResponse.json({ error: 'Failed to create rental agreement' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const json = await request.json();
        const { id, ...updateData } = json;
        if (!id) throw new Error('ID is required');

        const now = new Date().toISOString();
        await db.collection('rental_agreements').doc(id).update({
            ...updateData,
            updatedAt: now
        });

        return NextResponse.json({ success: true, id }, { status: 200 });
    } catch (error) {
        console.error('Error updating rental agreement:', error);
        return NextResponse.json({ error: 'Failed to update rental agreement' }, { status: 500 });
    }
}
