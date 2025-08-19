// test-blob.js
import { put } from '@vercel/blob';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

async function test() {
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    console.log('Token trouvé:', token ? 'Oui' : 'Non');
    console.log('Début du token:', token ? token.substring(0, 20) + '...' : 'N/A');

    try {
        const blob = await put('test.txt', 'Hello Vercel Blob!', {
            access: 'public',
            token: token
        });
        console.log('✅ Blob créé:', blob.url);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

test();
