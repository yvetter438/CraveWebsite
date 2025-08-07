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

// Enhanced lazy loading with preloading next 3 videos - Fixed for fast scrolling
function setupLazyLoading() {
  const videos = document.querySelectorAll('.video-item video[data-src]');
  const videoArray = Array.from(videos);
  let currentVisibleIndex = 0;
  let loadingStates = new Map(); // Track loading state of each video
  
  // Function to load a specific video
  function loadVideo(video, index) {
    if (!video.src && video.dataset.src && !loadingStates.get(index)) {
      const startTime = performance.now();
      const videoSrc = video.dataset.src;
      
      // Mark as loading to prevent duplicate loads
      loadingStates.set(index, 'loading');
      
      console.log(`🔄 Loading video ${index + 1}: ${videoSrc}`);
      
      // Load the video source
      video.src = videoSrc;
      
      // Track load time
      video.addEventListener('loadeddata', () => {
        const loadTime = performance.now() - startTime;
        performanceTracker.trackVideoLoad(video, loadTime);
        loadingStates.set(index, 'loaded');
        console.log(`✅ Video ${index + 1} loaded successfully`);
      }, { once: true });
      
      // Handle load errors
      video.addEventListener('error', () => {
        console.error(`❌ Failed to load video ${index + 1}`);
        loadingStates.set(index, 'error');
      }, { once: true });
    }
  }
  
  // Function to preload next 3 videos
  function preloadNextVideos(visibleIndex) {
    const nextIndices = [];
    
    // Get next 3 video indices
    for (let i = 1; i <= 3; i++) {
      const nextIndex = visibleIndex + i;
      if (nextIndex < videoArray.length) {
        nextIndices.push(nextIndex);
      }
    }
    
    // Load next 3 videos
    nextIndices.forEach(index => {
      loadVideo(videoArray[index], index);
    });
    
    if (nextIndices.length > 0) {
      console.log(`📦 Preloading videos: ${nextIndices.map(i => i + 1).join(', ')}`);
    }
  }
  
  // Function to preload previous 2 videos (for backward scrolling)
  function preloadPreviousVideos(visibleIndex) {
    const prevIndices = [];
    
    // Get previous 2 video indices
    for (let i = 1; i <= 2; i++) {
      const prevIndex = visibleIndex - i;
      if (prevIndex >= 0) {
        prevIndices.push(prevIndex);
      }
    }
    
    // Load previous 2 videos
    prevIndices.forEach(index => {
      loadVideo(videoArray[index], index);
    });
    
    if (prevIndices.length > 0) {
      console.log(`📦 Preloading previous videos: ${prevIndices.map(i => i + 1).join(', ')}`);
    }
  }

  const lazyLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      const videoIndex = videoArray.indexOf(video);
      
      if (entry.isIntersecting) {
        // Load current video if not already loaded
        loadVideo(video, videoIndex);
        
        // Update current visible index
        currentVisibleIndex = videoIndex;
        
        // Preload next 3 videos
        preloadNextVideos(currentVisibleIndex);
        
        // Preload previous 2 videos (for backward scrolling)
        preloadPreviousVideos(currentVisibleIndex);
        
        // Don't stop observing - keep observing for potential reloads
      }
    });
  }, {
    rootMargin: '150px 0px', // Increased buffer for fast scrolling
    threshold: 0.1
  });

  // Observe all videos for lazy loading
  videos.forEach(video => {
    lazyLoadObserver.observe(video);
  });
  
  // Load first video and preload next 3 immediately
  if (videoArray.length > 0) {
    loadVideo(videoArray[0], 0);
    preloadNextVideos(0);
  }
}

// YouTube Shorts-style autoplay functionality
function setupVideoAutoplay() {
  const videos = document.querySelectorAll('.video-item video');
  let currentlyPlaying = null;
  let globalMuted = true;

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
          video.play().catch(e => console.log('Autoplay prevented:', e));
          currentlyPlaying = video;
          
          // Track video view
          const videoTitle = video.closest('.video-item').querySelector('h3').textContent;
          performanceTracker.trackVideoView(videoTitle);
        }
      } else {
        // Pause video when not visible
        video.pause();
      }
    });
  }, {
    threshold: 0.5, // Video must be 50% visible to play
    rootMargin: '0px 0px -10% 0px' // Slight buffer for better UX
  });

  // Observe all videos
  videos.forEach(video => {
    observer.observe(video);
    video.muted = globalMuted;
    video.volume = 0.5;
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

// On page load, setup lazy loading first, then setup autoplay
window.onload = function() {
  console.log('🚀 Sweet Alchemy page loading with enhanced lazy loading (preload +3) - Fixed for fast scrolling');
  
  // Setup lazy loading first
  setupLazyLoading();
  
  // Setup autoplay
  setupVideoAutoplay();
  console.log('✅ Video autoplay setup complete');
  
  // Log performance report on page unload
  window.addEventListener('beforeunload', () => {
    const report = performanceTracker.getReport();
    console.log('📊 Performance Report:', report);
  });
}; 