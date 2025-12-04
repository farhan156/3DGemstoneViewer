/* ==========================================
   GEMSTONE 360° DASHBOARD
   JavaScript Functionality
   ========================================== */

(function() {
    'use strict';
    
    // ==========================================
    // NAVIGATION SYSTEM
    // ==========================================
    const initNavigation = () => {
        const navItems = document.querySelectorAll('.nav-item');
        const pages = document.querySelectorAll('.page');
        const actionCards = document.querySelectorAll('.action-card');
        
        // Navigation click handler
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = item.dataset.page;
                navigateToPage(targetPage);
            });
        });
        
        // Quick action cards navigation
        actionCards.forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                switch(action) {
                    case 'upload':
                        navigateToPage('upload');
                        break;
                    case 'certificate':
                        navigateToPage('certificates');
                        break;
                    case 'generate':
                        navigateToPage('generate');
                        break;
                    case 'share':
                        copyShareLink();
                        break;
                }
            });
        });
        
        // Navigate to page function
        const navigateToPage = (pageId) => {
            // Update active navigation
            navItems.forEach(item => item.classList.remove('active'));
            const activeNav = document.querySelector(`[data-page="${pageId}"]`);
            if (activeNav) activeNav.classList.add('active');
            
            // Show target page
            pages.forEach(page => page.classList.remove('active'));
            const targetPage = document.getElementById(`page-${pageId}`);
            if (targetPage) targetPage.classList.add('active');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        
        // Handle browser back/forward
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            if (hash) navigateToPage(hash);
        });
        
        // Initial page load
        const initialHash = window.location.hash.slice(1);
        if (initialHash) navigateToPage(initialHash);
    };
    
    // ==========================================
    // FILE UPLOAD SYSTEM
    // ==========================================
    const initUploadSystem = () => {
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('fileInput');
        const framesPreview = document.getElementById('framesPreview');
        const frameCount = document.getElementById('frameCount');
        const sequenceStatus = document.getElementById('sequenceStatus');
        const generateBtn = document.getElementById('generateBtn');
        
        if (!dropzone) return;
        
        let uploadedFiles = [];
        
        // Click to browse
        dropzone.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Drag and drop handlers
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });
        
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('drag-over');
        });
        
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            handleFiles(e.dataTransfer.files);
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });
        
        // Handle uploaded files
        const handleFiles = (files) => {
            uploadedFiles = Array.from(files).filter(file => 
                file.type.startsWith('image/')
            );
            
            if (uploadedFiles.length === 0) {
                showNotification('Please select valid image files', 'error');
                return;
            }
            
            displayFrames();
            updateUploadInfo();
        };
        
        // Display frame thumbnails
        const displayFrames = () => {
            framesPreview.innerHTML = '';
            framesPreview.style.display = 'flex';
            
            uploadedFiles.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const frameThumb = document.createElement('div');
                    frameThumb.className = 'frame-thumb';
                    frameThumb.innerHTML = `
                        <img src="${e.target.result}" alt="Frame ${index + 1}">
                        <span class="frame-number">${index + 1}</span>
                    `;
                    framesPreview.appendChild(frameThumb);
                };
                reader.readAsDataURL(file);
            });
        };
        
        // Update upload information
        const updateUploadInfo = () => {
            frameCount.textContent = uploadedFiles.length;
            
            // Check sequence (basic check for frame count)
            if (uploadedFiles.length >= 36) {
                sequenceStatus.textContent = 'Valid sequence';
                sequenceStatus.style.color = 'var(--pure-white)';
                generateBtn.disabled = false;
            } else {
                sequenceStatus.textContent = `Need ${36 - uploadedFiles.length} more frames`;
                sequenceStatus.style.color = 'var(--smoke)';
                generateBtn.disabled = true;
            }
        };
        
        // Generate button
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                generateBtn.disabled = true;
                generateBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="9" cy="9" r="6"/>
                        <path d="M9 5V13M5 9H13"/>
                    </svg>
                    Processing...
                `;
                
                // Simulate processing
                setTimeout(() => {
                    showNotification('360° model generated successfully!', 'success');
                    
                    // Navigate to viewer after 1 second
                    setTimeout(() => {
                        window.location.hash = 'generate';
                    }, 1000);
                }, 2000);
            });
        }
    };
    
    // ==========================================
    // CERTIFICATE UPLOAD
    // ==========================================
    const initCertificateUpload = () => {
        const certDropzone = document.querySelector('.certificate-dropzone');
        const certPreview = document.getElementById('certPreview');
        
        if (!certDropzone) return;
        
        const certInput = certDropzone.querySelector('input[type="file"]');
        
        certDropzone.addEventListener('click', () => {
            certInput.click();
        });
        
        certInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                displayCertificatePreview(file);
            }
        });
        
        const displayCertificatePreview = (file) => {
            certPreview.style.display = 'flex';
            certPreview.querySelector('.preview-name').textContent = file.name;
            certPreview.querySelector('.preview-size').textContent = formatFileSize(file.size);
        };
    };
    
    // ==========================================
    // VIEWER INTERACTIONS
    // ==========================================
    const initViewerControls = () => {
        const viewer = document.getElementById('gemstone-viewer');
        const controlButtons = document.querySelectorAll('.control-btn');
        
        if (!viewer) return;
        
        let isDragging = false;
        let startX = 0;
        let currentRotation = 0;
        
        // Mouse drag to rotate
        viewer.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            viewer.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            currentRotation += deltaX * 0.5;
            startX = e.clientX;
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            if (viewer) viewer.style.cursor = 'grab';
        });
        
        // Control buttons
        controlButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const title = btn.getAttribute('title');
                if (title.includes('Left')) {
                    currentRotation -= 45;
                } else if (title.includes('Right')) {
                    currentRotation += 45;
                } else if (title.includes('Reset')) {
                    currentRotation = 0;
                }
            });
        });
    };
    
    // ==========================================
    // SHARE LINK FUNCTIONALITY
    // ==========================================
    const initShareLinks = () => {
        const shareInputs = document.querySelectorAll('.share-input');
        const copyButtons = document.querySelectorAll('.btn-icon[title="Copy Link"]');
        
        copyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const input = btn.parentElement.querySelector('.share-input');
                if (input) {
                    copyToClipboard(input.value);
                } else {
                    copyShareLink();
                }
            });
        });
    };
    
    const copyShareLink = () => {
        const link = 'https://gem.view/ruby-3.24ct';
        copyToClipboard(link);
    };
    
    const copyToClipboard = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('Link copied to clipboard!', 'success');
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showNotification('Link copied to clipboard!', 'success');
        }
    };
    
    // ==========================================
    // TABLE INTERACTIONS
    // ==========================================
    const initTableActions = () => {
        const tableButtons = document.querySelectorAll('.gems-table .btn-icon');
        
        tableButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const title = btn.getAttribute('title');
                
                if (title?.includes('360')) {
                    window.location.hash = 'generate';
                } else if (title?.includes('Certificate')) {
                    showNotification('Opening certificate...', 'info');
                }
            });
        });
    };
    
    // ==========================================
    // GALLERY CARD ACTIONS
    // ==========================================
    const initGalleryCards = () => {
        const galleryCards = document.querySelectorAll('.gem-card');
        
        galleryCards.forEach(card => {
            const viewBtn = card.querySelector('.btn-card');
            
            if (viewBtn && !viewBtn.classList.contains('disabled')) {
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.location.hash = 'generate';
                });
            }
            
            // Other card buttons
            const cardBtns = card.querySelectorAll('.btn-icon');
            cardBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const title = btn.getAttribute('title');
                    
                    if (title?.includes('Certificate')) {
                        showNotification('Opening certificate...', 'info');
                    } else if (title?.includes('Copy')) {
                        copyShareLink();
                    } else if (title?.includes('Edit')) {
                        showNotification('Edit functionality coming soon', 'info');
                    }
                });
            });
        });
    };
    
    // ==========================================
    // NOTIFICATION SYSTEM
    // ==========================================
    const showNotification = (message, type = 'info') => {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 16px 24px;
                    background: var(--carbon);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: var(--pure-white);
                    font-size: 14px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                    min-width: 300px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                }
                
                .notification-success {
                    border-left: 3px solid var(--pure-white);
                }
                
                .notification-error {
                    border-left: 3px solid #dc3545;
                }
                
                .notification-info {
                    border-left: 3px solid var(--metallic-silver);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                }
                
                .notification-close {
                    background: transparent;
                    border: none;
                    color: var(--pure-white);
                    font-size: 24px;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                    line-height: 1;
                    padding: 0;
                }
                
                .notification-close:hover {
                    opacity: 1;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    };
    
    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };
    
    // ==========================================
    // SMOOTH SCROLL FOR TABLES
    // ==========================================
    const initSmoothScroll = () => {
        const tables = document.querySelectorAll('.table-container');
        
        tables.forEach(table => {
            let isScrolling = false;
            let startX;
            let scrollLeft;
            
            table.addEventListener('mousedown', (e) => {
                if (e.target.closest('button')) return;
                isScrolling = true;
                startX = e.pageX - table.offsetLeft;
                scrollLeft = table.scrollLeft;
            });
            
            table.addEventListener('mouseleave', () => {
                isScrolling = false;
            });
            
            table.addEventListener('mouseup', () => {
                isScrolling = false;
            });
            
            table.addEventListener('mousemove', (e) => {
                if (!isScrolling) return;
                e.preventDefault();
                const x = e.pageX - table.offsetLeft;
                const walk = (x - startX) * 2;
                table.scrollLeft = scrollLeft - walk;
            });
        });
    };
    
    // ==========================================
    // INITIALIZE ALL SYSTEMS
    // ==========================================
    const init = () => {
        initNavigation();
        initUploadSystem();
        initCertificateUpload();
        initViewerControls();
        initShareLinks();
        initTableActions();
        initGalleryCards();
        initSmoothScroll();
        
        console.log('✨ Gemstone Dashboard initialized');
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
