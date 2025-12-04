import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { Gemstone } from '@/types/gemstone';

// GET all gemstones
export async function GET() {
  try {
    const gemstoneIds = await redis.smembers('gemstone:ids') || [];
    const gemstones: Gemstone[] = [];
    
    for (const id of gemstoneIds) {
      const gemstoneData = await redis.get(`gemstone:${id}`);
      if (gemstoneData) {
        gemstones.push(JSON.parse(gemstoneData));
      }
    }
    
    return NextResponse.json(gemstones);
  } catch (error) {
    console.error('Error fetching gemstones:', error);
    return NextResponse.json({ error: 'Failed to fetch gemstones' }, { status: 500 });
  }
}

// POST new gemstone
export async function POST(request: NextRequest) {
  try {
    const gemstone: Gemstone = await request.json();
    
    // Store gemstone
    await redis.set(`gemstone:${gemstone.id}`, JSON.stringify(gemstone));
    
    // Add ID to set of all gemstone IDs
    await redis.sadd('gemstone:ids', gemstone.id);
    
    return NextResponse.json(gemstone, { status: 201 });
  } catch (error) {
    console.error('Error creating gemstone:', error);
    return NextResponse.json({ error: 'Failed to create gemstone' }, { status: 500 });
  }
}

// DELETE gemstone
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Gemstone ID is required' }, { status: 400 });
    }
    
    // Remove gemstone
    await redis.del(`gemstone:${id}`);
    
    // Remove ID from set
    await redis.srem('gemstone:ids', id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gemstone:', error);
    return NextResponse.json({ error: 'Failed to delete gemstone' }, { status: 500 });
  }
}
