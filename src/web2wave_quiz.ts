import { Web2Wave } from './web2wave_base';
import { Web2WaveWebListener } from './types';
import { isValidUrl } from './helpers';
import { ColorValue } from 'react-native';

class Web2WaveQuizManager {
  private webPageURL: string | null = null;
  private listener: Web2WaveWebListener | undefined;
  private allowBackNavigation: boolean = false;
  private backgroundColor: string = '#FFFFFF';
  private onStateChangeCallbacks: Array<(isOpen: boolean) => void> = [];

  openWebPage({
    webPageURL,
    listener,
    allowBackNavigation = false,
    backgroundColor = '#FFFFFF',
  }: {
    webPageURL: string;
    listener?: Web2WaveWebListener;
    allowBackNavigation?: boolean;
    backgroundColor?: ColorValue;
  }): void {
    if (!Web2Wave.shared.isInitialized) {
      throw new Error('You must initialize apiKey before use');
    }
    if (!isValidUrl(webPageURL)) {
      throw new Error('You must provide valid url');
    }

    this.webPageURL = webPageURL;
    this.listener = listener;
    this.allowBackNavigation = allowBackNavigation;
    this.backgroundColor =
      typeof backgroundColor === 'string'
        ? backgroundColor
        : backgroundColor?.toString() || '#FFFFFF';

    this.notifyStateChange(true);
  }

  closeWebPage(): void {
    this.webPageURL = null;
    this.listener = undefined;
    this.notifyStateChange(false);
  }

  getState() {
    return {
      isOpen: this.webPageURL !== null,
      webPageURL: this.webPageURL,
      listener: this.listener,
      allowBackNavigation: this.allowBackNavigation,
      backgroundColor: this.backgroundColor,
    };
  }

  onStateChange(callback: (isOpen: boolean) => void): () => void {
    this.onStateChangeCallbacks.push(callback);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  private notifyStateChange(isOpen: boolean): void {
    this.onStateChangeCallbacks.forEach((callback) => callback(isOpen));
  }
}

export const web2WaveQuizManager = new Web2WaveQuizManager();

export function openWebPage({
  webPageURL,
  listener,
  allowBackNavigation = false,
  backgroundColor = '#FFFFFF',
}: {
  webPageURL: string;
  listener?: Web2WaveWebListener;
  allowBackNavigation?: boolean;
  backgroundColor?: ColorValue;
}): void {
  web2WaveQuizManager.openWebPage({
    webPageURL,
    listener,
    allowBackNavigation,
    backgroundColor,
  });
}

export function closeWebPage(): void {
  web2WaveQuizManager.closeWebPage();
}
