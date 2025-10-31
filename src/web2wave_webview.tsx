import React, { useRef, useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Platform,
  SafeAreaView,
} from 'react-native';
// @ts-ignore - react-native-webview is a peer dependency
import { WebView } from 'react-native-webview';
import { Web2WaveWebListener } from './types';
import { prepareUrl } from './helpers';

interface Web2WaveWebViewProps {
  url: string;
  allowBackNavigation: boolean;
  listener?: Web2WaveWebListener;
  backgroundColor: string;
  onClose: () => void;
}

const Web2WaveWebView: React.FC<Web2WaveWebViewProps> = ({
  url,
  allowBackNavigation,
  listener,
  backgroundColor,
  onClose,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get safe area insets using StatusBar and bottom safe area
  // For more precise control, users can install react-native-safe-area-context
  const topOffset = Platform.OS === 'ios' ? 44 : 0; // Approximate status bar height
  const bottomOffset = Platform.OS === 'ios' ? 34 : 0; // Approximate bottom safe area

  const preparedUrl = prepareUrl(url, topOffset, bottomOffset);

  const handleJsMessage = (message: string) => {
    try {
      const data = JSON.parse(message);
      const event = data.event;
      const eventData = data.data;

      if (event === 'Quiz finished') {
        listener?.onQuizFinished?.(eventData);
      } else if (event === 'Close webview') {
        listener?.onClose?.(eventData);
        onClose();
      } else {
        listener?.onEvent?.(event, eventData);
      }
    } catch (error) {
      console.error('Error parsing JS message:', error);
    }
  };

  const injectedJavaScript = `
    (function() {
      // Set up React Native WebView bridge
      if (window.ReactNativeWebView) {
        // Listen for messages from the web page
        window.addEventListener('message', function(event) {
          if (event.data) {
            try {
              const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
              window.ReactNativeWebView.postMessage(JSON.stringify(data));
            } catch (e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                event: typeof event.data === 'string' ? event.data : 'message',
                data: event.data
              }));
            }
          }
        });
        
        // Also listen for custom events that might be dispatched
        document.addEventListener('web2wave-message', function(event) {
          if (event.detail) {
            window.ReactNativeWebView.postMessage(JSON.stringify(event.detail));
          }
        });
      }
    })();
    true;
  `;

  const handleNavigationStateChange = (navState: any) => {
    if (!isLoaded && navState.loading === false) {
      setIsLoaded(true);
    }
  };

  const handleBackPress = () => {
    if (allowBackNavigation) {
      webViewRef.current?.goBack();
      return true;
    }
    return false;
  };

  React.useEffect(() => {
    if (allowBackNavigation && Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress
      );
      return () => backHandler.remove();
    }
  }, [allowBackNavigation]);

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => {
        if (allowBackNavigation) {
          webViewRef.current?.goBack();
        } else {
          onClose();
        }
      }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <WebView
          ref={webViewRef}
          source={{ uri: preparedUrl }}
          style={styles.webview}
          onMessage={(event: any) => {
            handleJsMessage(event.nativeEvent.data);
          }}
          onNavigationStateChange={handleNavigationStateChange}
          injectedJavaScript={injectedJavaScript}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
        />
        {!isLoaded && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default Web2WaveWebView;
