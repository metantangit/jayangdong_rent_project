// /api/v1/maps/reverse-geocode -> api.sanai.im/v1/maps/reverse-geocode
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { lat, lng } = req.query;
        const response = await fetch(`https://api.sanai.im/v1/maps/reverse-geocode?lat=${lat}&lng=${lng}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
