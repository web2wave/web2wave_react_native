export interface Web2WaveResponse {
  isSuccess: boolean;
  errorMessage?: string;
}

export interface Subscription {
  [key: string]: any;
}

export interface UserProperties {
  [property: string]: string;
}

export interface Web2WaveWebListener {
  onEvent?: (event: string, data?: Record<string, any>) => void;
  onClose?: (data?: Record<string, any>) => void;
  onQuizFinished?: (data?: Record<string, any>) => void;
}
