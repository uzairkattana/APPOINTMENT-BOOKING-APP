// Device Security and Monitoring System
// Collects device information for security purposes

import { randomUUID } from 'crypto';

export interface DeviceInfo {
  ip_address: string
  user_agent: string
  browser: string
  os: string
  device_type: 'mobile' | 'desktop' | 'tablet'
  screen_resolution: string
  language: string
  timezone: string
  device_fingerprint: string
}

export interface MobileData {
  battery_level?: number
  battery_charging?: boolean
  connection_type?: 'wifi' | 'cellular' | 'ethernet' | 'unknown'
  device_memory?: number
  hardware_concurrency?: number
  platform: string
  device_pixel_ratio?: number
  color_depth?: number
}

export interface LocationData {
  country?: string
  city?: string
  region?: string
  latitude?: number
  longitude?: number
  timezone_offset?: string
  isp?: string
}

export interface NetworkData {
  ip_address: string
  isp?: string
  connection_type: 'wifi' | 'cellular' | 'ethernet' | 'unknown'
  download_speed?: number
  upload_speed?: number
  latency?: number
  vpn_detected: boolean
  tor_detected: boolean
  ip_reputation: 'unknown' | 'safe' | 'suspicious' | 'malicious'
}

export interface BrowserDetails {
  name: string
  version: string
  engine: string
  engine_version: string
  cookies_enabled: boolean
  do_not_track: boolean
  plugins: string[]
  screen_orientation: string
  color_depth: number
  pixel_ratio: number
}

export interface SystemDetails {
  platform: string
  platform_version: string
  architecture: string
  cpu_cores: number
  memory: number
  storage?: number
  language: string
  languages: string[]
  timezone: string
  timezone_offset: number
}

export interface LoginPattern {
  usual_login_times: string[]
  usual_locations: string[]
  usual_devices: string[]
  login_frequency: number
  avg_session_duration: number
  last_login: string
}

export interface UserBehavior {
  pages_visited: string[]
  actions_performed: string[]
  time_on_pages: { [key: string]: number }
  click_patterns: string[]
  typing_speed?: number
  mouse_movements: number
  scroll_depth: number
}

export interface RiskFactors {
  new_device: boolean
  new_location: boolean
  unusual_time: boolean
  high_risk_country: boolean
  vpn_or_tor: boolean
  multiple_failed_attempts: boolean
  suspicious_user_agent: boolean
  impossible_travel: boolean
}

export interface SecurityEvent {
  id: string
  staff_id: string
  event_type: 'login' | 'logout' | 'suspicious_activity' | 'device_change' | 'location_change' | 'failed_login' | 'password_change' | 'permission_change'
  timestamp: string
  device_info: DeviceInfo
  mobile_data?: MobileData
  location_data?: LocationData
  network_data?: NetworkData
  risk_score: number
  risk_factors: string[]
  alerts: string[]
  security_level: 'low' | 'normal' | 'medium' | 'high' | 'critical'
  session_id?: string
  auth_method: 'password' | 'sso' | 'oauth' | 'mfa'
  mfa_verified: boolean
  login_pattern?: LoginPattern
  user_behavior?: UserBehavior
  browser_fingerprint?: string
  device_fingerprint: string
  ip_reputation: string
  user_agent: string
  referrer?: string
  page_accessed?: string
  success: boolean
  error_message?: string
}

class DeviceSecurityService {
  private static instance: DeviceSecurityService;
  private deviceFingerprint: string = '';

  static getInstance(): DeviceSecurityService {
    if (!DeviceSecurityService.instance) {
      DeviceSecurityService.instance = new DeviceSecurityService();
    }
    return DeviceSecurityService.instance;
  }

