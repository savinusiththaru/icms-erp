import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
    try {
        const { name, email, password, role } = await request.json();

        // Basic validation
        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user already exists
        const snapshot = await db.collection('users').where('email', '==', email).get();
        if (!snapshot.empty) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Create new user (In production, password should be hashed!)
        const newUser = {
            name,
            email,
            password, // Storing plain text for demo/prototype purposes as per user environment restrictions.
            role,
            avatar: name.substr(0, 2).toUpperCase(),
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('users').add(newUser);

        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json({ id: docRef.id, ...userWithoutPassword }, { status: 201 });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
