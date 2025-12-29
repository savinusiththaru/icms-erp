import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        const snapshot = await db.collection('employees').orderBy('createdAt', 'desc').get();
        const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const now = new Date().toISOString();
        const docRef = await db.collection('employees').add({
            ...json,
            createdAt: now,
            updatedAt: now
        });

        // Log activity
        await db.collection('activities').add({
            type: 'employee',
            action: 'create',
            description: `Added employee ${json.firstName || ''} ${json.lastName || ''}`,
            timestamp: now,
            createdAt: now
        });

        return NextResponse.json({ id: docRef.id, ...json, createdAt: now, updatedAt: now }, { status: 201 });
    } catch (error) {
        console.error('Error creating employee:', error);
        return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const json = await request.json();
        const { id, ...data } = json;
        if (!id) throw new Error('ID is required');

        await db.collection('employees').doc(id).update({
            ...data,
            updatedAt: new Date().toISOString()
        });

        // Log activity
        await db.collection('activities').add({
            type: 'employee',
            action: 'update',
            description: `Updated employee ${id}`,
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ id, ...data }, { status: 200 });
    } catch (error) {
        console.error('Error updating employee:', error);
        return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) throw new Error('ID is required');

        await db.collection('employees').doc(id).delete();

        // Log activity
        await db.collection('activities').add({
            type: 'employee',
            action: 'delete',
            description: `Deleted employee ${id}`,
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error deleting employee:', error);
        return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
    }
}
