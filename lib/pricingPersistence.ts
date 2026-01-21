import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';
import { PricingConfig, defaultPricing } from './pricing';

const PRICING_FILE_PATH = path.join(process.cwd(), 'data', 'pricing-config.json');
const KV_KEY = 'pricing-config';

export async function getPricingConfig(): Promise<PricingConfig> {
    // 1. Try Vercel KV first (Production)
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
            const config = await kv.get<PricingConfig>(KV_KEY);
            if (config) return config;
        } catch (error) {
            console.error('Failed to fetch from Vercel KV:', error);
        }
    }

    // 2. Fallback to Local Filesystem (Local Dev)
    try {
        if (fs.existsSync(PRICING_FILE_PATH)) {
            const fileContents = fs.readFileSync(PRICING_FILE_PATH, 'utf8');
            return JSON.parse(fileContents);
        }
    } catch (error) {
        console.error('Failed to read from local filesystem:', error);
    }

    // 3. Absolute Fallback to hardcoded defaults
    return defaultPricing;
}

export async function savePricingConfig(config: PricingConfig): Promise<{ success: boolean; error?: string }> {
    // 1. Save to Vercel KV (Production)
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
            await kv.set(KV_KEY, config);
            return { success: true };
        } catch (error: any) {
            console.error('Failed to save to Vercel KV:', error);
            return { success: false, error: 'Failed to save to Database: ' + error.message };
        }
    }

    // 2. Save to Local Filesystem (Local Dev)
    try {
        const dataDir = path.dirname(PRICING_FILE_PATH);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(PRICING_FILE_PATH, JSON.stringify(config, null, 2), 'utf8');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to save to local filesystem:', error);
        // If we're on Vercel but KV is not configured, show specific error
        if (process.env.VERCEL) {
            return {
                success: false,
                error: "Vercel is 'Read-Only'. Please connect a Vercel KV Database. See VERCEL_SETUP.md for instructions."
            };
        }
        return { success: false, error: 'Internal Server Error: ' + error.message };
    }
}
