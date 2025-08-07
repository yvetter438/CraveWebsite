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

// Simple video setup - no optimization, just mobile-friendly attributes
function setupVideos() {
  const videos = document.querySelectorAll('.video-item video');
  const videoArray = Array.from(videos);
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  console.log(`📱 Device detected: ${isMobile ? 'Mobile' : 'Desktop'}`);
  
  // Setup mobile-specific attributes for all videos
  videos.forEach((video, index) => {
    if (isMobile) {
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('x5-playsinline', '');
      video.setAttribute('x5-video-player-type', 'h5');
      video.setAttribute('x5-video-player-fullscreen', 'false');
    }
    
    // Track when videos are loaded
    if (video.readyState >= 2) { // Already loaded
      performanceTracker.trackVideoLoad(video, 0);
    } else {
      video.addEventListener('loadeddata', () => {
        performanceTracker.trackVideoLoad(video, 0);
      }, { once: true });
    }
  });
  
  console.log(`✅ Setup complete for ${videos.length} videos`);
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

// Simple autoplay functionality
function setupVideoAutoplay() {
  const videos = document.querySelectorAll('.video-item video');
  let currentlyPlaying = null;
  let globalMuted = true;
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const observerOptions = {
    threshold: 0.5, // Video must be 50% visible to play
    rootMargin: '0px 0px -10% 0px' // Slight buffer for better UX
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

// On page load, setup videos, shuffle, then setup autoplay
window.onload = function() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  console.log(`🚀 UDistrict page loading - Simple approach for ${isMobile ? 'Mobile' : 'Desktop'}`);
  
  // Setup videos first
  setupVideos();
  
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