import { NextRequest, NextResponse } from 'next/server';
import { getPricingConfig, savePricingConfig } from '@/lib/pricingPersistence';

export async function GET() {
    try {
        const pricingData = await getPricingConfig();
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

        const result = await savePricingConfig(pricing);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 403 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving pricing data:', error);
        return NextResponse.json({ error: 'Failed to save pricing data' }, { status: 500 });
    }
}
