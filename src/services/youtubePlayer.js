import { Platform } from 'react-native';

// Service pour lire YouTube directement comme audio
class YouTubePlayerService {
  constructor() {
    this.player = null;
    this.isReady = false;
    this.currentVideoId = null;
    this.isWebPlatform = Platform.OS === 'web';
  }

  // Initialiser le lecteur YouTube
  async initPlayer(containerId = 'youtube-player') {
    if (!this.isWebPlatform) {
      throw new Error('YouTube Player API disponible seulement sur le web');
    }

    return new Promise((resolve, reject) => {
      // Charger l'API YouTube si pas déjà fait
      if (!window.YT) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(script);
        
        window.onYouTubeIframeAPIReady = () => {
          this.createPlayer(containerId, resolve, reject);
        };
      } else {
        this.createPlayer(containerId, resolve, reject);
      }
    });
  }

  createPlayer(containerId, resolve, reject) {
    try {
      // Créer un conteneur caché pour le lecteur
      let container = document.getElementById(containerId);
      if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        container.style.width = '1px';
        container.style.height = '1px';
        document.body.appendChild(container);
      }

      this.player = new window.YT.Player(containerId, {
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3, // Désactiver les annotations
          cc_load_policy: 0, // Désactiver les sous-titres
          playsinline: 1
        },
        events: {
          onReady: (event) => {
            console.log('🎵 Lecteur YouTube prêt');
            this.isReady = true;
            resolve(this.player);
          },
          onStateChange: (event) => {
            this.onPlayerStateChange(event);
          },
          onError: (event) => {
            console.error('❌ Erreur lecteur YouTube:', event.data);
            reject(event);
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  }

  onPlayerStateChange(event) {
    const states = {
      [-1]: 'unstarted',
      [0]: 'ended',
      [1]: 'playing',
      [2]: 'paused',
      [3]: 'buffering',
      [5]: 'cued'
    };
    
    console.log('🎵 État lecteur:', states[event.data] || event.data);
    
    // Émettre des événements personnalisés
    const customEvent = new CustomEvent('youtubePlayerStateChange', {
      detail: { state: event.data, stateName: states[event.data] }
    });
    window.dispatchEvent(customEvent);
  }

  // Précharger une vidéo sans la lire
  async loadVideo(videoId) {
    if (!this.isWebPlatform) {
      throw new Error('YouTube Player API disponible seulement sur le web');
    }

    if (!this.isReady) {
      await this.initPlayer();
    }

    this.currentVideoId = videoId;
    
    try {
      // Charger la vidéo sans autoplay
      this.player.cueVideoById({
        videoId: videoId,
        startSeconds: 0
      });
      
      console.log('🎵 Vidéo préchargée:', videoId);
      return true;
    } catch (error) {
      console.error('❌ Erreur préchargement vidéo:', error);
      return false;
    }
  }

  // Charger et lire une vidéo
  async loadAndPlay(videoId, autoplay = true) {
    if (!this.isReady) {
      await this.initPlayer();
    }

    this.currentVideoId = videoId;
    
    try {
      if (autoplay) {
        // Charger et lire immédiatement
        this.player.loadVideoById({
          videoId: videoId,
          startSeconds: 0
        });
      } else {
        // Juste précharger
        return this.loadVideo(videoId);
      }
      
      console.log('🎵 Vidéo chargée et lecture démarrée:', videoId);
      return true;
    } catch (error) {
      console.error('❌ Erreur chargement vidéo:', error);
      return false;
    }
  }

  // Contrôles de lecture
  play() {
    if (this.player && this.isReady) {
      this.player.playVideo();
    }
  }

  pause() {
    if (this.player && this.isReady) {
      this.player.pauseVideo();
    }
  }

  stop() {
    if (this.player && this.isReady) {
      this.player.stopVideo();
    }
  }

  // Obtenir la position actuelle (en secondes)
  getCurrentTime() {
    if (this.player && this.isReady) {
      return this.player.getCurrentTime();
    }
    return 0;
  }

  // Obtenir la durée totale (en secondes)
  getDuration() {
    if (this.player && this.isReady) {
      return this.player.getDuration();
    }
    return 0;
  }

  // Aller à une position spécifique
  seekTo(seconds) {
    if (this.player && this.isReady) {
      this.player.seekTo(seconds, true);
    }
  }

  // Contrôle du volume (0-100)
  setVolume(volume) {
    if (this.player && this.isReady) {
      this.player.setVolume(volume);
    }
  }

  getVolume() {
    if (this.player && this.isReady) {
      return this.player.getVolume();
    }
    return 50;
  }

  // Vérifier l'état de lecture
  isPlaying() {
    if (this.player && this.isReady) {
      return this.player.getPlayerState() === 1; // YT.PlayerState.PLAYING
    }
    return false;
  }

  isPaused() {
    if (this.player && this.isReady) {
      return this.player.getPlayerState() === 2; // YT.PlayerState.PAUSED
    }
    return false;
  }

  // Nettoyer le lecteur
  destroy() {
    if (this.player) {
      this.player.destroy();
      this.player = null;
      this.isReady = false;
      this.currentVideoId = null;
    }
  }
}

// Instance singleton
const youtubePlayer = new YouTubePlayerService();
export default youtubePlayer;