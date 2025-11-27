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

app.get('/api/reclaim/init', async (req, res) => {
    try {
        const { userId, userAddress } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        // Clean APP_SECRET - remove 0x prefix if present
        const appSecret = process.env.RECLAIM_APP_SECRET.startsWith('0x')
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
        reclaimProofRequest.setAppCallbackUrl(`${baseUrl}/api/reclaim/callback`);

        // Set context with user information
        if (userAddress) {
            reclaimProofRequest.setContext(
                userAddress,
                JSON.stringify({ userId, timestamp: Date.now() })
            );
        }

        // Get the request URL and status URL
        const requestUrl = await reclaimProofRequest.getRequestUrl();
        const statusUrl = reclaimProofRequest.getStatusUrl();
        const sessionId = reclaimProofRequest.getSessionId();

        // Store session info
        sessions.set(sessionId, {
            userId,
            userAddress,
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