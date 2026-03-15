const video = document.getElementById('videoElement');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const captureBtn = document.getElementById('captureBtn');
const canvas = document.getElementById('canvas');
const gallery = document.getElementById('gallery');
const statusMessage = document.getElementById('statusMessage');
const clearGalleryBtn = document.getElementById('clearGallery');

let stream = null;
const STORAGE_KEY = 'webcam_gallery';

// Load gallery from Local Storage
function loadGallery() {
    const photos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    gallery.innerHTML = '';
    photos.forEach((photoData, index) => {
        addPhotoToUI(photoData, index);
    });
}

function addPhotoToUI(dataUrl, index) {
    const card = document.createElement('div');
    card.className = 'photo-card glass';
    card.innerHTML = `
        <img src="${dataUrl}" alt="Captured Photo ${index + 1}">
        <div class="photo-overlay">
            <div class="download-icon">⬇️</div>
        </div>
    `;
    
    card.addEventListener('click', () => downloadImage(dataUrl, `capture_${index + 1}.png`));
    gallery.prepend(card);
}

function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
}

async function startCamera() {
    try {
        statusMessage.textContent = 'Requesting camera access...';
        
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }, 
            audio: false 
        });
        
        video.srcObject = stream;
        video.style.display = 'block';
        statusMessage.style.display = 'none';
        
        startBtn.disabled = true;
        stopBtn.disabled = false;
        captureBtn.disabled = false;
        
        console.log('Camera started successfully');
    } catch (err) {
        console.error('Error accessing camera:', err);
        statusMessage.textContent = `Error: ${err.message}`;
        statusMessage.style.color = '#ef4444';
    }
}

function stopCamera() {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        
        video.srcObject = null;
        video.style.display = 'none';
        statusMessage.style.display = 'block';
        statusMessage.textContent = 'Camera is off';
        statusMessage.style.color = 'var(--text-muted)';
        
        startBtn.disabled = false;
        stopBtn.disabled = true;
        captureBtn.disabled = true;
        
        console.log('Camera stopped');
    }
}

function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to Image Data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Save to Local Storage
    const photos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    photos.push(dataUrl);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    
    // Add to UI
    addPhotoToUI(dataUrl, photos.length - 1);
    
    // Visual feedback (flash effect)
    video.style.opacity = '0.5';
    setTimeout(() => video.style.opacity = '1', 100);
}

function clearGallery() {
    if (confirm('Are you sure you want to clear your gallery?')) {
        localStorage.removeItem(STORAGE_KEY);
        loadGallery();
    }
}

startBtn.addEventListener('click', startCamera);
stopBtn.addEventListener('click', stopCamera);
captureBtn.addEventListener('click', capturePhoto);
clearGalleryBtn.addEventListener('click', clearGallery);

// Initialize gallery on load
loadGallery();

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && stream) {
        // Option to stop camera on hide
    }
});
