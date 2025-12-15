import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // Find user by email
        const snapshot = await db.collection('users').where('email', '==', email).get();

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const doc = snapshot.docs[0];
        const user = doc.data();

        // Verify password (In production, use bcrypt.compare)
        if (user.password !== password) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Return user info
        return NextResponse.json({
            id: doc.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        }, { status: 200 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
