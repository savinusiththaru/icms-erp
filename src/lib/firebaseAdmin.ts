import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    if (process.env.FIREBASE_PROJECT_ID) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } else {
        console.error('FIREBASE_PROJECT_ID is missing. Firebase Admin SDK not initialized.');
    }
}

// Mock DB for development when credentials are missing
class MockFirestore {
    private data: Record<string, any[]> = {};

    collection(name: string) {
        if (!this.data[name]) this.data[name] = [];
        const getDocs = async (filteredData: any[]) => ({
            docs: filteredData.map(d => ({ id: d.id, data: () => d })),
            empty: filteredData.length === 0
        });

        return {
            // Basic get for all docs
            get: async () => getDocs(this.data[name]),

            // Where query support
            where: (field: string, op: string, value: any) => ({
                get: async () => {
                    const filtered = this.data[name].filter(d => d[field] === value);
                    return getDocs(filtered);
                }
            }),

            orderBy: () => ({
                limit: (n: number) => ({
                    get: async () => {
                        const docs = this.data[name].slice(0, n);
                        return getDocs(docs);
                    }
                }),
                get: async () => getDocs(this.data[name])
            }),
            add: async (doc: any) => {
                const id = Math.random().toString(36).substring(7);
                const newDoc = { id, ...doc };
                this.data[name].unshift(newDoc); // Add to beginning (mock desc sort)
                return { id };
            },
            doc: (id: string) => ({
                update: async (updates: any) => {
                    const doc = this.data[name].find(d => d.id === id);
                    if (doc) Object.assign(doc, updates);
                },
                set: async (data: any, options?: { merge: boolean }) => {
                    console.log(`[MockFirestore] SET ${name}/${id}`, data);
                    const existingDoc = this.data[name].find(d => d.id === id);
                    if (existingDoc && options?.merge) {
                        Object.assign(existingDoc, data);
                    } else if (existingDoc) {
                        // Overwrite if no merge
                        const index = this.data[name].indexOf(existingDoc);
                        this.data[name][index] = { id, ...data };
                    } else {
                        // Create new
                        this.data[name].push({ id, ...data });
                    }
                },
                delete: async () => {
                    const index = this.data[name].findIndex(d => d.id === id);
                    if (index > -1) this.data[name].splice(index, 1);
                },
                get: async () => {
                    const doc = this.data[name].find(d => d.id === id);
                    return {
                        exists: !!doc,
                        data: () => doc,
                        id
                    };
                }
            })
        };
    }
}

const db = new Proxy({}, {
    get: (target, prop) => {
        if (admin.apps.length > 0) {
            return (admin.firestore() as any)[prop];
        }
        // Fallback to Mock DB with warning
        console.warn('⚠️ USING MOCK DB: Firebase credentials missing. Data will NOT be saved to Firebase.');
        if (!(global as any).mockDb_v4) {
            (global as any).mockDb_v4 = new MockFirestore();
        }
        return ((global as any).mockDb_v4 as any)[prop];
    }
}) as admin.firestore.Firestore;

export { db };
