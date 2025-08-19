import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'fs';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.local' });
}

export default async function handler(req, res) {
    console.log('=== API UPLOAD-POWERPOINT START ===');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
        const filename = searchParams.get('filename');

        if (!filename) {
            return res.status(400).json({ error: 'Filename required' });
        }

        // ✅ Validation des types PowerPoint
        if (!filename.match(/\.(ppt|pptx|pdf)$/i)) {
            return res.status(400).json({ error: 'Invalid PowerPoint type' });
        }

        console.log('Parsing FormData with formidable...');

        // ✅ MÊME SOLUTION : formidable
        const form = formidable({
            multiples: false,
            maxFileSize: 50 * 1024 * 1024 // 50MB max pour PowerPoint
        });
        const [fields, files] = await form.parse(req);

        const file = files.file?.[0];
        if (!file) {
            return res.status(400).json({ error: 'No file found' });
        }

        console.log('PowerPoint file info:', {
            name: file.originalFilename,
            size: file.size,
            type: file.mimetype
        });

        // Lire le fichier
        const fileBuffer = await fs.promises.readFile(file.filepath);
        console.log('PowerPoint buffer created, size:', fileBuffer.length);

        console.log('Starting Vercel Blob upload...');

        const blob = await put(`powerpoint/${filename}`, fileBuffer, {
            access: 'public',
            addRandomSuffix: true,
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        console.log('✅ PowerPoint upload successful:', blob.url);

        return res.status(200).json({
            url: blob.url,
            filename: blob.pathname.split('/').pop(),
            success: true
        });
    } catch (error) {
        console.error('❌ PowerPoint Upload Error:', error);
        return res.status(500).json({
            error: 'Upload failed',
            details: error.message
        });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
