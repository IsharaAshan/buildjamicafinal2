document.addEventListener('DOMContentLoaded', function() {
    // Get the canvas element
    const ctx = document.getElementById('budgetPieChart').getContext('2d');
    
    // Button click sound elements
    const clickSound = document.getElementById('clickSound');
    const pieClickSound = document.getElementById('pieClickSound');
    
    // Function to play button click sound
    function playClickSound() {
        clickSound.currentTime = 0; // Rewind to start
        clickSound.play().catch(error => {
            console.log("Sound play prevented:", error);
        });
    }
    
    // Function to play pie chart click sound
    function playPieClickSound() {
        pieClickSound.currentTime = 0; // Rewind to start
        pieClickSound.play().catch(error => {
            console.log("Pie click sound play prevented:", error);
        });
    }
    
    // Budget constants and variables
    const TOTAL_BUDGET = 110; // 110 billion

    // Reset budget data on page load - Set all initial values to 1B minimum
    const initialBudgetData = {
        Health: 1,
        Education: 1,
        Security: 1,
        Infrastructure: 1,
        Debt: 1
    };

    // Add a constant for what the country needs (fixed reference values - keep these unchanged)
    const COUNTRY_NEEDS = {
        Health: 50,
        Education: 40,
        Security: 40,
        Infrastructure: 40,
        Debt: 30
    };

    // Clear any stored data and reset to initial values
    localStorage.removeItem('budgetData');
    let budgetData = {...initialBudgetData};
    
    // Modal elements
    const modal = document.getElementById('budgetModal');
    const modalTitle = document.getElementById('modalSectorTitle');
    const budgetInput = document.getElementById('budgetInput');
    const saveButton = document.getElementById('saveBudget');
    const cancelButton = document.getElementById('cancelBudget');
    const closeButton = document.querySelector('.close-button');
    
    // Error modal elements
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const errorOkButton = document.getElementById('errorOkButton');
    const errorCloseButton = document.querySelector('.error-close-button');
    
    // Function to show error modal
    function showErrorModal(message) {
        // Play click sound for feedback
        playClickSound();
        
        // Update error message
        errorMessage.textContent = message;
        
        // Show the error modal
        errorModal.style.display = 'block';
        
        // Get current game scale
        const wrapper = document.querySelector('.main-wrapper');
        const transform = wrapper.style.transform;
        const scale = transform ? parseFloat(transform.replace('scale(', '').replace(')', '')) : 1;
        
        // Apply scaling to error modal
        setTimeout(() => {
            const errorModalContent = document.querySelector('.error-modal-content');
            if (errorModalContent) {
                errorModalContent.style.transform = `scale(${scale})`;
                errorModalContent.style.transformOrigin = 'center center';
            }
        }, 10);
    }
    
    // Function to close error modal
    function closeErrorModal() {
        errorModal.style.display = 'none';
    }
    
    // Error modal event listeners
    errorOkButton.addEventListener('click', closeErrorModal);
    errorCloseButton.addEventListener('click', closeErrorModal);
    
    window.addEventListener('click', function(event) {
        if (event.target === errorModal) {
            closeErrorModal();
        }
    });
    
    let currentSector = '';
    
    // Data for the pie chart
    const chartData = {
        labels: Object.keys(budgetData),
        datasets: [{
            data: Object.values(budgetData),
            backgroundColor: [
                '#FF6384', // Health - Red
                '#36A2EB', // Education - Blue
                '#FFCE56', // Debt - Yellow
                '#4BC0C0', // Security - Turquoise
                '#9966FF'  // Infrastructure - Purple
            ],
            borderColor: 'white',
            borderWidth: 2
        }]
    };
    
    // Calculate remaining funds (but no longer update display since element is removed)
    function updateRemainingFunds() {
        const allocated = Object.values(budgetData).reduce((sum, value) => sum + value, 0);
        const remaining = TOTAL_BUDGET - allocated;
        return remaining; // Return the value in case it's needed elsewhere
    }
    
    // Configuration options
    const config = {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 50, // Reduced top padding to give more space for the chart
                    bottom: 10, // Minimal bottom padding 
                    left: 0,   // Remove left padding
                    right: 0   // Remove right padding
                }
            },
            plugins: {
                legend: {
                    display: true,  // Keep legend visible
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14// Keep original font size
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: $${value} Billion`;
                        }
                    }
                },
                // Configure datalabels properly
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 14 // Keep original font size
                    },
                    formatter: function(value, context) {
                        return [
                            context.chart.data.labels[context.dataIndex],
                            `$${value}B`
                        ];
                    },
                    textAlign: 'center',
                    align: 'center'
                }
            },
            radius: '95%', // Increased from 90% to make pie chart larger
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    // Play pie chart click sound
                    playPieClickSound();
                    
                    const index = elements[0].index;
                    const sector = chartData.labels[index];
                    openModal(sector);
                }
            }
        },
        plugins: [ChartDataLabels]  // Properly register plugin here instead
    };
    
    // Create the pie chart
    const budgetChart = new Chart(ctx, config);
    
    // Function to update sector values in the "What the Country Needs" section
    function updateSectorValues() {
        // Display fixed "needs" values instead of current allocations
        document.getElementById('health-value').textContent = `$${COUNTRY_NEEDS.Health}B`;
        document.getElementById('education-value').textContent = `$${COUNTRY_NEEDS.Education}B`;
        document.getElementById('security-value').textContent = `$${COUNTRY_NEEDS.Security}B`;
        document.getElementById('infrastructure-value').textContent = `$${COUNTRY_NEEDS.Infrastructure}B`;
        document.getElementById('debt-value').textContent = `$${COUNTRY_NEEDS.Debt}B`;
    }
    
    // Update chart data
    function updateChart() {
        // Create display data that replaces zeros with minimal values for visual representation
        const displayData = Object.values(budgetData).map(value => value === 0 ? 0.1 : value);
        
        budgetChart.data.datasets[0].data = displayData;
        budgetChart.update();
        updateSectorValues(); // Update sector values when chart updates
        updateRemainingFunds(); // Also update the remaining funds display
    }
    
    // Modal functions
    function openModal(sector) {
        currentSector = sector;
        modalTitle.textContent = sector;
        budgetInput.value = budgetData[sector];
        modal.style.display = 'block';
        
        // Get current game scale
        const wrapper = document.querySelector('.main-wrapper');
        const transform = wrapper.style.transform;
        const scale = transform ? parseFloat(transform.replace('scale(', '').replace(')', '')) : 1;
        
        // Apply scaling to modal with improved positioning
        setTimeout(() => {
            const modalContent = document.querySelector('.modal-content');
            if (modalContent) {
                // Apply the same scale to modal content
                modalContent.style.transform = `scale(${scale})`;
                
                // Apply transform-origin for proper scaling from center
                modalContent.style.transformOrigin = 'center center';
                
                // Update position for better centering
                modalContent.style.position = 'relative';
                modalContent.style.margin = '15vh auto';
            }
        }, 10);
    }
    
    function closeModal() {
        modal.style.display = 'none';
    }
    
    // Event listeners for modal
    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    
    saveButton.addEventListener('click', function() {
        // Sound is handled by the general click handler above
        const newValue = parseInt(budgetInput.value);
        if (isNaN(newValue) || newValue < 1) {
            showErrorModal('Please enter a valid number of at least 1 billion');
            return;
        }
        
        const currentAllocated = Object.values(budgetData).reduce((sum, value) => 
            sum + (value === budgetData[currentSector] ? 0 : value), 0);
        
        if (currentAllocated + newValue > TOTAL_BUDGET) {
            showErrorModal(`Cannot allocate more than $${TOTAL_BUDGET} Billion total. Available: $${TOTAL_BUDGET - currentAllocated} Billion`);
            return;
        }
        
        budgetData[currentSector] = newValue;
        updateChart();
        updateRemainingFunds();
        closeModal();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Reset button functionality
    document.getElementById('resetButton').addEventListener('click', function() {
        budgetData = {...initialBudgetData};
        updateChart();
        updateRemainingFunds();
        updateSectorValues(); // Ensure sector values are updated on reset
    });
    
    // Initialize remaining funds and sector values
    updateRemainingFunds();
    updateSectorValues(); // Initialize sector values when page loads

    // Force chart update on initial load to properly show zero values as minimal segments
    updateChart();

    // Video modal elements
    const videoModal = document.getElementById('videoModal');
    const videoModalTitle = document.getElementById('videoModalTitle');
    const sectorVideo = document.getElementById('sectorVideo');
    const videoCloseButton = document.querySelector('.video-close-button');
    
    // Video paths
    const VIDEO_PATHS = {
        // Path to short videos for each sector
        // For now using the same short video for all sectors as requested
        shortVideos: {
            Health: './video/short-videos/helath_short.mp4',
            Education: './video/short-videos/helath_short.mp4', // Using health video as placeholder
            Security: './video/short-videos/helath_short.mp4', // Using health video as placeholder
            Infrastructure: './video/short-videos/helath_short.mp4', // Using health video as placeholder
            Debt: './video/short-videos/helath_short.mp4' // Using health video as placeholder
        },
        // Path to economy video for submit button
        economyVideo: './video/long-videos/economy.mp4'
    };
    
    // Track currently playing hologram video
    let currentHologramVideo = null;
    
    // Function to create hologram effect for sector videos
    function playSectorHologram(buttonElement, sector) {
        // Remove any existing hologram video first
        if (currentHologramVideo && document.body.contains(currentHologramVideo)) {
            document.body.removeChild(currentHologramVideo);
            currentHologramVideo = null;
        }
        
        // Get the position of the button
        const buttonRect = buttonElement.getBoundingClientRect();
        
        // Create a new video element for the hologram
        const hologramVideo = document.createElement('video');
        hologramVideo.classList.add('hologram-video');
        hologramVideo.width = 320; // Width for good visibility
        hologramVideo.controls = true;
        hologramVideo.autoplay = true;
        
        // Set up the source for the video
        const source = document.createElement('source');
        source.src = VIDEO_PATHS.shortVideos[sector];
        source.type = 'video/mp4';
        hologramVideo.appendChild(source);
        
        // Position the hologram video to the right of the button instead of left
        // Calculate right position (button right edge plus spacing)
        const rightPosition = buttonRect.right + 20;
        
        // Use fixed positioning with right side alignment
        hologramVideo.style.left = rightPosition + 'px';
        hologramVideo.style.top = (buttonRect.top + buttonRect.height/2) + 'px';
        hologramVideo.style.transform = 'translateY(-50%)'; // Center vertically relative to button
        
        // Add to the body and track the current video
        document.body.appendChild(hologramVideo);
        currentHologramVideo = hologramVideo;
        
        // Set up event listener for when the video ends
        hologramVideo.addEventListener('ended', function() {
            if (document.body.contains(hologramVideo)) {
                document.body.removeChild(hologramVideo);
                currentHologramVideo = null;
            }
        });
        
        // Allow closing by clicking on the video
        hologramVideo.addEventListener('click', function() {
            if (document.body.contains(hologramVideo)) {
                document.body.removeChild(hologramVideo);
                currentHologramVideo = null;
            }
        });
    }
    
    // Video modal handling
    function openVideoModal() {
        videoModal.style.display = 'block';
        
        // Get current game scale
        const wrapper = document.querySelector('.main-wrapper');
        const transform = wrapper.style.transform;
        const scale = transform ? parseFloat(transform.replace('scale(', '').replace(')', '')) : 1;
        
        // Apply scaling to video modal with improved positioning
        setTimeout(() => {
            const videoModalContent = document.querySelector('.video-modal-content');
            if (videoModalContent) {
                // Apply the same scale to video modal content
                videoModalContent.style.transform = `scale(${scale})`;
                
                // Apply transform-origin for proper scaling from center
                videoModalContent.style.transformOrigin = 'center center';
                
                // Update position for better centering
                videoModalContent.style.position = 'relative';
                videoModalContent.style.margin = '10vh auto';
            }
        }, 10);
    }
    
    // Function to play sector video
    function playSectorVideo(sector, buttonElement = null) {
        // Use hologram effect for all sectors when a button element is provided
        if (buttonElement) {
            playSectorHologram(buttonElement, sector);
            return;
        }
        
        // Fall back to modal for pie chart clicks (no button element)
        videoModalTitle.textContent = `${sector} Information`;
        sectorVideo.src = VIDEO_PATHS.shortVideos[sector];
        openVideoModal(); // Use the new function instead of directly setting display
        sectorVideo.load();
        
        // Auto play when ready
        sectorVideo.oncanplaythrough = function() {
            sectorVideo.play().catch(error => {
                console.log("Auto-play prevented by browser:", error);
            });
        };
    }
    
    // Function to play economy video (for submit button)
    function playEconomyVideo() {
        videoModalTitle.textContent = 'Jamaica You Built!';
        sectorVideo.src = VIDEO_PATHS.economyVideo;
        openVideoModal(); // Use the new function instead of directly setting display
        sectorVideo.load();
        
        sectorVideo.oncanplaythrough = function() {
            sectorVideo.play().catch(error => {
                console.log("Auto-play prevented by browser:", error);
            });
        };
    }
    
    // Close video modal
    function closeVideoModal() {
        videoModal.style.display = 'none';
        sectorVideo.pause();
        sectorVideo.currentTime = 0; // Reset video position
        
        // Stop video by removing source
        sectorVideo.removeAttribute('src');
        sectorVideo.load();
        
        // Also stop and remove any hologram videos
        if (currentHologramVideo && document.body.contains(currentHologramVideo)) {
            currentHologramVideo.pause();
            currentHologramVideo.currentTime = 0;
            document.body.removeChild(currentHologramVideo);
            currentHologramVideo = null;
        }
    }
    
    // Event listeners for sector buttons to play videos
    document.querySelectorAll('.sector-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            // Sound is handled by the general click handler above
            const sectorTitle = this.parentElement.querySelector('.sector-title').textContent;
            e.stopPropagation(); // Prevent bubbling to avoid triggering other events
            
            // Play the sector video with hologram effect for Health
            playSectorVideo(sectorTitle, this);
        });
    });
    
    // Submit button now plays economy video
    document.querySelector('.submit-btn').addEventListener('click', function() {
        // Sound is handled by the general click handler above
        playEconomyVideo();
    });
    
    // Video modal close events
    videoCloseButton.addEventListener('click', closeVideoModal);
    
    // Close when clicking outside the video content
    window.addEventListener('click', function(event) {
        if (event.target === videoModal) {
            closeVideoModal();
        }
    });
    
    // Initialize remaining funds and sector values
    updateRemainingFunds();
    updateSectorValues();
    
    // Add click sound to buttons including error modal buttons
    document.querySelectorAll('.sector-btn, .submit-btn, #resetButton, #saveBudget, #cancelBudget, .close-button, .video-close-button, #errorOkButton, .error-close-button').forEach(button => {
        button.addEventListener('click', playClickSound);
    });
    
    // Note: Comment out the original sector button event listener to avoid conflicts
    /*
    document.querySelectorAll('.sector-btn').forEach(button => {
        button.addEventListener('click', function() {
            const sectorTitle = this.parentElement.querySelector('.sector-title').textContent;
            openModal(sectorTitle);
        });
    });
    */
});
