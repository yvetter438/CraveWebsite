// Performance tracking
class VideoPerformanceTracker {
  constructor() {
    this.metrics = {
      videosLoaded: 0,
      videosWatched: 0,
      averageLoadTime: 0,
      totalLoadTime: 0
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

// Mobile-friendly lazy loading with fallbacks
function setupLazyLoading() {
  const videos = document.querySelectorAll('.video-item video[data-src]');
  const videoArray = Array.from(videos);
  let currentVisibleIndex = 0;
  let loadingStates = new Map(); // Track loading state of each video
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  console.log(`📱 Device detected: ${isMobile ? 'Mobile' : 'Desktop'}`);
  
  // Function to load a specific video with mobile optimizations
  function loadVideo(video, index) {
    if (!video.src && video.dataset.src && !loadingStates.get(index)) {
      const startTime = performance.now();
      const videoSrc = video.dataset.src;
      
      // Mark as loading to prevent duplicate loads
      loadingStates.set(index, 'loading');
      
      console.log(`🔄 Loading video ${index + 1}: ${videoSrc}`);
      
      // Mobile-specific video attributes
      if (isMobile) {
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('x5-playsinline', '');
        video.setAttribute('x5-video-player-type', 'h5');
        video.setAttribute('x5-video-player-fullscreen', 'false');
        video.setAttribute('preload', 'metadata');
      }
      
      // Load the video source
      video.src = videoSrc;
      
      // Track load time
      video.addEventListener('loadeddata', () => {
        const loadTime = performance.now() - startTime;
        performanceTracker.trackVideoLoad(video, loadTime);
        loadingStates.set(index, 'loaded');
        console.log(`✅ Video ${index + 1} loaded successfully`);
      }, { once: true });
      
      // Handle load errors with retry mechanism
      video.addEventListener('error', (e) => {
        console.error(`❌ Failed to load video ${index + 1}:`, e);
        loadingStates.set(index, 'error');
        
        // Retry loading on mobile after a delay
        if (isMobile && loadingStates.get(index) === 'error') {
          setTimeout(() => {
            console.log(`🔄 Retrying video ${index + 1}...`);
            loadingStates.set(index, 'retrying');
            video.src = videoSrc;
          }, 2000);
        }
      }, { once: true });
    }
  }
  
  // Function to preload next videos (reduced for mobile)
  function preloadNextVideos(visibleIndex) {
    const preloadCount = isMobile ? 2 : 3; // Reduce preload on mobile
    const nextIndices = [];
    
    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = visibleIndex + i;
      if (nextIndex < videoArray.length) {
        nextIndices.push(nextIndex);
      }
    }
    
    nextIndices.forEach(index => {
      loadVideo(videoArray[index], index);
    });
    
    if (nextIndices.length > 0) {
      console.log(`📦 Preloading videos: ${nextIndices.map(i => i + 1).join(', ')}`);
    }
  }
  
  // Function to preload previous videos (reduced for mobile)
  function preloadPreviousVideos(visibleIndex) {
    const preloadCount = isMobile ? 1 : 2; // Reduce preload on mobile
    const prevIndices = [];
    
    for (let i = 1; i <= preloadCount; i++) {
      const prevIndex = visibleIndex - i;
      if (prevIndex >= 0) {
        prevIndices.push(prevIndex);
      }
    }
    
    prevIndices.forEach(index => {
      loadVideo(videoArray[index], index);
    });
    
    if (prevIndices.length > 0) {
      console.log(`📦 Preloading previous videos: ${prevIndices.map(i => i + 1).join(', ')}`);
    }
  }

  // Enhanced intersection observer with mobile-friendly settings
  const observerOptions = {
    rootMargin: isMobile ? '100px 0px' : '150px 0px', // Smaller margin on mobile
    threshold: isMobile ? 0.05 : 0.1 // Lower threshold on mobile
  };

  const lazyLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      const videoIndex = videoArray.indexOf(video);
      
      if (entry.isIntersecting) {
        // Load current video if not already loaded
        loadVideo(video, videoIndex);
        
        // Update current visible index
        currentVisibleIndex = videoIndex;
        
        // Preload videos
        preloadNextVideos(currentVisibleIndex);
        preloadPreviousVideos(currentVisibleIndex);
      }
    });
  }, observerOptions);

  // Observe all videos for lazy loading
  videos.forEach(video => {
    lazyLoadObserver.observe(video);
  });
  
  // Load first video and preload next videos immediately
  if (videoArray.length > 0) {
    loadVideo(videoArray[0], 0);
    preloadNextVideos(0);
  }
  
  // Fallback: Force load all videos after 3 seconds on mobile if intersection observer fails
  if (isMobile) {
    setTimeout(() => {
      const unloadedVideos = videoArray.filter((video, index) => !video.src && video.dataset.src);
      if (unloadedVideos.length > 0) {
        console.log(`🔄 Fallback: Loading ${unloadedVideos.length} remaining videos`);
        unloadedVideos.forEach((video, index) => {
          const originalIndex = videoArray.indexOf(video);
          loadVideo(video, originalIndex);
        });
      }
    }, 3000);
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

// On page load, setup lazy loading first, then shuffle videos, then setup autoplay
window.onload = function() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  console.log(`🚀 UDistrict page loading - ${isMobile ? 'Mobile' : 'Desktop'} optimized`);
  
  // Setup lazy loading first
  setupLazyLoading();
  
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