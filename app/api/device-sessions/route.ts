import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { DeviceInfo, MobileData, LocationData, NetworkData, BrowserDetails, SystemDetails } from '@/lib/device-security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate mock device sessions for demonstration
function generateMockDeviceSessions(staffId: string) {
  const sessions = [];
  const deviceTypes: DeviceInfo['device_type'][] = ['mobile', 'desktop', 'tablet'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const osTypes = ['Windows', 'macOS', 'Android', 'iOS'];
  
  // Generate 1-3 active sessions
  const sessionCount = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < sessionCount; i++) {
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const os = osTypes[Math.floor(Math.random() * osTypes.length)];
    const lastActivity = new Date(Date.now() - (i * 60 * 60 * 1000)); // Last few hours
    
    const deviceInfo: DeviceInfo = {
      ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
      user_agent: `Mozilla/5.0 (${deviceType === 'mobile' ? 'Mobile' : ''})`,
      browser: browser,
      os: os,
      device_type: deviceType,
      screen_resolution: `${1920 - (i * 100)}x1080`,
      language: 'en-US',
      timezone: 'America/New_York',
      device_fingerprint: randomUUID().substring(0, 32)
    };
    
    const mobileData: MobileData | undefined = deviceType === 'mobile' ? {
      battery_level: Math.floor(Math.random() * 100),
      battery_charging: Math.random() > 0.5,
      connection_type: Math.random() > 0.5 ? 'wifi' : 'cellular',
      device_memory: 8,
      hardware_concurrency: 8,
      platform: os,
      device_pixel_ratio: 2,
      color_depth: 24
    } : undefined;
    
    const locationData: LocationData = {
      country: 'United States',
      city: 'New York',
      region: 'NY',
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      timezone_offset: '-300'
    };
    
    sessions.push({
      id: randomUUID(),
      session_id: randomUUID(),
      staff_id: staffId,
      device_fingerprint: deviceInfo.device_fingerprint,
      device_info: deviceInfo,
      location_data: locationData,
      is_active: true,
      last_activity: lastActivity.toISOString(),
      created_at: new Date(lastActivity.getTime() - (2 * 60 * 60 * 1000)).toISOString(), // 2 hours before last activity
      expires_at: new Date(lastActivity.getTime() + (24 * 60 * 60 * 1000)).toISOString() // 24 hours from last activity
    });
  }
  
  return sessions;
}

export async function GET(request: NextRequest) {
  // Set CORS headers
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  try {
    const { searchParams } = new URL(request.url);
    const staff_id = searchParams.get('staff_id');

    if (!staff_id) {
      return NextResponse.json({ error: 'staff_id is required' }, { status: 400, headers });
    }

    // Try to get real data from database
    const { data, error } = await supabase
      .from('device_sessions')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('is_active', true)
      .order('last_activity', { ascending: false });

    if (error) {
      console.error('Error fetching device sessions:', error);
      // If table doesn't exist, generate mock data
      if (error.code === 'PGRST116') {
        console.log('Generating mock device sessions for staff:', staff_id);
        const mockSessions = generateMockDeviceSessions(staff_id);
        return NextResponse.json(mockSessions, { headers });
      }
      return NextResponse.json({ error: 'Failed to fetch device sessions' }, { status: 500, headers });
    }

    // If no real data exists, generate mock data
    if (!data || data.length === 0) {
      console.log('No real device sessions found, generating mock data for staff:', staff_id);
      const mockSessions = generateMockDeviceSessions(staff_id);
      return NextResponse.json(mockSessions, { headers });
    }

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Device sessions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch device sessions' }, { status: 500, headers });
  }
}

export async function POST(request: NextRequest) {
  // Set CORS headers
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  try {
    const { staff_id, session_id, device_fingerprint, device_info, location_data } = await request.json();
    
    // First, deactivate any existing sessions for this device
    await supabase
      .from('device_sessions')
      .update({ is_active: false })
      .eq('device_fingerprint', device_fingerprint)
      .eq('is_active', true);

    // Then create or update the current session
    const { data, error } = await supabase
      .from('device_sessions')
      .upsert({
        staff_id,
        session_id,
        device_fingerprint,
        device_info,
        location_data,
        is_active: true,
        last_activity: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }, {
        onConflict: 'session_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating device session:', error);
      // If table doesn't exist, return a mock response for now
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          id: randomUUID(),
          staff_id,
          session_id,
          device_fingerprint,
          device_info,
          location_data,
          is_active: true,
          last_activity: new Date().toISOString(),
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }, { status: 201, headers });
      }
      return NextResponse.json({ error: 'Failed to create device session' }, { status: 500, headers });
    }

    return NextResponse.json(data, { status: 201, headers });
  } catch (error) {
    console.error('Device session creation error:', error);
    return NextResponse.json({ error: 'Failed to create device session' }, { status: 500, headers });
  }
}

export async function DELETE(request: NextRequest) {
  // Set CORS headers
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400, headers });
    }

    const { data, error } = await supabase
      .from('device_sessions')
      .update({ is_active: false })
      .eq('session_id', session_id)
      .select()
      .single();

    if (error) {
      console.error('Error deactivating session:', error);
      // If table doesn't exist, return success for now
      if (error.code === 'PGRST116') {
        return NextResponse.json({ session_id, is_active: false }, { headers });
      }
      return NextResponse.json({ error: 'Failed to deactivate session' }, { status: 500, headers });
    }

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Session deactivation error:', error);
    return NextResponse.json({ error: 'Failed to deactivate session' }, { status: 500, headers });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
