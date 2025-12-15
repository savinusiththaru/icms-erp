import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Mock single document ID for global settings
const SETTINGS_ID = 'global_settings';

export async function GET() {
    try {
        const doc = await db.collection('settings').doc(SETTINGS_ID).get();
        if (!doc.exists) {
            // Return defaults if no settings saved yet
            return NextResponse.json({
                companyName: 'Compliance Corp',
                address: '123 Business Rd, Tech City',
                contactEmail: 'admin@compliance-corp.com',
                currency: 'USD'
            });
        }
        return NextResponse.json(doc.data());
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validation could go here

        await db.collection('settings').doc(SETTINGS_ID).set(data, { merge: true });

        return NextResponse.json({ success: true, ...data });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
