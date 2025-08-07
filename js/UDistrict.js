// Performance tracking
class VideoPerformanceTracker {
  constructor() {
    this.metrics = {
      videosLoaded: 0,
      videosWatched: 0,
      averageLoadTime: 0,
      totalLoadTime: 0,
      networkSpeed: 'unknown'
    };
  }

  trackVideoLoad(videoElement, loadTime) {
    this.metrics.videosLoaded++;
    this.metrics.totalLoadTime += loadTime;
    this.metrics.averageLoadTime = this.metrics.totalLoadTime / this.metrics.videosLoaded;
    
    console.log(`Video loaded in ${loadTime.toFixed(2)}ms - Average: ${this.metrics.averageLoadTime.toFixed(2)}ms`);
  }

  trackVideoView(videoTitle) {
    this.metrics.videosWatched++;
    console.log(`User watched: ${videoTitle} (Total watched: ${this.metrics.videosWatched})`);
  }

  getReport() {
    return this.metrics;
  }
}

const performanceTracker = new VideoPerformanceTracker();

// Network speed detection and bandwidth optimization
class BandwidthOptimizer {
  constructor() {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.networkSpeed = 'unknown';
    this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    this.detectNetworkSpeed();
  }

  detectNetworkSpeed() {
    if (this.connection) {
      // Use navigator.connection if available
      if (this.connection.effectiveType) {
        switch (this.connection.effectiveType) {
          case 'slow-2g':
          case '2g':
            this.networkSpeed = 'slow';
            break;
          case '3g':
            this.networkSpeed = 'medium';
            break;
          case '4g':
            this.networkSpeed = 'fast';
            break;
          default:
            this.networkSpeed = 'fast';
        }
      } else if (this.connection.downlink) {
        // Use downlink speed
        if (this.connection.downlink < 1) {
          this.networkSpeed = 'slow';
        } else if (this.connection.downlink < 5) {
          this.networkSpeed = 'medium';
        } else {
          this.networkSpeed = 'fast';
        }
      }
    } else {
      // Fallback: assume mobile = slower network
      this.networkSpeed = this.isMobile ? 'medium' : 'fast';
    }

    performanceTracker.metrics.networkSpeed = this.networkSpeed;
    console.log(`🌐 Network detected: ${this.networkSpeed} (${this.isMobile ? 'Mobile' : 'Desktop'})`);
  }

  getPreloadCount() {
    switch (this.networkSpeed) {
      case 'slow':
        return 1; // Only preload 1 video on slow networks
      case 'medium':
        return 2; // Preload 2 videos on medium networks
      case 'fast':
        return 3; // Preload 3 videos on fast networks
      default:
        return 2; // Default to 2
    }
  }

  getLoadDelay() {
    switch (this.networkSpeed) {
      case 'slow':
        return 1000; // 1 second delay on slow networks
      case 'medium':
        return 500; // 0.5 second delay on medium networks
      case 'fast':
        return 200; // 0.2 second delay on fast networks
      default:
        return 500;
    }
  }
}

