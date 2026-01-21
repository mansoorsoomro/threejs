import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { PricingConfig, defaultPricing } from './pricing';

const PRICING_FILE_PATH = path.join(process.cwd(), 'data', 'pricing-config.json');
const MONGODB_URI =
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL ||
    process.env.DATABASE_URL ||
    process.env.STORAGE_MONGODB_URI ||
    process.env.STORAGE_MONGODB_URI_URL ||
    process.env.STORAGE_URL;
const DB_NAME = 'building-designer';
const COLLECTION_NAME = 'pricing';

let client: MongoClient | null = null;

async function getMongoClient() {
    if (!MONGODB_URI) return null;
    if (!client) {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
    }
    return client;
}

export async function getPricingConfig(): Promise<PricingConfig> {
    // 1. Try MongoDB first (Production/Atlas)
    if (MONGODB_URI) {
        try {
            const mongoClient = await getMongoClient();
            if (mongoClient) {
                const db = mongoClient.db(DB_NAME);
                const config = await db.collection(COLLECTION_NAME).findOne<PricingConfig>({});
                if (config) {
                    // Remove MongoDB _id if present to match PricingConfig type
                    const { _id, ...rest } = config as any;
                    return rest as PricingConfig;
                }
            }
        } catch (error) {
            console.error('Failed to fetch from MongoDB:', error);
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
    // 1. Save to MongoDB (Production/Atlas)
    if (MONGODB_URI) {
        try {
            const mongoClient = await getMongoClient();
            if (mongoClient) {
                const db = mongoClient.db(DB_NAME);
                // Use updateOne with upsert: true to maintain a single config document
                await db.collection(COLLECTION_NAME).updateOne(
                    {},
                    { $set: config },
                    { upsert: true }
                );
                return { success: true };
            }
        } catch (error: any) {
            console.error('Failed to save to MongoDB:', error);
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
        // If we're on Vercel but MongoDB is not configured, show specific error
        if (process.env.VERCEL) {
            return {
                success: false,
                error: "Vercel is 'Read-Only'. Please configure MONGODB_URI in Vercel environment variables."
            };
        }
        return { success: false, error: 'Internal Server Error: ' + error.message };
    }
}

