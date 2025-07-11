// Simulate live metric updates for demo
function animateMetric(id, start, end, duration) {
  let current = start;
  const increment = (end - start) / (duration / 50);
  const el = document.getElementById(id);
  const interval = setInterval(() => {
    current += increment;
    el.textContent = Math.floor(current);
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      el.textContent = end;
      clearInterval(interval);
    }
  }, 50);
}

// YouTube Shorts-style autoplay functionality
function setupVideoAutoplay() {
  const videos = document.querySelectorAll('.video-item video');
  let currentlyPlaying = null;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      
      if (entry.isIntersecting) {
        // Pause any currently playing video
        if (currentlyPlaying && currentlyPlaying !== video) {
          currentlyPlaying.pause();
        }
        
        // Play the current video
        video.play().catch(e => console.log('Autoplay prevented:', e));
        currentlyPlaying = video;
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
    
    // Add click to unmute functionality
    video.addEventListener('click', () => {
      if (video.muted) {
        video.muted = false;
        video.volume = 0.5;
      } else {
        video.muted = true;
      }
    });
  });
}

// Demo: animate metrics on page load
window.onload = function() {
  animateMetric('qr-scans', 124, 132, 2000);
  animateMetric('video-views', 892, 910, 2500);
  animateMetric('orders', 23, 27, 3000);
  
  // Setup video autoplay
  setupVideoAutoplay();
}; 