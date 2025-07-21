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

// On page load, setup video autoplay
window.onload = function() {
  setupVideoAutoplay();
}; 