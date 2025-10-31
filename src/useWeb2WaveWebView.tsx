import React, { useState, useEffect } from 'react';
import { ColorValue } from 'react-native';
import Web2WaveWebView from './web2wave_webview';
import { web2WaveQuizManager } from './web2wave_quiz';
import { Web2WaveWebListener } from './types';

/**
 * React Hook to manage Web2Wave webview
 * Use this hook in your root component or App component to enable webview functionality
 *
 * @example
 * ```tsx
 * function App() {
 *   const { webViewComponent } = useWeb2WaveWebView();
 *   return (
 *     <>
 *       <YourAppContent />
 *       {webViewComponent}
 *     </>
 *   );
 * }
 * ```
 */
export function useWeb2WaveWebView() {
  const [isOpen, setIsOpen] = useState(false);
  const [webPageURL, setWebPageURL] = useState<string | null>(null);
  const [listener, setListener] = useState<Web2WaveWebListener | undefined>();
  const [allowBackNavigation, setAllowBackNavigation] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');

  useEffect(() => {
    const unsubscribe = web2WaveQuizManager.onStateChange((open) => {
      if (open) {
        const state = web2WaveQuizManager.getState();
        setWebPageURL(state.webPageURL || null);
        setListener(state.listener);
        setAllowBackNavigation(state.allowBackNavigation);
        setBackgroundColor(state.backgroundColor);
      }
      setIsOpen(open);
    });

    // Check initial state
    const initialState = web2WaveQuizManager.getState();
    setIsOpen(initialState.isOpen);
    if (initialState.isOpen) {
      setWebPageURL(initialState.webPageURL);
      setListener(initialState.listener);
      setAllowBackNavigation(initialState.allowBackNavigation);
      setBackgroundColor(initialState.backgroundColor);
    }

    return unsubscribe;
  }, []);

  const webViewComponent =
    isOpen && webPageURL ? (
      <Web2WaveWebView
        url={webPageURL}
        allowBackNavigation={allowBackNavigation}
        listener={listener}
        backgroundColor={backgroundColor}
        onClose={() => {
          web2WaveQuizManager.closeWebPage();
        }}
      />
    ) : null;

  return { webViewComponent };
}