// Bandwidth-optimized lazy loading
function setupBandwidthOptimizedLoading() {
  const videos = document.querySelectorAll('.video-item video[data-src]');
  const videoArray = Array.from(videos);
  const bandwidthOptimizer = new BandwidthOptimizer();
  let currentVisibleIndex = 0;
  let loadingStates = new Map();
  let loadQueue = [];
  let isLoading = false;
  
  // Function to load a specific video with bandwidth awareness
  function loadVideo(video, index) {
    if (!video.src && video.dataset.src && !loadingStates.get(index)) {
      const startTime = performance.now();
      const videoSrc = video.dataset.src;
      
      // Mark as loading
      loadingStates.set(index, 'loading');
      
      console.log(`🔄 Loading video ${index + 1} (${bandwidthOptimizer.networkSpeed} network)`);
      
      // Mobile-specific video attributes
      if (bandwidthOptimizer.isMobile) {
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('x5-playsinline', '');
        video.setAttribute('x5-video-player-type', 'h5');
        video.setAttribute('x5-video-player-fullscreen', 'false');
        video.setAttribute('preload', 'none');
      }
      
      // Load the video source
      video.src = videoSrc;
      
      // Track load time
      video.addEventListener('loadeddata', () => {
        const loadTime = performance.now() - startTime;
        performanceTracker.trackVideoLoad(video, loadTime);
        loadingStates.set(index, 'loaded');
        console.log(`✅ Video ${index + 1} loaded successfully`);
        
        // Process next video in queue
        processLoadQueue();
      }, { once: true });
      
      // Handle load errors with retry mechanism
      video.addEventListener('error', (e) => {
        console.error(`❌ Failed to load video ${index + 1}:`, e);
        loadingStates.set(index, 'error');
        
        // Retry loading on slow networks after a longer delay
        if (bandwidthOptimizer.networkSpeed === 'slow') {
          setTimeout(() => {
            console.log(`🔄 Retrying video ${index + 1} on slow network...`);
            loadingStates.set(index, 'retrying');
            video.src = videoSrc;
          }, 3000);
        }
        
        // Process next video in queue
        processLoadQueue();
      }, { once: true });
    }
  }
  
  // Queue-based loading to prevent overwhelming slow networks
  function processLoadQueue() {
    if (loadQueue.length === 0 || isLoading) return;
    
    isLoading = true;
    const nextVideo = loadQueue.shift();
    
    setTimeout(() => {
      loadVideo(nextVideo.video, nextVideo.index);
      isLoading = false;
      processLoadQueue();
    }, bandwidthOptimizer.getLoadDelay());
  }
  
  // Function to preload videos based on network speed
  function preloadVideos(visibleIndex) {
    const preloadCount = bandwidthOptimizer.getPreloadCount();
    const nextIndices = [];
    
    // Get next video indices based on network speed
    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = visibleIndex + i;
      if (nextIndex < videoArray.length && !loadingStates.get(nextIndex)) {
        nextIndices.push(nextIndex);
      }
    }
    
    // Add to load queue instead of loading immediately
    nextIndices.forEach(index => {
      if (!loadQueue.find(item => item.index === index)) {
        loadQueue.push({ video: videoArray[index], index });
      }
    });
    
    if (nextIndices.length > 0) {
      console.log(`📦 Queuing ${nextIndices.length} videos for ${bandwidthOptimizer.networkSpeed} network`);
    }
    
    // Start processing queue if not already processing
    if (!isLoading) {
      processLoadQueue();
    }
  }

  // Enhanced intersection observer with bandwidth-aware settings
  const observerOptions = {
    rootMargin: bandwidthOptimizer.isMobile ? '50px 0px' : '100px 0px', // Smaller margin on mobile
    threshold: bandwidthOptimizer.networkSpeed === 'slow' ? 0.1 : 0.05 // Higher threshold on slow networks
  };

  const lazyLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      const videoIndex = videoArray.indexOf(video);
      
      if (entry.isIntersecting) {
        // Load current video if not already loaded
        if (!video.src && video.dataset.src) {
          loadVideo(video, videoIndex);
        }
        
        // Update current visible index
        currentVisibleIndex = videoIndex;
        
        // Preload videos based on network speed
        preloadVideos(currentVisibleIndex);
      }
    });
  }, observerOptions);

  // Observe all videos for lazy loading
  videos.forEach(video => {
    lazyLoadObserver.observe(video);
  });
  
  // Load first video immediately, then queue others based on network speed
  if (videoArray.length > 0) {
    loadVideo(videoArray[0], 0);
    preloadVideos(0);
  }
  
  // Fallback: Force load remaining videos after 10 seconds on slow networks
  if (bandwidthOptimizer.networkSpeed === 'slow') {
    setTimeout(() => {
      const unloadedVideos = videoArray.filter((video, index) => !video.src && video.dataset.src);
      if (unloadedVideos.length > 0) {
        console.log(`🔄 Slow network fallback: Loading ${unloadedVideos.length} remaining videos`);
        unloadedVideos.forEach((video, index) => {
          const originalIndex = videoArray.indexOf(video);
          loadVideo(video, originalIndex);
        });
      }
    }, 10000);
  }
}

