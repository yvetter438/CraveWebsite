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

// Swipe functionality for mobile and desktop
function setupSwipeFunctionality() {
  const videoItems = document.querySelectorAll('.video-item[data-swipeable="true"]');
  
  videoItems.forEach(item => {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let isDragging = false;
    
    // Touch events for mobile
    item.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
    });
    
    item.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      const deltaY = Math.abs(e.touches[0].clientY - startY);
      
      // Only allow horizontal swipes
      if (deltaY > 50) return;
      
      if (deltaX > 50) {
        item.style.transform = `translateX(${Math.min(deltaX, 100)}px)`;
      }
    });
    
    item.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      
      const deltaX = currentX - startX;
      
      if (deltaX > 100) {
        // Swipe right - show order overlay
        item.classList.add('swiped');
        setTimeout(() => {
          item.classList.remove('swiped');
          item.style.transform = '';
        }, 3000); // Auto-hide after 3 seconds
      } else {
        // Reset position
        item.style.transform = '';
      }
      
      isDragging = false;
    });
    
    // Mouse events for desktop
    item.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
      isDragging = true;
      item.style.cursor = 'grabbing';
    });
    
    item.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      currentX = e.clientX;
      const deltaX = currentX - startX;
      const deltaY = Math.abs(e.clientY - startY);
      
      // Only allow horizontal swipes
      if (deltaY > 50) return;
      
      if (deltaX > 50) {
        item.style.transform = `translateX(${Math.min(deltaX, 100)}px)`;
      }
    });
    
    item.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      
      const deltaX = currentX - startX;
      
      if (deltaX > 100) {
        // Swipe right - show order overlay
        item.classList.add('swiped');
        setTimeout(() => {
          item.classList.remove('swiped');
          item.style.transform = '';
        }, 3000); // Auto-hide after 3 seconds
      } else {
        // Reset position
        item.style.transform = '';
      }
      
      isDragging = false;
      item.style.cursor = 'grab';
    });
    
    // Prevent default drag behavior
    item.addEventListener('dragstart', (e) => e.preventDefault());
  });
}

// Demo: animate metrics on page load
window.onload = function() {
  animateMetric('qr-scans', 124, 132, 2000);
  animateMetric('video-views', 892, 910, 2500);
  animateMetric('orders', 23, 27, 3000);
  
  // Setup video autoplay
  setupVideoAutoplay();
  
  // Setup swipe functionality
  setupSwipeFunctionality();
}; 