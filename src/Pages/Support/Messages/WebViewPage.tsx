import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import AuthHeaders from '../../../Components/Headers/AuthHeaders';
import { Colors } from '../../../Components/Colors/Colors';
import ShimmerLoader from '../../../Components/Loader/ShimmerLoader';

const WebViewPage = ({ route }: any) => {
  const { url, title } = route.params; // Extract title from route params
  const [isLoading, setIsLoading] = useState(true); // State to track loading
  const [timeoutReached, setTimeoutReached] = useState(false); // State for timeout

  // Handler to set loading to false when the page is loaded
  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  // Set a timeout of 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
      setIsLoading(false); // Stop loading after 10 seconds even if the WebView hasn't finished loading
    }, 500); // 10000 milliseconds = 10 seconds

    // Cleanup the timeout when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <AuthHeaders
        title={title} // Pass title from route.params
        infoText={title} 
      />
      {isLoading ? (
        // Show shimmer loader while loading
        <ShimmerLoader />
      ) : (
        // Show WebView after loading is complete or when timeout is reached
        <WebView
          source={{ uri: url }}
          style={{ flex: 1 }}
          onLoadEnd={handleLoadEnd} // Trigger when page finishes loading
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.whiteColorF4,
  },
});

export default WebViewPage;