/**
 * VERCEL-COMPATIBLE DATABASE & LEADS STORAGE HELPER
 * Works seamlessly on Vercel Serverless Functions with zero external dependencies.
 * Automatically supports:
 * 1. Vercel KV / Upstash Redis (if configured via env vars)
 * 2. External Webhook (e.g. Google Sheets / Make / Zapier)
 * 3. File storage fallback (local database or /tmp on Vercel)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const WEBHOOK_URL = process.env.LEADS_WEBHOOK_URL;

function getLocalFilePath() {
    const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    const localDir = path.join(process.cwd(), 'database');
    if (!isVercel && fs.existsSync(localDir)) {
        return path.join(localDir, 'leads.json');
    }
    return path.join('/tmp', 'aura_leads.json');
}

// Read all leads
async function getAllLeads() {
    // 1. Try Vercel KV / Upstash if configured
    if (KV_URL && KV_TOKEN) {
        try {
            const url = `${KV_URL.replace(/\/$/, '')}/lrange/aura_leads/0/-1`;
            const data = await httpsRequest(url, {
                headers: { Authorization: `Bearer ${KV_TOKEN}` }
            });
            const json = JSON.parse(data);
            if (json && Array.isArray(json.result)) {
                return json.result.map(r => typeof r === 'string' ? JSON.parse(r) : r);
            }
        } catch (e) {
            console.warn('KV read warning, using file fallback:', e.message);
        }
    }

    // 2. Read from local/temp file
    const filePath = getLocalFilePath();
    try {
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(raw || '[]');
        }
    } catch (e) {
        console.warn('File read warning:', e.message);
    }

    return [];
}

// Save a new lead
async function saveLead(lead) {
    // 1. Try Vercel KV / Upstash if configured
    if (KV_URL && KV_TOKEN) {
        try {
            const url = `${KV_URL.replace(/\/$/, '')}/lpush/aura_leads`;
            await httpsRequest(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${KV_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(lead)
            });
        } catch (e) {
            console.warn('KV save warning:', e.message);
        }
    }

    // 2. Forward to Webhook / Google Sheets if configured
    if (WEBHOOK_URL) {
        try {
            postToWebhook(WEBHOOK_URL, lead);
        } catch (e) {
            console.warn('Webhook post warning:', e.message);
        }
    }

    // 3. Save to local/temp file
    const filePath = getLocalFilePath();
    try {
        let leads = [];
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf8');
            leads = JSON.parse(raw || '[]');
        }
        leads.unshift(lead);
        fs.writeFileSync(filePath, JSON.stringify(leads, null, 2), 'utf8');
    } catch (e) {
        console.warn('File write error:', e.message);
    }

    return lead;
}

// Update lead with won prize
async function updateLeadPrize(ticketId, prizeName, prizeTier, claimCode) {
    const leads = await getAllLeads();
    const lead = leads.find(l => l.ticketId === ticketId);
    if (lead) {
        lead.prizeWon = prizeName;
        lead.prizeTier = prizeTier;
        lead.claimCode = claimCode;
        lead.status = 'Prize Won';
        lead.wonAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

        // Update KV if configured
        if (KV_URL && KV_TOKEN) {
            try {
                const url = `${KV_URL.replace(/\/$/, '')}/set/lead_${ticketId}`;
                await httpsRequest(url, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${KV_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(lead)
                });
            } catch (e) {}
        }

        // Update local file
        const filePath = getLocalFilePath();
        try {
            fs.writeFileSync(filePath, JSON.stringify(leads, null, 2), 'utf8');
        } catch (e) {}

        // Notify webhook of win
        if (WEBHOOK_URL) {
            try {
                postToWebhook(WEBHOOK_URL, { event: 'prize_won', ...lead });
            } catch (e) {}
        }
    }
    return lead;
}

function httpsRequest(targetUrl, options = {}) {
    return new Promise((resolve, reject) => {
        const u = new URL(targetUrl);
        const reqLib = u.protocol === 'http:' ? http : https;
        const req = reqLib.request(targetUrl, {
            method: options.method || 'GET',
            headers: options.headers || {}
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

function postToWebhook(url, payload) {
    try {
        const u = new URL(url);
        const reqLib = u.protocol === 'http:' ? http : https;
        const postData = JSON.stringify(payload);
        const req = reqLib.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        });
        req.on('error', () => {});
        req.write(postData);
        req.end();
    } catch (e) {}
}

module.exports = {
    getAllLeads,
    saveLead,
    updateLeadPrize
};
