// Restaurant redirect function
function redirectToRestaurant(restaurantId) {
  // Redirect to the restaurant page
  console.log(`Redirecting to restaurant: ${restaurantId}`);

  // Restaurant URLs mapping
  const restaurantUrls = {
    'thai2go': 'thai2go.html',
    // You can add other restaurants here later
  };

  if (restaurantUrls[restaurantId]) {
    // Redirect to the restaurant page
    window.location.href = restaurantUrls[restaurantId];
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

// On page load, setup video autoplay
window.onload = function() {
  setupVideoAutoplay();
}; 