// Fisher-Yates shuffle algorithm for randomizing videos
function shuffleVideos() {
  const videoFeed = document.querySelector('.video-feed');
  const videoItems = Array.from(videoFeed.children);
  
  // Fisher-Yates shuffle
  for (let i = videoItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    videoFeed.appendChild(videoItems[j]);
  }
}

// Mobile-optimized autoplay functionality
function setupVideoAutoplay() {
  const videos = document.querySelectorAll('.video-item video');
  let currentlyPlaying = null;
  let globalMuted = true;
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const observerOptions = {
    threshold: isMobile ? 0.3 : 0.5, // Lower threshold on mobile
    rootMargin: isMobile ? '0px 0px -5% 0px' : '0px 0px -10% 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      
      if (entry.isIntersecting) {
        // Pause any currently playing video
        if (currentlyPlaying && currentlyPlaying !== video) {
          currentlyPlaying.pause();
        }
        
        // Play the current video if it has a source and is loaded
        if (video.src && video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
          // Mobile-specific play attempt
          const playPromise = video.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                currentlyPlaying = video;
                // Track video view
                const videoTitle = video.closest('.video-item').querySelector('h3').textContent;
                performanceTracker.trackVideoView(videoTitle);
              })
              .catch(e => {
                console.log('Autoplay prevented on mobile:', e);
                // On mobile, try to play again after user interaction
                if (isMobile) {
                  document.addEventListener('touchstart', () => {
                    video.play().catch(e => console.log('Still cannot autoplay:', e));
                  }, { once: true });
                }
              });
          }
        }
      } else {
        // Pause video when not visible
        video.pause();
      }
    });
  }, observerOptions);

  // Observe all videos
  videos.forEach(video => {
    observer.observe(video);
    video.muted = globalMuted;
    video.volume = 0.5;
    
    // Mobile-specific video attributes
    if (isMobile) {
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('x5-playsinline', '');
      video.setAttribute('x5-video-player-type', 'h5');
      video.setAttribute('x5-video-player-fullscreen', 'false');
    }
    
    // Add click to toggle global mute
    video.addEventListener('click', () => {
      globalMuted = !globalMuted;
      videos.forEach(v => {
        v.muted = globalMuted;
        v.volume = 0.5;
      });
    });
  });
}

// On page load, setup bandwidth-optimized loading, shuffle, then setup autoplay
window.onload = function() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  console.log(`🚀 UDistrict page loading - Bandwidth optimized for ${isMobile ? 'Mobile' : 'Desktop'}`);
  
  // Setup bandwidth-optimized loading first
  setupBandwidthOptimizedLoading();
  
  // Shuffle videos
  shuffleVideos();
  
  // Force scroll to top and disable scroll snap temporarily
  const videoFeed = document.querySelector('.video-feed');
  videoFeed.style.scrollSnapType = 'none';
  
  // Scroll to top
  window.scrollTo(0, 0);
  videoFeed.scrollTop = 0;
  
  // Re-enable scroll snap and setup autoplay after a brief delay
  setTimeout(() => {
    videoFeed.style.scrollSnapType = 'y mandatory';
    setupVideoAutoplay();
    console.log('✅ Video autoplay setup complete');
  }, isMobile ? 500 : 200); // Longer delay on mobile
  
  // Log performance report on page unload
  window.addEventListener('beforeunload', () => {
    const report = performanceTracker.getReport();
    console.log('📊 Performance Report:', report);
  });
}; 