  // Generate unique device fingerprint
  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvas?.toDataURL() || '',
      navigator.hardwareConcurrency || '',
      navigator.deviceMemory || '',
      navigator.platform
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  }

  // Get device information
  async getDeviceInfo(): Promise<DeviceInfo> {
    if (!this.deviceFingerprint) {
      this.deviceFingerprint = this.generateDeviceFingerprint();
    }

    const userAgent = navigator.userAgent;
    const browser = this.detectBrowser(userAgent);
    const os = this.detectOS(userAgent);
    const deviceType = this.detectDeviceType(userAgent);

    // Get IP address (you'll need to implement this server-side or use a service)
    const ipAddress = await this.getIPAddress();

    return {
      ip_address: ipAddress,
      user_agent: userAgent,
      browser,
      os,
      device_type: deviceType,
      screen_resolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      device_fingerprint: this.deviceFingerprint
    };
  }

  // Get mobile-specific data
  async getMobileData(): Promise<MobileData> {
    const mobileData: MobileData = {
      platform: navigator.platform,
      device_pixel_ratio: window.devicePixelRatio,
      color_depth: screen.colorDepth,
      hardware_concurrency: navigator.hardwareConcurrency || undefined,
      device_memory: (navigator as any).deviceMemory || undefined
    };

    // Get battery information if available
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        mobileData.battery_level = Math.round(battery.level * 100);
        mobileData.battery_charging = battery.charging;
      } catch (error) {
        console.log('Battery API not available');
      }
    }

    // Get connection information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      mobileData.connection_type = this.mapConnectionType(connection.effectiveType);
    }

    return mobileData;
  }

  // Get location information
  async getLocationData(): Promise<LocationData> {
    const locationData: LocationData = {};

    try {
      // Get timezone offset
      locationData.timezone_offset = new Date().getTimezoneOffset().toString();

      // You can implement IP-based location lookup here
      // For now, we'll use browser geolocation if permission is granted
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false
          });
        });

        locationData.latitude = position.coords.latitude;
        locationData.longitude = position.coords.longitude;
      }
    } catch (error) {
      console.log('Location access denied or unavailable');
    }

    return locationData;
  }

  // Detect browser from user agent
  private detectBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  // Detect OS from user agent
  private detectOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  // Detect device type from user agent
  private detectDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
    if (/Mobile|Android|iPhone|iPad|iPod/.test(userAgent)) {
      if (/iPad|Tablet/.test(userAgent)) return 'tablet';
      return 'mobile';
    }
    return 'desktop';
  }

  // Map connection type
  private mapConnectionType(effectiveType: string): 'wifi' | 'cellular' | 'ethernet' | 'unknown' {
    switch (effectiveType) {
      case '4g': return 'cellular';
      case '3g': return 'cellular';
      case '2g': return 'cellular';
      case 'slow-2g': return 'cellular';
      default: return 'unknown';
    }
  }

  // Get IP address (implement server-side or use a service)
  private async getIPAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.log('Failed to get IP address');
      return 'Unknown';
    }
  }

  // Create security event
  async createSecurityEvent(
    staffId: string,
    eventType: SecurityEvent['event_type'],
    sessionId?: string
  ): Promise<SecurityEvent> {
    const deviceInfo = await this.getDeviceInfo();
    const mobileData = await this.getMobileData();
    const locationData = await this.getLocationData();
    const networkData = await this.getNetworkData();

    const riskScore = this.calculateRiskScore(deviceInfo, mobileData, locationData);
    const alerts = this.generateAlerts(deviceInfo, mobileData, locationData, riskScore);
    const riskFactors = this.generateRiskFactors(deviceInfo, mobileData, locationData, networkData);
    const securityLevel = this.determineSecurityLevel(riskScore, riskFactors);

    return {
      id: randomUUID(),
      staff_id: staffId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      device_info: deviceInfo,
      mobile_data: mobileData,
      location_data: locationData,
      network_data: networkData,
      risk_score: riskScore,
      risk_factors: riskFactors,
      alerts,
      security_level: securityLevel,
      session_id: sessionId,
      auth_method: 'password',
      mfa_verified: false,
      browser_fingerprint: this.generateBrowserFingerprint(),
      device_fingerprint: deviceInfo.device_fingerprint,
      ip_reputation: networkData?.ip_reputation || 'unknown',
      user_agent: deviceInfo.user_agent,
      success: true
    };
  }

  // Get network data
  async getNetworkData(): Promise<NetworkData> {
    try {
      const ipAddress = await this.getIPAddress();
      
      // Get connection information
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      return {
        ip_address: ipAddress,
        connection_type: this.mapConnectionType(connection?.effectiveType || 'unknown'),
        download_speed: connection?.downlink || undefined,
        latency: connection?.rtt || undefined,
        vpn_detected: false, // You'd implement VPN detection here
        tor_detected: false, // You'd implement Tor detection here
        ip_reputation: 'unknown' // You'd check IP reputation here
      };
    } catch (error) {
      console.log('Failed to get network data');
      return {
        ip_address: 'Unknown',
        connection_type: 'unknown',
        vpn_detected: false,
        tor_detected: false,
        ip_reputation: 'unknown'
      };
    }
  }

  // Generate browser fingerprint
  generateBrowserFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas?.toDataURL() || '',
      navigator.hardwareConcurrency || '',
      navigator.deviceMemory || ''
    ].join('|');
    
    return this.simpleHash(fingerprint);
  }

  // Simple hash function for fingerprinting
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Generate risk factors
  private generateRiskFactors(
    deviceInfo: DeviceInfo,
    mobileData: MobileData,
    locationData: LocationData,
    networkData: NetworkData
  ): string[] {
    const factors: string[] = [];
    
    if (deviceInfo.device_type === 'mobile') factors.push('mobile_device');
    if (mobileData.battery_level && mobileData.battery_level < 20) factors.push('low_battery');
    if (networkData.connection_type === 'cellular') factors.push('cellular_connection');
    if (networkData.vpn_detected) factors.push('vpn_detected');
    if (networkData.tor_detected) factors.push('tor_detected');
    if (networkData.ip_reputation === 'suspicious') factors.push('suspicious_ip');
    if (networkData.ip_reputation === 'malicious') factors.push('malicious_ip');
    
    return factors;
  }

  // Determine security level
  private determineSecurityLevel(riskScore: number, riskFactors: string[]): 'low' | 'normal' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 80 || riskFactors.includes('malicious_ip') || riskFactors.includes('tor_detected')) {
      return 'critical';
    } else if (riskScore >= 60 || riskFactors.includes('suspicious_ip') || riskFactors.includes('vpn_detected')) {
      return 'high';
    } else if (riskScore >= 40) {
      return 'medium';
    } else if (riskScore >= 20) {
      return 'normal';
    } else {
      return 'low';
    }
  }
  private calculateRiskScore(
    deviceInfo: DeviceInfo,
    mobileData: MobileData,
    locationData: LocationData
  ): number {
    let riskScore = 0;

    // Risk factors
    if (deviceInfo.device_type === 'mobile') riskScore += 10;
    if (!mobileData.battery_charging && mobileData.battery_level && mobileData.battery_level < 20) riskScore += 15;
    if (mobileData.connection_type === 'cellular') riskScore += 5;
    if (locationData.latitude && locationData.longitude) {
      // Check if location is unusual (you'd need to store previous locations)
      riskScore += 0;
    }

    return Math.min(riskScore, 100);
  }

  // Generate security alerts
  private generateAlerts(
    deviceInfo: DeviceInfo,
    mobileData: MobileData,
    locationData: LocationData,
    riskScore: number
  ): string[] {
    const alerts: string[] = [];

    if (riskScore > 50) {
      alerts.push('High risk activity detected');
    }

    if (mobileData.battery_level && mobileData.battery_level < 10) {
      alerts.push('Very low battery level');
    }

    if (deviceInfo.device_type === 'mobile' && mobileData.connection_type === 'cellular') {
      alerts.push('Using cellular network');
    }

    return alerts;
  }
}

export default DeviceSecurityService;
