// Restaurant redirect function
function redirectToRestaurant(restaurantId) {
  console.log(`Redirecting to restaurant: ${restaurantId}`);
  const restaurantUrls = {
    'phoshizzle': 'phoshizzle.html'
  };
  if (restaurantUrls[restaurantId]) {
    window.location.href = restaurantUrls[restaurantId];
  }
}

// YouTube Shorts-style autoplay functionality
function setupVideoAutoplay() {
  const videos = document.querySelectorAll('video');
  const options = { threshold: 0.6 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.muted = true;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }, options);

  videos.forEach((video) => observer.observe(video));
}

window.onload = function () {
  window.scrollTo(0, 0);
  setTimeout(setupVideoAutoplay, 200);
}; 