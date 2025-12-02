import { NextResponse } from 'next/server';
import { getAlerts } from '@/lib/data';

export async function GET() {
    try {
        const data = await getAlerts();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in alerts API:', error);
        return NextResponse.json(
            { error: 'Failed to fetch alerts' },
            { status: 500 }
        );
    }
}
