import { list } from '@vercel/blob';
import dotenv from 'dotenv';

// Charger les variables d'environnement en développement
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.local' });
}

export default async function handler(req, res) {
    console.log('Get-media API called');
    console.log('Token present:', !!process.env.BLOB_READ_WRITE_TOKEN); // Debug

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Lister toutes les images avec le token explicite
        const { blobs } = await list({
            prefix: 'images/',
            limit: 100,
            token: process.env.BLOB_READ_WRITE_TOKEN // ← Passage explicite du token
        });

        const images = blobs.map(blob => ({
            url: blob.url,
            filename: blob.pathname.split('/').pop(),
            uploadedAt: blob.uploadedAt,
            size: blob.size,
        }));

        return res.status(200).json({ images, success: true });
    } catch (error) {
        console.error('List error:', error);
        return res.status(500).json({
            error: 'Failed to list media',
            details: error.message
        });
    }
}
