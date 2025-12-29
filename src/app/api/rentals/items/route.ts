import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        const snapshot = await db.collection('rental_items').orderBy('name', 'asc').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching rental items:', error);
        return NextResponse.json({ error: 'Failed to fetch rental items' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const now = new Date().toISOString();
        const docRef = await db.collection('rental_items').add({
            ...json,
            createdAt: now,
            updatedAt: now
        });

        // Log activity
        await db.collection('activities').add({
            type: 'rental_item',
            action: 'create',
            description: `Added rental item: ${json.name}`,
            timestamp: now,
            createdAt: now
        });

        return NextResponse.json({ id: docRef.id, ...json, createdAt: now, updatedAt: now }, { status: 201 });
    } catch (error) {
        console.error('Error creating rental item:', error);
        return NextResponse.json({ error: 'Failed to create rental item' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) throw new Error('ID is required');

        await db.collection('rental_items').doc(id).delete();
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error deleting rental item:', error);
        return NextResponse.json({ error: 'Failed to delete rental item' }, { status: 500 });
    }
}
