const { updateLeadPrize } = require('./_db');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ success: false, error: 'Method not allowed' });
        return;
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const ticketId = body.ticketId;
        const prizeName = body.prizeName || 'Official Campaign Reward';
        const prizeTier = body.prizeTier || 'reward';
        const claimCode = body.claimCode || ('WIN-' + Math.floor(1000 + Math.random() * 9000));

        if (!ticketId) {
            res.status(400).json({ success: false, error: 'ticketId is required' });
            return;
        }

        await updateLeadPrize(ticketId, prizeName, prizeTier, claimCode);

        res.status(200).json({
            success: true,
            message: 'Prize record updated successfully on Vercel!'
        });
    } catch (err) {
        console.error('Record Win API error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
