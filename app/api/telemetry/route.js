import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 1. ESP32 Sends POST Data -> Saved to Supabase Database
export async function POST(request) {
  try {
    const data = await request.json();

    // Insert reading into the database table
    const { data: insertedData, error } = await supabase
      .from('telemetry_logs')
      .insert([
        {
          deviceId: data.deviceId || 'ESP32_Default',
          temperature: data.temperature,
          freeRam: data.freeRam,
          freeRam: data.freeRam,
          rssi: data.rssi,
          uptime: data.uptime,
          touchPin: data.touchPin
        },
      ])
      .select();

    if (error) throw error;

    console.log("--> Saved to Supabase DB:", insertedData);
    return NextResponse.json({ success: true, inserted: insertedData }, { status: 200 });
  } catch (error) {
    console.error("Supabase Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// 2. Next.js Dashboard Fetches Latest 20 Logs for Visual Charts
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('telemetry_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50); // Fetch top 50 historical entries for time-series charts

    if (error) throw error;
    return NextResponse.json(data || [], { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}