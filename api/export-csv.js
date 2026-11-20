const { getAllLeads } = require('./_db');

module.exports = async (req, res) => {
    try {
        const leads = await getAllLeads();

        let csv = 'ID,Full Name,Mobile Number,Coupon Code,Ticket ID,Prize Won,Claim Code,Status,Registration Date\n';
        leads.forEach(l => {
            const clean = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
            csv += [
                clean(l.id),
                clean(l.fullName),
                clean(l.mobile),
                clean(l.couponCode),
                clean(l.ticketId),
                clean(l.prizeWon || 'Pending Spin'),
                clean(l.claimCode || '-'),
                clean(l.status || 'Registered'),
                clean(l.createdAt || l.wonAt || '-')
            ].join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="aura_campaign_leads.csv"');
        res.status(200).send(csv);
    } catch (err) {
        console.error('Export CSV error:', err);
        res.status(500).send('Error generating CSV');
    }
};
