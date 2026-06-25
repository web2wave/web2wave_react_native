import { Platform, Dimensions } from 'react-native';
import { Web2WaveResponse, Subscription, UserProperties, IdentifyResponse } from './types';

export class Web2Wave {
  private static instance: Web2Wave;
  private readonly baseURL = 'https://api.web2wave.com';
  private apiKey?: string;

  private constructor() {}

  static get shared(): Web2Wave {
    if (!Web2Wave.instance) {
      Web2Wave.instance = new Web2Wave();
    }
    return Web2Wave.instance;
  }

  private getPlatform(): string {
    if (Platform.OS === 'ios') return 'iOS';
    if (Platform.OS === 'android') return 'Android';
    return 'Other';
  }

  private getScreenSize(): string {
    const { width, height } = Dimensions.get('window');
    return `${Math.round(width)}x${Math.round(height)}`;
  }

  private getTimezone(): string {
    const totalMinutes = -new Date().getTimezoneOffset();
    const hours = Math.trunc(totalMinutes / 60);
    const minutes = Math.abs(totalMinutes % 60);
    const sign = hours >= 0 ? '+' : '-';
    return `UTC${sign}${String(Math.abs(hours)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  private getOSVersion(): string {
    if (Platform.OS === 'ios') return `iOS ${Platform.Version}`;
    if (Platform.OS === 'android') return `Android ${Platform.Version}`;
    return 'Unknown';
  }

  private get headers(): Record<string, string> {
    if (!this.apiKey) {
      throw new Error('You must initialize apiKey before use');
    }
    return {
      'api-key': this.apiKey,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      platform: this.getPlatform(),
      screen_size: this.getScreenSize(),
      timezone: this.getTimezone(),
      os_version: this.getOSVersion(),
    };
  }

  initialize(apiKey: string): void {
    this.apiKey = apiKey;
  }

  get isInitialized(): boolean {
    return !!this.apiKey;
  }

  private async fetchSubscriptionStatus(
    web2waveUserId: string
  ): Promise<{ subscription?: Subscription[] } | null> {
    if (!this.apiKey) {
      throw new Error('You must initialize apiKey before use');
    }

    const url = `${this.baseURL}/api/user/subscriptions?user=${encodeURIComponent(
      web2waveUserId
    )}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers,
    });

    if (response.status === 200) {
      return await response.json();
    }
    return null;
  }

  async hasActiveSubscription(web2waveUserId: string): Promise<boolean> {
    const subscriptionStatus = await this.fetchSubscriptionStatus(web2waveUserId);
    if (!subscriptionStatus) return false;

    const subscriptions = subscriptionStatus.subscription as Subscription[] | undefined;
    return (
      subscriptions?.some(
        (sub) => sub.status === 'active' || sub.status === 'trialing'
      ) ?? false
    );
  }

  async fetchSubscriptions(
    web2waveUserId: string
  ): Promise<Subscription[] | null> {
    const response = await this.fetchSubscriptionStatus(web2waveUserId);
    return response?.subscription || null;
  }

  async chargeUser(
    web2waveUserId: string,
    priceId: number
  ): Promise<Web2WaveResponse> {
    if (!this.apiKey) {
      throw new Error('You must initialize apiKey before use');
    }

    const url = `${this.baseURL}/api/subscription/user/charge`;
    const body = new URLSearchParams({
      user_id: web2waveUserId,
      price_id: priceId.toString(),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const result = await response.json();
    if (response.status === 200) {
      return { isSuccess: result.success === '1' };
    } else {
      return { isSuccess: false, errorMessage: result.message };
    }
  }

  async cancelSubscription(
    paySystemId: string,
    comment?: string
  ): Promise<Web2WaveResponse> {
    if (!this.apiKey) {
      throw new Error('You must initialize apiKey before use');
    }

    const url = `${this.baseURL}/api/subscription/cancel`;
    const body = new URLSearchParams({
      pay_system_id: paySystemId,
    });

    if (comment) {
      body.append('comment', comment);
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...this.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const result = await response.json();
    if (response.status === 200) {
      return { isSuccess: result.success === '1' };
    } else {
      return { isSuccess: false, errorMessage: result.error_msg };
    }
  }

  async refundSubscription(
    paySystemId: string,
    invoiceId: string,
    comment?: string
  ): Promise<Web2WaveResponse> {
    if (!this.apiKey) {
      throw new Error('You must initialize apiKey before use');
    }

    const url = `${this.baseURL}/api/subscription/refund`;
    const body = new URLSearchParams({
      pay_system_id: paySystemId,
      invoice_id: invoiceId,
    });

    if (comment) {
      body.append('comment', comment);
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...this.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const result = await response.json();
    if (response.status === 200) {
      return { isSuccess: result.success === '1' };
    } else {
      return { isSuccess: false, errorMessage: result.error_msg };
    }
  }

  async fetchUserProperties(
    web2waveUserId: string
  ): Promise<UserProperties | null> {
    if (!this.apiKey) {
      throw new Error('You must initialize apiKey before use');
    }

    const url = `${this.baseURL}/api/user/properties?user=${encodeURIComponent(
      web2waveUserId
    )}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers,
    });

    if (response.status === 200) {
      const data = await response.json();
      const propertiesList = data.properties as Array<{
        property: string;
        value: string;
      }> | undefined;

      if (!propertiesList) return null;

      const properties: UserProperties = {};
      propertiesList.forEach((item) => {
        properties[item.property] = item.value;
      });
      return properties;
    }
    return null;
  }

  async updateUserProperty(
    web2waveUserId: string,
    property: string,
    value: string
  ): Promise<Web2WaveResponse> {
    if (!this.apiKey) {
      throw new Error('You must initialize apiKey before use');
    }

    const url = `${this.baseURL}/api/user/properties?user=${encodeURIComponent(
      web2waveUserId
    )}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ property, value }),
    });

    const result = await response.json();
    if (response.status === 200) {
      return { isSuccess: result.result === '1' };
    } else {
      return { isSuccess: false, errorMessage: result.error_msg };
    }
  }

  async setRevenuecatProfileID(
    web2waveUserId: string,
    revenuecatProfileId: string
  ): Promise<Web2WaveResponse> {
    return this.updateUserProperty(
      web2waveUserId,
      'revenuecat_profile_id',
      revenuecatProfileId
    );
  }

  async setAdaptyProfileID(
    web2waveUserId: string,
    adaptyProfileId: string
  ): Promise<Web2WaveResponse> {
    return this.updateUserProperty(
      web2waveUserId,
      'adapty_profile_id',
      adaptyProfileId
    );
  }

  async setQonversionProfileID(
    web2waveUserId: string,
    qonversionProfileId: string
  ): Promise<Web2WaveResponse> {
    return this.updateUserProperty(
      web2waveUserId,
      'qonversion_profile_id',
      qonversionProfileId
    );
  }

  async identify(): Promise<IdentifyResponse | null> {
    if (!this.apiKey) {
      throw new Error('You must initialize apiKey before use');
    }

    const url = `${this.baseURL}/api/user/identify`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers,
    });

    if (response.status === 200) {
      return await response.json();
    }
    return null;
  }
}
