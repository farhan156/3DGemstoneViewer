import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Gemstone } from '@/types/gemstone';

// GET single gemstone by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gemstone = await kv.get<Gemstone>(`gemstone:${params.id}`);
    
    if (!gemstone) {
      return NextResponse.json({ error: 'Gemstone not found' }, { status: 404 });
    }
    
    return NextResponse.json(gemstone);
  } catch (error) {
    console.error('Error fetching gemstone:', error);
    return NextResponse.json({ error: 'Failed to fetch gemstone' }, { status: 500 });
  }
}

// PUT update gemstone
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gemstone: Gemstone = await request.json();
    
    // Update gemstone
    await kv.set(`gemstone:${params.id}`, gemstone);
    
    return NextResponse.json(gemstone);
  } catch (error) {
    console.error('Error updating gemstone:', error);
    return NextResponse.json({ error: 'Failed to update gemstone' }, { status: 500 });
  }
}
