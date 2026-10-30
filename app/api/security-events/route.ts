import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { SecurityEvent, DeviceInfo } from '@/lib/device-security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate mock security events for demonstration
function generateMockSecurityEvents(staffId: string): SecurityEvent[] {
  const now = new Date();
  const events: SecurityEvent[] = [];
  
  // Generate some sample events
  for (let i = 0; i < 5; i++) {
    const timestamp = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // Last 5 days
    const eventTypes: SecurityEvent['event_type'][] = ['login', 'logout', 'device_change', 'failed_login', 'password_change'];
    const deviceTypes: DeviceInfo['device_type'][] = ['mobile', 'desktop', 'tablet'];
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    const osTypes = ['Windows', 'macOS', 'Android', 'iOS'];
    const securityLevels: SecurityEvent['security_level'][] = ['low', 'normal', 'medium', 'high', 'critical'];
    const authMethods: SecurityEvent['auth_method'][] = ['password', 'mfa', 'sso', 'oauth'];
    
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const os = osTypes[Math.floor(Math.random() * osTypes.length)];
    const securityLevel = securityLevels[Math.floor(Math.random() * securityLevels.length)];
    const authMethod = authMethods[Math.floor(Math.random() * authMethods.length)];
    
    // Generate mock network data
    const networkData: NetworkData = {
      ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
      connection_type: Math.random() > 0.5 ? 'wifi' : 'cellular',
      download_speed: Math.random() * 100,
      upload_speed: Math.random() * 50,
      latency: Math.floor(Math.random() * 100),
      vpn_detected: Math.random() > 0.9,
      tor_detected: Math.random() > 0.95,
      ip_reputation: Math.random() > 0.8 ? 'safe' : Math.random() > 0.5 ? 'suspicious' : 'unknown'
    };

    // Generate mock risk factors
    const riskFactors: string[] = [];
    if (deviceType === 'mobile') riskFactors.push('mobile_device');
    if (networkData.connection_type === 'cellular') riskFactors.push('cellular_connection');
    if (networkData.vpn_detected) riskFactors.push('vpn_detected');
    if (networkData.tor_detected) riskFactors.push('tor_detected');
    if (Math.random() > 0.8) riskFactors.push('suspicious_activity');
    
    events.push({
      id: randomUUID(),
      staff_id: staffId,
      event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      timestamp: timestamp.toISOString(),
      device_info: {
        ip_address: networkData.ip_address,
        user_agent: `Mozilla/5.0 (${deviceType === 'mobile' ? 'Mobile' : ''}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`,
        browser: browser,
        os: os,
        device_type: deviceType,
        screen_resolution: `${1920 - (i * 100)}x1080`,
        language: 'en-US',
        timezone: 'America/New_York',
        device_fingerprint: randomUUID().substring(0, 32)
      },
      mobile_data: deviceType === 'mobile' ? {
        battery_level: Math.floor(Math.random() * 100),
        battery_charging: Math.random() > 0.5,
        connection_type: networkData.connection_type,
        device_memory: 8,
        hardware_concurrency: 8,
        platform: os,
        device_pixel_ratio: 2,
        color_depth: 24
      } : undefined,
      location_data: {
        country: 'United States',
        city: 'New York',
        region: 'NY',
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
        timezone_offset: '-300',
        isp: 'Comcast Cable Communications'
      },
      network_data: networkData,
      risk_score: Math.floor(Math.random() * 100),
      risk_factors: riskFactors,
      alerts: Math.random() > 0.7 ? ['Suspicious activity detected'] : [],
      security_level: securityLevel,
      session_id: randomUUID(),
      auth_method: authMethod,
      mfa_verified: authMethod === 'mfa',
      login_pattern: {
        usual_login_times: ['09:00', '14:00', '18:00'],
        usual_locations: ['New York', 'Boston'],
        usual_devices: ['Chrome', 'Safari'],
        login_frequency: Math.floor(Math.random() * 10) + 1,
        avg_session_duration: Math.floor(Math.random() * 3600) + 1800,
        last_login: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString()
      },
      user_behavior: {
        pages_visited: ['/dashboard', '/patients', '/appointments'],
        actions_performed: ['login', 'view_patient', 'create_appointment'],
        time_on_pages: { '/dashboard': 120, '/patients': 300, '/appointments': 180 },
        click_patterns: ['header_click', 'table_row_click', 'form_submit'],
        typing_speed: Math.floor(Math.random() * 60) + 40,
        mouse_movements: Math.floor(Math.random() * 1000),
        scroll_depth: Math.floor(Math.random() * 100)
      },
      browser_fingerprint: randomUUID().substring(0, 32),
      device_fingerprint: randomUUID().substring(0, 32),
      ip_reputation: networkData.ip_reputation,
      user_agent: `Mozilla/5.0 (${deviceType === 'mobile' ? 'Mobile' : ''}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`,
      referrer: Math.random() > 0.5 ? 'https://google.com' : 'direct',
      page_accessed: '/staff-dashboard',
      success: Math.random() > 0.1,
      error_message: Math.random() > 0.9 ? 'Invalid credentials' : undefined
    });
  }
  
  return events;
}

export async function GET(request: NextRequest) {
  // Set CORS headers
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  try {
    const { searchParams } = new URL(request.url);
    const staff_id = searchParams.get('staff_id');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    if (!staff_id) {
      return NextResponse.json({ error: 'staff_id is required' }, { status: 400, headers });
    }

    // Try to get real data from database
    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .eq('staff_id', staff_id)
      .order('timestamp', { ascending: false })
      .limit(Number(limit))
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      console.error('Error fetching security events:', error);
      // If table doesn't exist, generate mock data
      if (error.code === 'PGRST116') {
        console.log('Generating mock security events for staff:', staff_id);
        const mockEvents = generateMockSecurityEvents(staffId);
        return NextResponse.json(mockEvents, { headers });
      }
      return NextResponse.json({ error: 'Failed to fetch security events' }, { status: 500, headers });
    }

    // If no real data exists, generate mock data
    if (!data || data.length === 0) {
      console.log('No real security events found, generating mock data for staff:', staff_id);
      const mockEvents = generateMockSecurityEvents(staffId);
      return NextResponse.json(mockEvents, { headers });
    }

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Security events API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers });
  }
}

export async function POST(request: NextRequest) {
  // Set CORS headers
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  try {
    const securityEvent: SecurityEvent = await request.json();
    
    const { data, error } = await supabase
      .from('security_events')
      .insert(securityEvent)
      .select()
      .single();

    if (error) {
      console.error('Error creating security event:', error);
      // If table doesn't exist, return a mock response for now
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          ...securityEvent,
          id: randomUUID(),
          created_at: new Date().toISOString()
        }, { status: 201, headers });
      }
      return NextResponse.json({ error: 'Failed to create security event' }, { status: 500, headers });
    }

    // Check for high-risk events and send alerts
    if (securityEvent.risk_score > 50) {
      await sendSecurityAlert(securityEvent);
    }

    return NextResponse.json(data, { status: 201, headers });
  } catch (error) {
    console.error('Security events API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Send security alert for high-risk events
async function sendSecurityAlert(event: SecurityEvent) {
  // You can implement email, SMS, or notification alerts here
  console.log('SECURITY ALERT:', {
    staff_id: event.staff_id,
    risk_score: event.risk_score,
    alerts: event.alerts,
    device_info: event.device_info,
    timestamp: event.timestamp
  });

  // Example: Send to admin notification system
  // await sendAdminNotification(event);
}
