const { saveLead } = require('./_db');

module.exports = async (req, res) => {
    // CORS headers
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
        const fullName = (body.fullName || '').trim();
        const mobile = (body.mobile || '').replace(/[^0-9]/g, '');
        const coupon = (body.coupon || '').trim();
        const ticketId = body.ticketId || ('AURA-' + Math.floor(100000 + Math.random() * 900000));
        const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

        if (!fullName || mobile.length < 10) {
            res.status(400).json({ success: false, error: 'Full name and valid 10-digit mobile number are required.' });
            return;
        }

        const newLead = {
            id: Date.now(),
            ticketId,
            fullName,
            mobile,
            couponCode: coupon,
            prizeWon: null,
            prizeTier: null,
            claimCode: null,
            status: 'Registered',
            createdAt
        };

        await saveLead(newLead);

        res.status(200).json({
            success: true,
            ticketId,
            message: 'Lead registered successfully on Vercel!'
        });
    } catch (err) {
        console.error('Participate API error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
