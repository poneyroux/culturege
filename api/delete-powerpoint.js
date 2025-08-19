import { del } from '@vercel/blob';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.local' });
}

export default async function handler(req, res) {
    console.log('=== API DELETE-POWERPOINT START ===');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
        const url = searchParams.get('url');

        if (!url) {
            return res.status(400).json({ error: 'URL required' });
        }

        console.log('Deleting PowerPoint from Vercel Blob:', url);

        // ✅ Supprimer le fichier avec la fonction del de Vercel Blob
        await del(url, {
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        console.log('✅ PowerPoint deleted successfully');

        return res.status(200).json({
            success: true,
            message: 'PowerPoint deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete PowerPoint Error:', error);
        return res.status(500).json({
            error: 'Delete failed',
            details: error.message
        });
    }
}
