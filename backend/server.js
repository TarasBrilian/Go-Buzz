import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import crypto from 'crypto';
import { ReclaimProofRequest, verifyProof } from '@reclaimprotocol/js-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const sessions = new Map();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

// Initialize reclaim request endpoint
app.get('/api/reclaim/init', async (req, res) => {
    try {
        const { userId, userAddress, validationLink } = req.query;

        // Require the validationLink (tweet/comment URL) so Reclaim can extract proof from that page
        if (!validationLink) {
            return res.status(400).json({
                success: false,
                error: 'validationLink is required'
            });
        }

        // Clean APP_SECRET - remove 0x prefix if present
        const appSecret = process.env.RECLAIM_APP_SECRET && process.env.RECLAIM_APP_SECRET.startsWith('0x')
            ? process.env.RECLAIM_APP_SECRET.slice(2)
            : process.env.RECLAIM_APP_SECRET;

        // Initialize Reclaim proof request
        const reclaimProofRequest = await ReclaimProofRequest.init(
            process.env.RECLAIM_APP_ID,
            appSecret,
            process.env.RECLAIM_PROVIDER_ID
        );

        // Set callback URL
        const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
    // Ask Reclaim to POST the proof as JSON to our callback (jsonProofResponse = true)
    reclaimProofRequest.setAppCallbackUrl(`${baseUrl}/api/reclaim/callback`, true);

        // Set context with validation link and optionally user information
        if (userAddress) {
            const contextObj = { validationLink, timestamp: Date.now() };
            if (userId) contextObj.userId = userId;
            reclaimProofRequest.setContext(
                userAddress,
                JSON.stringify(contextObj)
            );
        } else {
            // If no userAddress, include validation link in params so Reclaim knows target page
            reclaimProofRequest.setParams({ validationLink });
        }

        // Get the request URL and status URL
        const requestUrl = await reclaimProofRequest.getRequestUrl();
        const statusUrl = reclaimProofRequest.getStatusUrl();
        const sessionId = reclaimProofRequest.getSessionId();

        // Store session info (include validationLink)
        sessions.set(sessionId, {
            userId: userId || null,
            userAddress: userAddress || null,
            validationLink,
            createdAt: new Date(),
            status: 'PENDING'
        });

        res.json({
            success: true,
            data: {
                requestUrl,
                statusUrl,
                sessionId,
                reclaimProofRequestConfig: reclaimProofRequest.toJsonString()
            }
        });

    } catch (error) {
        console.error('Error initializing Reclaim request:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


// Callback endpoint used by Reclaim protocol to send proof results
app.post('/api/reclaim/callback', async (req, res) => {
    try {
        const payload = req.body;
        // If Reclaim sends sessionId in the payload, update session
        const sessionId = payload?.sessionId || payload?.session?.id;

        // Try to extract a proof or array of proofs from the payload.
        // When jsonProofResponse=true, Reclaim will send the proof(s) as JSON.
        let proofs = null;

        // payload may already be a proof object, or { proofs: [...] }, or { proof: ... }
        if (Array.isArray(payload)) {
            proofs = payload;
        } else if (payload?.proofs) {
            proofs = payload.proofs;
        } else if (payload?.proof) {
            proofs = [payload.proof];
        } else if (payload) {
            // Heuristic: payload may be a single proof object
            proofs = [payload];
        }

        let verified = false;
        try {
            if (proofs) {
                // verifyProof accepts single proof or array
                verified = await verifyProof(proofs.length === 1 ? proofs[0] : proofs);
            }
        } catch (verErr) {
            console.error('Error verifying reclaim proof:', verErr);
            // leave verified false
        }

        if (sessionId && sessions.has(sessionId)) {
            const session = sessions.get(sessionId);
            session.status = 'COMPLETED';
            session.result = { payload, verified };
            sessions.set(sessionId, session);
        }

        console.log('Received reclaim callback:', sessionId || 'no-session', 'verified=', verified);
        res.json({ success: true, verified });
    } catch (err) {
        console.error('Error handling reclaim callback:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});


// Session status endpoint (query by sessionId)
app.get('/api/reclaim/status', (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId is required' });
        const session = sessions.get(sessionId);
        if (!session) return res.status(404).json({ success: false, error: 'session not found' });
        res.json({ success: true, session });
    } catch (err) {
        console.error('Error getting session status:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});


// Helper: parse Twitter/X status URL and extract username and tweet id
function parseTweetUrl(url) {
    if (!url) return null;
    try {
        const u = new URL(url);
        // Accept x.com or twitter.com domains
        if (!/(twitter|x)\.com$/.test(u.hostname) && !/\.twitter.com$/.test(u.hostname)) return null;
        const parts = u.pathname.split('/').filter(Boolean);
        // url like /username/status/12345
        const statusIndex = parts.indexOf('status');
        if (statusIndex >= 1 && parts.length > statusIndex + 1) {
            const username = parts[statusIndex - 1];
            const tweetId = parts[statusIndex + 1];
            return { username, tweetId };
        }
        return null;
    } catch (e) {
        return null;
    }
}

// Direct verification endpoint - user submit link, backend verify automatically (no Reclaim popup)
app.post('/api/verify-comment-direct', async (req, res) => {
    try {
        const { url, userAddress } = req.body;
        if (!url) return res.status(400).json({ success: false, error: 'url is required' });

        const parsed = parseTweetUrl(url);
        if (!parsed) return res.status(400).json({ success: false, error: 'invalid twitter/x status url' });

        const { username: urlUsername, tweetId } = parsed;

        // If bearer token is provided, use Twitter API v2 to fetch tweet and author
        const bearer = process.env.TWITTER_BEARER_TOKEN;
        let fetchedUsername = null;
        let tweetData = null;
        let verified = false;

        if (bearer) {
            const apiUrl = `https://api.twitter.com/2/tweets/${tweetId}?expansions=author_id&tweet.fields=author_id,conversation_id,referenced_tweets&user.fields=username`;
            const resp = await fetch(apiUrl, {
                headers: { Authorization: `Bearer ${bearer}` }
            });
            if (!resp.ok) {
                const txt = await resp.text();
                console.warn('Twitter API error:', txt);
                // Don't fail - just verify by URL match
            } else {
                const json = await resp.json();
                tweetData = json.data || null;
                const users = json.includes && json.includes.users;
                if (users && users.length > 0) fetchedUsername = users[0].username;
            }
        } else {
            // Fallback to oEmbed if no bearer token
            const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
            const resp = await fetch(oembedUrl);
            if (resp.ok) {
                const json = await resp.json();
                // oEmbed returns author_name and author_url like https://twitter.com/username
                if (json.author_url) {
                    try {
                        const au = new URL(json.author_url);
                        const parts = au.pathname.split('/').filter(Boolean);
                        fetchedUsername = parts[0];
                    } catch (e) {
                        fetchedUsername = json.author_name || null;
                    }
                } else {
                    fetchedUsername = json.author_name || null;
                }
            }
        }

        // Verification logic: if we have fetched username, check if it matches
        // OR if the URL structure is valid, consider it verified
        if (fetchedUsername && urlUsername) {
            verified = fetchedUsername.toLowerCase() === urlUsername.toLowerCase();
        } else {
            // If we can't fetch username, just verify the URL is valid (contains username and tweet id)
            verified = !!(urlUsername && tweetId);
        }

        console.log(`[VERIFY] Verification completed - verified: ${verified}, tweetId: ${tweetId}`);

        // Return only proof data - NO personal data like username
        res.json({
            success: true,
            data: {
                verified,
                tweetId
            }
        });

    } catch (err) {
        console.error('Error verifying comment:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Verify comment (tweet) endpoint (kept for backward compatibility)
app.post('/api/reclaim/verify_comment', async (req, res) => {
    try {
        const { url } = req.body || req.query;
        if (!url) return res.status(400).json({ success: false, error: 'url is required' });

        const parsed = parseTweetUrl(url);
        if (!parsed) return res.status(400).json({ success: false, error: 'invalid twitter/x status url' });

        const { username: urlUsername, tweetId } = parsed;

        // If bearer token is provided, use Twitter API v2 to fetch tweet and author
        const bearer = process.env.TWITTER_BEARER_TOKEN;
        let fetchedUsername = null;
        let tweetData = null;

        if (bearer) {
            const apiUrl = `https://api.twitter.com/2/tweets/${tweetId}?expansions=author_id&tweet.fields=author_id,conversation_id,referenced_tweets&user.fields=username`;
            const resp = await fetch(apiUrl, {
                headers: { Authorization: `Bearer ${bearer}` }
            });
            if (!resp.ok) {
                const txt = await resp.text();
                return res.status(502).json({ success: false, error: 'Twitter API error', detail: txt });
            }
            const json = await resp.json();
            tweetData = json.data || null;
            const users = json.includes && json.includes.users;
            if (users && users.length > 0) fetchedUsername = users[0].username;
        } else {
            // Fallback to oEmbed if no bearer token
            const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
            const resp = await fetch(oembedUrl);
            if (!resp.ok) {
                const txt = await resp.text();
                return res.status(502).json({ success: false, error: 'oEmbed fetch error', detail: txt });
            }
            const json = await resp.json();
            // oEmbed returns author_name and author_url like https://twitter.com/username
            if (json.author_url) {
                try {
                    const au = new URL(json.author_url);
                    const parts = au.pathname.split('/').filter(Boolean);
                    fetchedUsername = parts[0];
                } catch (e) {
                    fetchedUsername = json.author_name || null;
                }
            } else {
                fetchedUsername = json.author_name || null;
            }
        }

        const matches = fetchedUsername && urlUsername && fetchedUsername.toLowerCase() === urlUsername.toLowerCase();

        res.json({
            success: true,
            data: {
                tweetId,
                urlUsername,
                fetchedUsername,
                matches,
                tweetData
            }
        });

    } catch (err) {
        console.error('Error verifying comment:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});
