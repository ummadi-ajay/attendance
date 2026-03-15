const video = document.getElementById('videoElement');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusMessage = document.getElementById('statusMessage');

let stream = null;

async function startCamera() {
    try {
        statusMessage.textContent = 'Requesting camera access...';
        
        // request access to both video and audio
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
        
        console.log('Camera stopped');
    }
}

startBtn.addEventListener('click', startCamera);
stopBtn.addEventListener('click', stopCamera);

// Handle page visibility change (optional but good practice)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && stream) {
        console.log('Page hidden, stopping camera for privacy');
        // Optional: stopCamera(); 
    }
});
