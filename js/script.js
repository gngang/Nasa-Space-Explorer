// Use this URL to fetch NASA APOD JSON data
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// Get references to DOM elements
const getImageBtn = document.getElementById('getImageBtn');
const gallery = document.getElementById('gallery');

// Array to store all fetched APOD data
let allApodData = [];

// Fun space facts for the bonus feature
const spaceFacts = [
  "A day on Venus is longer than its year!",
  "There are more stars in the universe than grains of sand on all of Earth's beaches.",
  "One million Earths could fit inside the Sun.",
  "Neutron stars can spin 600 times per second.",
  "There is a planet made of diamonds twice the size of Earth.",
  "The footprints on the Moon will last for 100 million years.",
  "Saturn's rings are mostly made of ice.",
  "A teaspoonful of neutron star would weigh 6 billion tons."
];

// Display a random space fact on page load
function displayRandomFact() {
  const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  const factElement = document.createElement('div');
  factElement.className = 'space-fact';
  factElement.innerHTML = `
    <strong>🌟 Did You Know?</strong>
    <p>${randomFact}</p>
  `;
  // Insert after header, before filters
  const header = document.querySelector('.site-header');
  header.insertAdjacentElement('afterend', factElement);
}

// Call the function when page loads
displayRandomFact();

// Function to fetch APOD data from the JSON file
async function fetchApodData() {
  try {
    // Show loading message
    showLoadingMessage();
    
    // Fetch data from the CDN URL
    const response = await fetch(apodData);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Store all the data
    allApodData = data;
    
    // Get 9 items based on selected date range
    const itemsToDisplay = getItemsInDateRange(data);
    
    // Display the gallery
    displayGallery(itemsToDisplay);
    
  } catch (error) {
    console.error('Error fetching APOD data:', error);
    gallery.innerHTML = `
      <div class="error-message">
        <p>❌ Failed to load space images. Please try again.</p>
      </div>
    `;
  }
}

// Function to show loading message
function showLoadingMessage() {
  gallery.innerHTML = `
    <div class="loading-message">
      <div class="loading-spinner">🌍</div>
      <p>Loading amazing space images...</p>
    </div>
  `;
}

// Function to get items within the selected date range
function getItemsInDateRange(data) {
  // Get the date inputs
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  
  // If no dates selected, return first 9 items
  if (!startDateInput || !endDateInput || !startDateInput.value || !endDateInput.value) {
    return data.slice(0, 9);
  }
  
  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);
  
  // Filter items within date range
  const filtered = data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
  
  // Return up to 9 items
  return filtered.slice(0, 9);
}

// Function to display gallery items
function displayGallery(items) {
  // Clear the gallery
  gallery.innerHTML = '';
  
  // Check if we have items to display
  if (items.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔭</div>
        <p>No images found for this date range. Try different dates!</p>
      </div>
    `;
    return;
  }
  
  // Create a gallery item for each APOD entry
  items.forEach(item => {
    const galleryItem = createGalleryItem(item);
    gallery.appendChild(galleryItem);
  });
}

// Function to create a single gallery item
function createGalleryItem(item) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'gallery-item';
  
  // Determine if this is a video or image
  const isVideo = item.media_type === 'video';
  
  // Create the media element (image or video thumbnail)
  let mediaHTML = '';
  if (isVideo) {
    // For videos, show the thumbnail or a play icon
    const thumbnail = item.thumbnail_url || 'https://img.youtube.com/vi/default.jpg';
    mediaHTML = `
      <div class="video-container">
        <img src="${thumbnail}" alt="${item.title}">
        <div class="play-icon">▶️</div>
      </div>
    `;
  } else {
    // For images, show the regular image
    mediaHTML = `<img src="${item.url}" alt="${item.title}">`;
  }
  
  // Build the HTML for the gallery item
  itemDiv.innerHTML = `
    ${mediaHTML}
    <h3>${item.title}</h3>
    <p class="date">${formatDate(item.date)}</p>
  `;
  
  // Add click event to open modal
  itemDiv.addEventListener('click', () => openModal(item));
  
  return itemDiv;
}

// Function to format date to a more readable format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Function to open modal with full details
function openModal(item) {
  // Create modal element
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  // Determine if this is a video or image
  const isVideo = item.media_type === 'video';
  
  // Create the modal content
  let mediaHTML = '';
  if (isVideo) {
    // For videos, embed the YouTube video
    mediaHTML = `
      <div class="modal-video">
        <iframe 
          src="${item.url}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `;
  } else {
    // For images, show the HD version if available
    const imageUrl = item.hdurl || item.url;
    mediaHTML = `<img src="${imageUrl}" alt="${item.title}">`;
  }
  
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn">&times;</span>
      ${mediaHTML}
      <div class="modal-info">
        <h2>${item.title}</h2>
        <p class="modal-date">${formatDate(item.date)}</p>
        <p class="modal-explanation">${item.explanation}</p>
        ${item.copyright ? `<p class="copyright">© ${item.copyright}</p>` : ''}
      </div>
    </div>
  `;
  
  // Add modal to the page
  document.body.appendChild(modal);
  
  // Close modal when clicking the X button
  const closeBtn = modal.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Close modal when clicking outside the content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Add event listener to the fetch button
getImageBtn.addEventListener('click', fetchApodData);
