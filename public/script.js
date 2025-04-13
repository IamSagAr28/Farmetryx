// Navigation
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        
        // Update active link
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show target section
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(targetId);
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
    });
});

// Market Prices Section
const searchBtn = document.getElementById('search-btn');
const cropSearch = document.getElementById('crop-search');
const stateSelect = document.getElementById('state-select');
const priceTableBody = document.getElementById('price-table-body');
const marketLoadingIndicator = document.getElementById('loading-indicator');

// Indian States List
const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
    "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Populate state dropdown
function populateStateList() {
    const stateSelect = document.getElementById('state-select');
    stateSelect.innerHTML = '<option value="">All States</option>';
    
    indianStates.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
}

// Initialize state dropdown
populateStateList();

// API Configuration
const API_BASE_URL = window.location.origin;

// Market Price Checker
const marketPriceForm = document.getElementById('market-price-form');
const priceError = document.getElementById('price-error');

marketPriceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const crop = document.getElementById('crop').value.trim();
    const state = document.getElementById('state').value;
    
    if (!crop) {
        priceError.textContent = 'Please enter a crop name';
        priceError.style.display = 'block';
        return;
    }
    
    try {
        priceTableBody.innerHTML = '<tr><td colspan="6" class="loading">Loading market prices...</td></tr>';
        priceError.style.display = 'none';
        
        const response = await fetch(`${API_BASE_URL}/api/market-prices?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayMarketPrices(data);
    } catch (error) {
        console.error('Error fetching market prices:', error);
        priceTableBody.innerHTML = `<tr><td colspan="6" class="error">Error: ${error.message}</td></tr>`;
        priceError.textContent = 'Failed to fetch market prices. Please try again.';
        priceError.style.display = 'block';
    }
});

// Function to display market prices
function displayMarketPrices(data) {
    const priceTableBody = document.getElementById('price-table-body');
    
    if (!data || !Array.isArray(data) || data.length === 0) {
        priceTableBody.innerHTML = '<tr><td colspan="6">No market prices found for the selected crop and state</td></tr>';
        return;
    }

    // Clear previous results
    priceTableBody.innerHTML = '';

    // Sort districts alphabetically
    data.sort((a, b) => a.district.localeCompare(b.district));

    // Add each district's prices to the table
    data.forEach(districtData => {
        // Validate district data
        if (!districtData || typeof districtData !== 'object') {
            console.warn('Invalid district data:', districtData);
            return;
        }

        const districtName = districtData.district || 'Unknown District';
        const prices = Array.isArray(districtData.prices) ? districtData.prices : [];

        // Add district header
        const districtHeader = document.createElement('tr');
        districtHeader.className = 'district-header';
        districtHeader.innerHTML = `
            <td colspan="6">
                <i class="fas fa-map-marker-alt"></i>
                ${districtName}
            </td>
        `;
        priceTableBody.appendChild(districtHeader);

        if (prices.length === 0) {
            // Add a message if no prices are available for this district
            const noDataRow = document.createElement('tr');
            noDataRow.className = 'no-data-row';
            noDataRow.innerHTML = `
                <td colspan="6" class="no-data">
                    <i class="fas fa-info-circle"></i>
                    No market data available for this district
                </td>
            `;
            priceTableBody.appendChild(noDataRow);
            return;
        }

        // Add prices for this district
        prices.forEach(item => {
            if (!item || typeof item !== 'object') {
                console.warn('Invalid price data for district:', districtName);
                return;
            }

            const row = document.createElement('tr');
            row.className = 'price-row';
            row.innerHTML = `
                <td>${item.market || 'N/A'}</td>
                <td>${item.crop || 'N/A'}</td>
                <td>₹${item.price?.toLocaleString('en-IN') || 'N/A'}</td>
                <td>₹${item.minPrice?.toLocaleString('en-IN') || 'N/A'} - ₹${item.maxPrice?.toLocaleString('en-IN') || 'N/A'}</td>
                <td>${item.state || 'N/A'}</td>
                <td>${item.date || 'N/A'}</td>
            `;
            priceTableBody.appendChild(row);

            // Add trend and insight row
            const trendRow = document.createElement('tr');
            trendRow.className = 'trend-row';
            trendRow.innerHTML = `
                <td colspan="6">
                    <span class="trend ${item.trend?.toLowerCase() || 'stable'}">
                        <i class="fas fa-${item.trend === 'Rising' ? 'arrow-up' : item.trend === 'Falling' ? 'arrow-down' : 'equals'}"></i>
                        ${item.trend || 'Stable'}
                    </span>
                    <span class="insight">${item.insight || 'No market insight available'}</span>
                </td>
            `;
            priceTableBody.appendChild(trendRow);
        });
    });
}

// Disease Detection Section
document.addEventListener('DOMContentLoaded', () => {
    const uploadBox = document.getElementById('upload-box');
    const imageInput = document.getElementById('image-input');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImage = document.getElementById('remove-image');
    const loadingIndicator = document.getElementById('loading');
    const errorIndicator = document.getElementById('error');
    const resultContainer = document.getElementById('result-container');

    // Handle click to upload
    uploadBox.addEventListener('click', () => {
        imageInput.click();
    });

    // Handle file input change
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // Handle drag and drop
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.add('dragover');
    });

    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('dragover');
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // Handle remove image
    removeImage.addEventListener('click', () => {
        resetUploadArea();
    });

    function resetUploadArea() {
        imageInput.value = '';
        previewContainer.style.display = 'none';
        uploadBox.style.display = 'block';
        resultContainer.style.display = 'none';
        errorIndicator.style.display = 'none';
        loadingIndicator.style.display = 'none';
    }

    async function handleImageUpload(file) {
        try {
            console.log('Starting image upload...');
            console.log('File details:', {
                name: file.name,
                type: file.type,
                size: file.size
            });

            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Please upload an image file (JPG, PNG, etc.)');
            }

            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                previewContainer.style.display = 'block';
                uploadBox.style.display = 'none';
            };
            reader.readAsDataURL(file);

            // Show loading indicator
            loadingIndicator.style.display = 'flex';
            errorIndicator.style.display = 'none';
            resultContainer.style.display = 'none';

            // Prepare form data
            const formData = new FormData();
            formData.append('image', file);

            // Send request to server
            console.log('Sending request to server...');
            const response = await fetch('http://localhost:3000/api/detect-disease', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('Server response status:', response.status);
            
            if (!response.ok) {
                let errorMessage = 'Error uploading image';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                    console.error('Server error response:', errorData);
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }
                throw new Error(errorMessage);
            }
            
            const result = await response.json();
            console.log('Server response:', result);
            
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            // Update disease result
            document.getElementById('disease-name').textContent = result.disease || 'Unknown Disease';
            document.getElementById('confidence').textContent = `Confidence: ${result.confidence || '0%'}`;
            document.getElementById('disease-description').textContent = result.description || 'No description available';
            
            // Update symptoms
            const symptomsList = document.getElementById('symptoms-list');
            symptomsList.innerHTML = (result.symptoms || ['No symptoms available'])
                .map(symptom => `<li>${symptom}</li>`)
                .join('');
            
            // Update treatment
            const treatmentList = document.getElementById('treatment-list');
            treatmentList.innerHTML = (result.treatment || ['No treatment information available'])
                .map(treatment => `<li>${treatment}</li>`)
                .join('');
            
            // Update prevention
            const preventionList = document.getElementById('prevention-list');
            preventionList.innerHTML = (result.prevention || ['No prevention information available'])
                .map(prevention => `<li>${prevention}</li>`)
                .join('');
            
            // Show result container
            resultContainer.style.display = 'block';
            console.log('Disease detection completed successfully');
            
        } catch (error) {
            console.error('Error detecting disease:', error);
            showError(error.message || 'Error analyzing image. Please try again.');
            loadingIndicator.style.display = 'none';
        }
    }

    function showError(message) {
        loadingIndicator.style.display = 'none';
        errorIndicator.style.display = 'flex';
        errorIndicator.querySelector('p').textContent = message;
        resultContainer.style.display = 'none';
    }
});

// Expense Tracker Section
const expenseForm = document.getElementById('expense-form');
const transactionHistory = document.querySelector('.transaction-history table tbody');
const totalExpenses = document.getElementById('total-expenses');
const totalIncome = document.getElementById('total-income');
const balance = document.getElementById('balance');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Show market prices section by default
    const marketPricesSection = document.getElementById('market-prices');
    if (marketPricesSection) {
        marketPricesSection.style.display = 'block';
        marketPricesSection.classList.add('active');
    }
    
    // Hide other sections
    document.querySelectorAll('.section').forEach(section => {
        if (section.id !== 'market-prices') {
            section.style.display = 'none';
            section.classList.remove('active');
        }
    });
    
    // Initialize state dropdown
    populateStateList();
    
    // Initialize expense tracker
    const expenseForm = document.getElementById('expense-form');
    const transactionHistory = document.getElementById('transaction-history');
    const addTransactionBtn = document.querySelector('.submit-btn');
    
    if (expenseForm && transactionHistory && addTransactionBtn) {
        // Load expenses from localStorage
        let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        
        // Function to save expenses to localStorage
        function saveExpenses() {
            localStorage.setItem('expenses', JSON.stringify(expenses));
        }
        
        // Function to update expense display
        function updateExpenseDisplay() {
            // Clear existing transactions
            transactionHistory.innerHTML = '';
            
            // Calculate totals
            let totalExpense = 0;
            let totalIncome = 0;
            
            // Sort expenses by date (newest first)
            const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Add each expense to the table
            sortedExpenses.forEach((expense, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(expense.date).toLocaleDateString()}</td>
                    <td>${expense.type}</td>
                    <td>${expense.description}</td>
                    <td>₹${Math.abs(expense.amount).toFixed(2)}</td>
                    <td>
                        <button class="delete-btn" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                transactionHistory.appendChild(row);
                
                // Update totals
                if (expense.amount < 0) {
                    totalExpense += Math.abs(expense.amount);
                } else {
                    totalIncome += expense.amount;
                }
            });
            
            // Update total displays
            const totalExpenseElement = document.getElementById('total-expense');
            const totalIncomeElement = document.getElementById('total-income');
            const balanceElement = document.getElementById('balance');
            
            if (totalExpenseElement) totalExpenseElement.textContent = `₹${totalExpense.toFixed(2)}`;
            if (totalIncomeElement) totalIncomeElement.textContent = `₹${totalIncome.toFixed(2)}`;
            if (balanceElement) balanceElement.textContent = `₹${(totalIncome - totalExpense).toFixed(2)}`;
        }
        
        // Prevent form submission
        expenseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            return false;
        });
        
        // Add transaction button click handler
        addTransactionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const type = document.getElementById('expense-type').value;
            const amount = parseFloat(document.getElementById('expense-amount').value);
            const description = document.getElementById('expense-description').value;
            const category = document.getElementById('expense-category').value;
            const date = new Date().toISOString().split('T')[0];

            if (isNaN(amount) || amount <= 0) {
                alert('Please enter a valid amount');
                return;
            }

            if (!description.trim()) {
                alert('Please enter a description');
                return;
            }

            // Add new expense
            expenses.push({ 
                type, 
                amount: type === 'expense' ? -amount : amount, 
                description, 
                category,
                date 
            });
            
            // Save to localStorage
            saveExpenses();
            
            // Update display
            updateExpenseDisplay();
            
            // Reset form with animation
            expenseForm.style.opacity = '0.5';
            setTimeout(() => {
                expenseForm.reset();
                expenseForm.style.opacity = '1';
            }, 300);
        });
        
        // Add delete button handlers
        transactionHistory.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const index = parseInt(deleteBtn.getAttribute('data-index'));
                if (confirm('Are you sure you want to delete this transaction?')) {
                    const row = deleteBtn.closest('tr');
                    row.classList.add('deleting');
                    setTimeout(() => {
                        expenses.splice(index, 1);
                        saveExpenses();
                        updateExpenseDisplay();
                    }, 300);
                }
            }
        });
        
        // Initial display update
        updateExpenseDisplay();
    }
});

// Handle quick links in footer
document.querySelectorAll('.footer-section a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            // Smooth scroll to the section
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Update active section
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            targetSection.classList.add('active');

            // Update active nav link
            document.querySelectorAll('.nav-links a').forEach(navLink => {
                navLink.classList.remove('active');
                if (navLink.getAttribute('href') === targetId) {
                    navLink.classList.add('active');
                }
            });
        }
    });
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
    mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar') && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileMenuBtn.querySelector('i').classList.remove('fa-times');
        mobileMenuBtn.querySelector('i').classList.add('fa-bars');
    }
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add/remove scrolled class based on scroll position
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Hide navbar on scroll down, show on scroll up
    if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
}); 