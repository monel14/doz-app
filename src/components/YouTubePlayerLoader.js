import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';

// Composant pour charger l'API YouTube Player
const YouTubePlayerLoader = ({ children }) => {
  useEffect(() => {
    // Charger l'API YouTube Player seulement sur le web
    if (Platform.OS === 'web' && typeof window !== 'undefined' && !window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);
      
      console.log('📺 Chargement de l\'API YouTube Player...');
      
      // Créer le conteneur pour le lecteur YouTube (seulement sur web)
      setTimeout(() => {
        if (!document.getElementById('youtube-player-container')) {
          const container = document.createElement('div');
          container.id = 'youtube-player-container';
          container.style.position = 'absolute';
          container.style.top = '-9999px';
          container.style.left = '-9999px';
          container.style.width = '1px';
          container.style.height = '1px';
          container.style.opacity = '0';
          container.style.pointerEvents = 'none';
          document.body.appendChild(container);
        }
      }, 100);
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
};

export default YouTubePlayerLoader;