import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const YouTubeWebPlayer = ({ videoId, title, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const webViewRef = useRef(null);

  // HTML pour intégrer YouTube Player
  const youtubeHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #000;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        #player {
          width: 100%;
          height: 200px;
        }
      </style>
    </head>
    <body>
      <div id="player"></div>
      
      <script>
        // Charger l'API YouTube
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        var player;
        function onYouTubeIframeAPIReady() {
          player = new YT.Player('player', {
            height: '200',
            width: '100%',
            videoId: '${videoId}',
            playerVars: {
              'autoplay': 0,
              'controls': 1,
              'rel': 0,
              'showinfo': 0,
              'modestbranding': 1,
              'playsinline': 1
            },
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange
            }
          });
        }

        function onPlayerReady(event) {
          // Lecteur prêt
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ready'
          }));
        }

        function onPlayerStateChange(event) {
          var state = 'unknown';
          switch(event.data) {
            case YT.PlayerState.PLAYING:
              state = 'playing';
              break;
            case YT.PlayerState.PAUSED:
              state = 'paused';
              break;
            case YT.PlayerState.ENDED:
              state = 'ended';
              break;
            case YT.PlayerState.BUFFERING:
              state = 'buffering';
              break;
          }
          
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'stateChange',
            state: state,
            currentTime: player.getCurrentTime(),
            duration: player.getDuration()
          }));
        }

        // Fonctions de contrôle
        function playVideo() {
          if (player) player.playVideo();
        }

        function pauseVideo() {
          if (player) player.pauseVideo();
        }

        function seekTo(seconds) {
          if (player) player.seekTo(seconds);
        }

        function setVolume(volume) {
          if (player) player.setVolume(volume);
        }
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'ready':
          setIsLoading(false);
          console.log('🎵 YouTube Player prêt');
          break;
          
        case 'stateChange':
          setIsPlaying(data.state === 'playing');
          console.log('🎵 État:', data.state);
          break;
      }
    } catch (error) {
      console.error('Erreur message WebView:', error);
    }
  };

  const sendCommand = (command, params = {}) => {
    const script = `${command}(${Object.values(params).join(',')});`;
    webViewRef.current?.injectJavaScript(script);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      sendCommand('pauseVideo');
    } else {
      sendCommand('playVideo');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="chevron-down" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* YouTube Player WebView */}
      <View style={styles.playerContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: youtubeHTML }}
          style={styles.webView}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Chargement du lecteur...</Text>
          </View>
        )}
      </View>

      {/* Contrôles personnalisés */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => sendCommand('seekTo', { 0: 'player.getCurrentTime() - 10' })}
        >
          <Ionicons name="play-skip-back" size={30} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.playButton}
          onPress={togglePlayPause}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={40} 
            color="#000" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => sendCommand('seekTo', { 0: 'player.getCurrentTime() + 10' })}
        >
          <Ionicons name="play-skip-forward" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.infoText}>
          🎵 Lecteur YouTube intégré
        </Text>
        <Text style={styles.infoSubtext}>
          Utilisez les contrôles YouTube ou les boutons ci-dessus
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  placeholder: {
    width: 34,
  },
  playerContainer: {
    height: 250,
    backgroundColor: '#000',
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  controlButton: {
    padding: 20,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  info: {
    padding: 20,
    alignItems: 'center',
  },
  infoText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoSubtext: {
    color: '#b3b3b3',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default YouTubeWebPlayer;