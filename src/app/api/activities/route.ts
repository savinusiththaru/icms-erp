import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        const snapshot = await db.collection('activities')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();
        
        const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}
