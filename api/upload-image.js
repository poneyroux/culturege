import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'fs';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.local' });
}

export default async function handler(req, res) {
    console.log('=== API UPLOAD-IMAGE START ===');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        console.log('OPTIONS handled');
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        console.log('Wrong method');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
        const filename = searchParams.get('filename');

        if (!filename) {
            return res.status(400).json({ error: 'Filename required' });
        }

        if (!filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            return res.status(400).json({ error: 'Invalid image type' });
        }

        console.log('Parsing FormData with formidable...');

        // ✅ SOLUTION : Utiliser formidable pour parser FormData
        const form = formidable({ multiples: false });
        const [fields, files] = await form.parse(req);

        console.log('Files parsed:', Object.keys(files));

        const file = files.file?.[0];
        if (!file) {
            console.log('No file found in FormData');
            return res.status(400).json({ error: 'No file found' });
        }

        console.log('File info:', {
            name: file.originalFilename,
            size: file.size,
            type: file.mimetype,
            path: file.filepath
        });

        // Lire le fichier depuis le chemin temporaire
        const fileBuffer = await fs.promises.readFile(file.filepath);
        console.log('File buffer created, size:', fileBuffer.length);

        console.log('Starting Vercel Blob upload...');

        const blob = await put(`images/${filename}`, fileBuffer, {
            access: 'public',
            addRandomSuffix: true,
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        console.log('✅ Blob upload successful:', blob.url);

        return res.status(200).json({
            url: blob.url,
            filename: blob.pathname.split('/').pop(),
            success: true
        });
    } catch (error) {
        console.error('❌ API Upload Error:', error);
        return res.status(500).json({
            error: 'Upload failed',
            details: error.message
        });
    }
}

export const config = {
    api: {
        bodyParser: false, // Nécessaire pour formidable
    },
};
