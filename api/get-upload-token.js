import { generateUploadUrl } from '@vercel/blob/client';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { filename } = req.body;

        // ✅ Générer une URL d'upload direct
        const { url, token } = await generateUploadUrl(`powerpoint/${filename}`, {
            access: 'public',
            addRandomSuffix: true,
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        return res.json({ url, token });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
