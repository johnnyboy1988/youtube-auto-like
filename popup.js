document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const statusText = document.getElementById('statusText');
    const videoStatus = document.getElementById('videoStatus');
    const likeStatus = document.getElementById('likeStatus');
    const manualLike = document.getElementById('manualLike');

    let isEnabled = true;

    // Carregar estado
    chrome.storage.local.get('youtube_auto_like_status', (result) => {
        isEnabled = result.youtube_auto_like_status !== false;
        updateUI(isEnabled);
    });

    // Toggle
    toggleSwitch.addEventListener('click', () => {
        isEnabled = !isEnabled;
        updateUI(isEnabled);
        
        chrome.storage.local.set({ 'youtube_auto_like_status': isEnabled });
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'toggleAutoLike',
                    enabled: isEnabled
                });
            }
        });
    });

    // Like manual
    manualLike.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'manualLike' });
            }
        });
    });

    function updateUI(enabled) {
        if (enabled) {
            toggleSwitch.classList.add('active');
            statusText.textContent = 'Ativado';
            statusText.className = 'value active';
        } else {
            toggleSwitch.classList.remove('active');
            statusText.textContent = 'Desativado';
            statusText.className = 'value inactive';
        }
        updateStatus();
    }

    function updateStatus() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url?.includes('youtube.com/watch')) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'getStatus' }, (response) => {
                    if (response) {
                        if (response.videoId) {
                            videoStatus.textContent = `🎬 ${response.videoId.substring(0, 8)}...`;
                        } else {
                            videoStatus.textContent = '🎬 Carregando...';
                        }
                        
                        if (response.liked) {
                            likeStatus.textContent = '❤️ Curtido!';
                            likeStatus.style.color = '#4CAF50';
                        } else if (response.enabled) {
                            likeStatus.textContent = '⏱️ Aguardando 20s...';
                            likeStatus.style.color = '#f39c12';
                        } else {
                            likeStatus.textContent = '⏸️ Desativado';
                            likeStatus.style.color = '#888';
                        }
                    }
                });
            } else {
                videoStatus.textContent = '📺 Nenhum vídeo';
                likeStatus.textContent = '⏸️ Aguardando';
                likeStatus.style.color = '#888';
            }
        });
    }

    setInterval(updateStatus, 3000);
});