import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Gemstone } from '@/types/gemstone';

// GET all gemstones
export async function GET() {
  try {
    const gemstoneIds = await kv.smembers('gemstone:ids') || [];
    const gemstones: Gemstone[] = [];
    
    for (const id of gemstoneIds) {
      const gemstone = await kv.get<Gemstone>(`gemstone:${id}`);
      if (gemstone) {
        gemstones.push(gemstone);
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
    await kv.set(`gemstone:${gemstone.id}`, gemstone);
    
    // Add ID to set of all gemstone IDs
    await kv.sadd('gemstone:ids', gemstone.id);
    
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
    await kv.del(`gemstone:${id}`);
    
    // Remove ID from set
    await kv.srem('gemstone:ids', id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gemstone:', error);
    return NextResponse.json({ error: 'Failed to delete gemstone' }, { status: 500 });
  }
}
