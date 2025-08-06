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

// Lazy loading functionality
function setupLazyLoading() {
  const videos = document.querySelectorAll('.video-item video[data-src]');
  
  const lazyLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      
      if (entry.isIntersecting && !video.src) {
        const startTime = performance.now();
        const videoSrc = video.dataset.src;
        
        // Load the video source
        video.src = videoSrc;
        
        // Track load time
        video.addEventListener('loadeddata', () => {
          const loadTime = performance.now() - startTime;
          performanceTracker.trackVideoLoad(video, loadTime);
        }, { once: true });
        
        // Stop observing this video since it's now loaded
        lazyLoadObserver.unobserve(video);
      }
    });
  }, {
    rootMargin: '200px 0px', // Start loading 200px before video becomes visible
    threshold: 0.1
  });

  // Observe all videos for lazy loading
  videos.forEach(video => {
    lazyLoadObserver.observe(video);
  });
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
        
        // Play the current video if it has a source
        if (video.src) {
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

// On page load, setup lazy loading first, then shuffle videos, then setup autoplay
window.onload = function() {
  console.log('🚀 UDistrict page loading with lazy loading enabled');
  
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
  }, 200);
  
  // Log performance report on page unload
  window.addEventListener('beforeunload', () => {
    const report = performanceTracker.getReport();
    console.log('📊 Performance Report:', report);
  });
}; 