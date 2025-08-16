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

// Restaurant redirect function
function redirectToRestaurant(restaurantId) {
  // Redirect to the restaurant page
  console.log(`Redirecting to restaurant: ${restaurantId}`);

  // Restaurant URLs mapping
  const restaurantUrls = {
    'thai2go': 'thai2go.html',
    'solonoodle': 'solonoodle.html',
    'angkorwok': 'angkorwok.html',
    'sweetalchemy': 'sweetalchemy.html',
    'phoshizzle': 'phoshizzle.html'
  };

  if (restaurantUrls[restaurantId]) {
    // Redirect to the restaurant page
    window.location.href = restaurantUrls[restaurantId];
  }
}

// On page load, shuffle videos first, then setup autoplay
window.onload = function() {
  // Shuffle videos first
  shuffleVideos();
  
  // Force scroll to top and disable scroll snap temporarily
  const videoFeed = document.querySelector('.video-feed');
  videoFeed.style.scrollSnapType = 'none';
  
  // Scroll to top
  window.scrollTo(0, 0);
  videoFeed.scrollTop = 0;
  
  // Re-enable scroll snap after a brief delay
  setTimeout(() => {
    videoFeed.style.scrollSnapType = 'y mandatory';
    setupVideoAutoplay();
  }, 200);
}; 