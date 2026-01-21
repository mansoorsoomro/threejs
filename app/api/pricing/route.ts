import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PricingConfig } from '@/lib/pricing';

const PRICING_FILE_PATH = path.join(process.cwd(), 'data', 'pricing-config.json');

// Helper to ensure data directory exists
const ensureDataDir = () => {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
};

export async function GET() {
    try {
        ensureDataDir();
        if (!fs.existsSync(PRICING_FILE_PATH)) {
            return NextResponse.json({ error: 'Pricing file not found' }, { status: 404 });
        }
        const fileContents = fs.readFileSync(PRICING_FILE_PATH, 'utf8');
        const pricingData = JSON.parse(fileContents);
        return NextResponse.json(pricingData);
    } catch (error) {
        console.error('Error reading pricing data:', error);
        return NextResponse.json({ error: 'Failed to read pricing data' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { pricing, credentials } = body;

        // Basic credential check for saving
        if (credentials?.email !== 'admin@gmail.com' || credentials?.password !== 'Admin@123') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        ensureDataDir();
        fs.writeFileSync(PRICING_FILE_PATH, JSON.stringify(pricing, null, 2), 'utf8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving pricing data:', error);
        return NextResponse.json({ error: 'Failed to save pricing data' }, { status: 500 });
    }
}
