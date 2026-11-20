const http = require('http');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const PORT = 3000;
const PUBLIC_DIR = __dirname;
const DB_FILE = path.join(__dirname, 'database', 'lucky_draw.sqlite');
const LEADS_BACKUP_FILE = path.join(__dirname, 'database', 'leads.json');

// 1. Initialize SQLite Database
let db = null;
try {
    db = new DatabaseSync(DB_FILE);
    // Ensure campaign_leads table exists
    db.exec(`
        CREATE TABLE IF NOT EXISTS campaign_leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            coupon_code TEXT,
            ticket_id TEXT UNIQUE,
            prize_won TEXT,
            prize_tier TEXT,
            claim_code TEXT,
            status TEXT DEFAULT 'Registered',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('SQLite database initialized & campaign_leads table ready.');
} catch (e) {
    console.error('SQLite initialization notice:', e.message);
}

// 2. MIME Types
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

// Helper: Read JSON Body
function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 1e6) {
                req.destroy();
                reject(new Error('Payload too large'));
            }
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

// Helper: Save Lead to JSON file as reliable redundancy
function backupLeadToJson(lead) {
    try {
        let leads = [];
        if (fs.existsSync(LEADS_BACKUP_FILE)) {
            const raw = fs.readFileSync(LEADS_BACKUP_FILE, 'utf8');
            leads = JSON.parse(raw || '[]');
        }
        leads.unshift(lead);
        fs.writeFileSync(LEADS_BACKUP_FILE, JSON.stringify(leads, null, 2), 'utf8');
    } catch (e) {
        console.error('Backup JSON error:', e.message);
    }
}

// 3. HTTP Server
const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    // CORS headers for local/cross-origin testing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- API ROUTES ---

    // 1. POST /api/participate -> Capture new lead
    if (pathname === '/api/participate' && method === 'POST') {
        try {
            const data = await parseJsonBody(req);
            const fullName = (data.fullName || '').trim();
            const mobile = (data.mobile || '').replace(/[^0-9]/g, '');
            const coupon = (data.coupon || '').trim();
            const ticketId = data.ticketId || ('AURA-' + Math.floor(100000 + Math.random() * 900000));
            const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

            if (!fullName || mobile.length < 10) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Full name and 10-digit mobile number are required.' }));
                return;
            }

            if (db) {
                // Save to campaign_leads
                const insertLead = db.prepare(`
                    INSERT INTO campaign_leads (full_name, mobile, coupon_code, ticket_id, status, created_at)
                    VALUES (?, ?, ?, ?, 'Registered', ?)
                `);
                insertLead.run(fullName, mobile, coupon, ticketId, createdAt);

                // Also populate coupons table so original admin sees it
                try {
                    const maxCouponRow = db.prepare('SELECT COALESCE(MAX(coupon_number), 357) as max_c FROM coupons').get();
                    const nextCouponNum = (maxCouponRow.max_c || 357) + 1;
                    const insertCoupon = db.prepare(`
                        INSERT INTO coupons (coupon_number, customer_name, mobile, status, created_at)
                        VALUES (?, ?, ?, 'eligible', ?)
                    `);
                    insertCoupon.run(nextCouponNum, fullName, mobile, createdAt);
                } catch (ce) {
                    console.warn('Coupon sync warning:', ce.message);
                }
            }

            // Backup to leads.json
            backupLeadToJson({
                ticketId,
                fullName,
                mobile,
                coupon,
                prizeWon: null,
                prizeTier: null,
                claimCode: null,
                status: 'Registered',
                createdAt
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, ticketId, message: 'Lead recorded successfully in database!' }));
        } catch (err) {
            console.error('Error recording lead:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // 2. POST /api/record-win -> Update lead with prize won
    if (pathname === '/api/record-win' && method === 'POST') {
        try {
            const data = await parseJsonBody(req);
            const ticketId = data.ticketId;
            const prizeName = data.prizeName || 'Official Campaign Reward';
            const prizeTier = data.prizeTier || 'reward';
            const claimCode = data.claimCode || ('WIN-' + Math.floor(1000 + Math.random() * 9000));
            const wonAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

            if (db && ticketId) {
                // Update campaign_leads
                const updateLead = db.prepare(`
                    UPDATE campaign_leads
                    SET prize_won = ?, prize_tier = ?, claim_code = ?, status = 'Prize Won'
                    WHERE ticket_id = ?
                `);
                updateLead.run(prizeName, prizeTier, claimCode, ticketId);

                // Fetch lead details to insert into winners table
                try {
                    const lead = db.prepare('SELECT * FROM campaign_leads WHERE ticket_id = ?').get(ticketId);
                    if (lead) {
                        const insertWinner = db.prepare(`
                            INSERT INTO winners (coupon_number, customer_name, mobile, prize_name, prize_type, won_at)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `);
                        insertWinner.run(lead.id || 999, lead.full_name, lead.mobile, prizeName, prizeTier, wonAt);
                    }
                } catch (we) {
                    console.warn('Winner table sync warning:', we.message);
                }
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Prize result recorded!' }));
        } catch (err) {
            console.error('Error recording win:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // 3. GET /api/admin/leads -> Fetch all leads for Admin Panel
    if (pathname === '/api/admin/leads' && method === 'GET') {
        try {
            let leads = [];
            if (db) {
                leads = db.prepare(`
                    SELECT 
                        id, 
                        full_name as fullName, 
                        mobile, 
                        coupon_code as couponCode, 
                        ticket_id as ticketId, 
                        prize_won as prizeWon, 
                        prize_tier as prizeTier, 
                        claim_code as claimCode, 
                        status, 
                        created_at as createdAt 
                    FROM campaign_leads 
                    ORDER BY id DESC
                `).all();
            }

            // If empty, check leads.json backup or coupons table
            if (leads.length === 0 && fs.existsSync(LEADS_BACKUP_FILE)) {
                try {
                    leads = JSON.parse(fs.readFileSync(LEADS_BACKUP_FILE, 'utf8') || '[]');
                } catch (e) {}
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                count: leads.length,
                leads: leads
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // 4. GET /api/admin/export-csv -> Download leads CSV
    if (pathname === '/api/admin/export-csv' && method === 'GET') {
        try {
            let leads = [];
            if (db) {
                leads = db.prepare(`
                    SELECT id, full_name, mobile, coupon_code, ticket_id, prize_won, claim_code, status, created_at 
                    FROM campaign_leads 
                    ORDER BY id DESC
                `).all();
            }

            let csv = 'ID,Full Name,Mobile Number,Coupon Code,Ticket ID,Prize Won,Claim Code,Status,Registration Date\n';
            leads.forEach(l => {
                const clean = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
                csv += [
                    clean(l.id),
                    clean(l.full_name),
                    clean(l.mobile),
                    clean(l.coupon_code),
                    clean(l.ticket_id),
                    clean(l.prize_won || 'Pending Spin'),
                    clean(l.claim_code || '-'),
                    clean(l.status || 'Registered'),
                    clean(l.created_at)
                ].join(',') + '\n';
            });

            res.writeHead(200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="aura_campaign_leads.csv"'
            });
            res.end(csv);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error generating CSV');
        }
        return;
    }

    // --- STATIC FILES & ADMIN PORTAL ROUTING ---

    let reqUrl = pathname;
    if (reqUrl === '/') {
        reqUrl = '/index.html';
    } else if (reqUrl === '/admin' || reqUrl === '/admin/') {
        reqUrl = '/admin/index.html';
    }

    const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(PUBLIC_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`✨ AURA 2026 Lucky Draw Campaign Server Running`);
    console.log(`👉 Public Website:  http://localhost:${PORT}/`);
    console.log(`🔐 Admin Panel:     http://localhost:${PORT}/admin`);
    console.log(`💾 Database:        ${DB_FILE}`);
    console.log(`======================================================\n`);
});
