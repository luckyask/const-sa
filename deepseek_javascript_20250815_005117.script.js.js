document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Menu toggle for dashboard
    const dashboardMenuToggle = document.querySelector('.dashboard-page .menu-toggle');
    
    if (dashboardMenuToggle && sidebar) {
        dashboardMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Sidebar toggle button
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
    
    // Modal functionality
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modals = document.querySelectorAll('.modal');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    modals.forEach(modal => {
        const closeButton = modal.querySelector('.modal-close');
        
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Photo upload functionality
    const uploadArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const uploadPreview = document.getElementById('upload-preview');
    const startUploadBtn = document.getElementById('start-upload-btn');
    
    if (uploadArea && fileInput) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });
        
        // Handle dropped files
        uploadArea.addEventListener('drop', handleDrop, false);
        
        // Handle click to select files
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
        
        // Handle file selection
        fileInput.addEventListener('change', handleFiles);
    }
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        uploadArea.classList.add('highlight');
    }
    
    function unhighlight() {
        uploadArea.classList.remove('highlight');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files } });
    }
    
    function handleFiles(e) {
        const files = e.target.files;
        
        if (files.length > 0) {
            startUploadBtn.disabled = false;
            
            // Clear previous previews
            uploadPreview.innerHTML = '';
            
            // Display previews
            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const previewItem = document.createElement('div');
                        previewItem.className = 'upload-preview-item';
                        
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        
                        const removeBtn = document.createElement('button');
                        removeBtn.innerHTML = '&times;';
                        removeBtn.addEventListener('click', function() {
                            previewItem.remove();
                            
                            if (uploadPreview.children.length === 0) {
                                startUploadBtn.disabled = true;
                            }
                        });
                        
                        previewItem.appendChild(img);
                        previewItem.appendChild(removeBtn);
                        uploadPreview.appendChild(previewItem);
                    }
                    
                    reader.readAsDataURL(file);
                }
            });
        }
    }
    
    // Task priority colors
    const prioritySelect = document.getElementById('task-priority');
    
    if (prioritySelect) {
        prioritySelect.addEventListener('change', function() {
            const taskModal = this.closest('.modal');
            const priority = this.value.toLowerCase();
            
            // Remove all priority classes
            taskModal.classList.remove('priority-high', 'priority-medium', 'priority-low');
            
            // Add the selected priority class
            if (priority !== 'normal') {
                taskModal.classList.add(`priority-${priority}`);
            }
        });
    }
    
    // Calendar initialization
    const calendarEl = document.getElementById('calendar');
    
    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: [
                {
                    title: 'Submit Building Permit',
                    start: new Date(),
                    color: '#EF4444'
                },
                {
                    title: 'Client Meeting',
                    start: '2023-06-15T10:00:00',
                    end: '2023-06-15T11:30:00',
                    color: '#3B82F6'
                },
                {
                    title: 'Electrical Inspection',
                    start: '2023-06-18T13:00:00',
                    color: '#10B981'
                }
            ],
            dateClick: function(info) {
                const selectedDateEl = document.getElementById('selected-date');
                if (selectedDateEl) {
                    selectedDateEl.textContent = info.dateStr;
                }
            }
        });
        
        calendar.render();
    }
    
    // Chart initialization
    const timeChartEl = document.getElementById('timeChart');
    
    if (timeChartEl) {
        const timeChart = new Chart(timeChartEl, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Hours Tracked',
                    data: [6.5, 8, 7.5, 9, 6, 0, 0],
                    backgroundColor: '#1E3A8A',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    }
                }
            }
        });
    }
    
    const progressChartEl = document.getElementById('progressChart');
    
    if (progressChartEl) {
        const progressChart = new Chart(progressChartEl, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Not Started'],
                datasets: [{
                    data: [35, 45, 20],
                    backgroundColor: [
                        '#10B981',
                        '#3B82F6',
                        '#E5E7EB'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                cutout: '70%'
            }
        });
    }
    
    const taskChartEl = document.getElementById('taskChart');
    
    if (taskChartEl) {
        const taskChart = new Chart(taskChartEl, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Tasks Completed',
                    data: [12, 19, 15, 24],
                    borderColor: '#F97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    const financialChartEl = document.getElementById('financialChart');
    
    if (financialChartEl) {
        const financialChart = new Chart(financialChartEl, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Revenue',
                        data: [12000, 19000, 15000, 18000, 22000, 24500],
                        backgroundColor: '#1E3A8A',
                        borderRadius: 4
                    },
                    {
                        label: 'Expenses',
                        data: [8000, 12000, 10000, 11000, 15000, 13000],
                        backgroundColor: '#F97316',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount ($)'
                        }
                    }
                }
            }
        });
    }
    
    // Form validation
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation - check required fields
            const requiredInputs = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    input.style.borderColor = '#EF4444';
                    isValid = false;
                } else {
                    input.style.borderColor = '';
                }
            });
            
            if (isValid) {
                // Form is valid, show success message
                alert('Form submitted successfully!');
                this.reset();
            } else {
                alert('Please fill in all required fields.');
            }
        });
    });
    
    // Input validation
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.hasAttribute('required') && this.value.trim()) {
                this.style.borderColor = '';
            }
        });
    });
    
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const strengthMeter = this.closest('.form-group').querySelector('.strength-meter');
            const strengthText = this.closest('.form-group').querySelector('.strength-text');
            
            if (strengthMeter && strengthText) {
                const strengthBars = strengthMeter.querySelectorAll('.strength-bar');
                const password = this.value;
                let strength = 0;
                
                // Reset all bars
                strengthBars.forEach(bar => {
                    bar.style.backgroundColor = '#E5E7EB';
                });
                
                // Check password strength
                if (password.length >= 8) strength++;
                if (password.match(/[A-Z]/)) strength++;
                if (password.match(/[0-9]/)) strength++;
                if (password.match(/[^A-Za-z0-9]/)) strength++;
                
                // Update UI
                if (password.length > 0) {
                    for (let i = 0; i < strength; i++) {
                        if (i === 0) {
                            strengthBars[i].style.backgroundColor = '#EF4444';
                            strengthText.textContent = 'Password strength: Weak';
                        } else if (i === 1) {
                            strengthBars[i].style.backgroundColor = '#F59E0B';
                            strengthText.textContent = 'Password strength: Moderate';
                        } else if (i >= 2) {
                            strengthBars[i].style.backgroundColor = '#10B981';
                            strengthText.textContent = 'Password strength: Strong';
                        }
                    }
                } else {
                    strengthText.textContent = 'Password strength:';
                }
            }
        });
    }
    
    // Calculate estimate totals
    const lineItemsTable = document.querySelector('.line-items-table');
    
    if (lineItemsTable) {
        lineItemsTable.addEventListener('input', function(e) {
            if (e.target.matches('input[type="number"]')) {
                const row = e.target.closest('.table-row');
                const qtyInput = row.querySelector('input[type="number"]:nth-of-type(1)');
                const priceInput = row.querySelector('input[type="number"]:nth-of-type(2)');
                const totalCell = row.querySelector('.table-col:nth-last-child(2)');
                
                if (qtyInput && priceInput && totalCell) {
                    const qty = parseFloat(qtyInput.value) || 0;
                    const price = parseFloat(priceInput.value) || 0;
                    const total = qty * price;
                    
                    totalCell.textContent = '$' + total.toFixed(2);
                    
                    // Update grand total
                    updateEstimateTotal();
                }
            }
        });
        
        // Add new line item
        const addLineItemBtn = document.getElementById('add-line-item');
        
        if (addLineItemBtn) {
            addLineItemBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const tableBody = lineItemsTable.querySelector('.table-body');
                const newRow = document.createElement('div');
                newRow.className = 'table-row';
                
                newRow.innerHTML = `
                    <div class="table-col">
                        <input type="text" placeholder="Item name">
                    </div>
                    <div class="table-col">
                        <input type="text" placeholder="Description">
                    </div>
                    <div class="table-col">
                        <input type="number" placeholder="Qty" value="1">
                    </div>
                    <div class="table-col">
                        <input type="number" placeholder="Unit Price" value="0">
                    </div>
                    <div class="table-col">
                        <span>$0.00</span>
                    </div>
                    <div class="table-col actions">
                        <button class="btn btn-icon">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                tableBody.appendChild(newRow);
                
                // Add event listener to delete button
                const deleteBtn = newRow.querySelector('.btn-icon');
                deleteBtn.addEventListener('click', function() {
                    newRow.remove();
                    updateEstimateTotal();
                });
            });
        }
        
        // Add discount
        const addDiscountBtn = document.getElementById('add-discount');
        
        if (addDiscountBtn) {
            addDiscountBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const totalsContainer = document.querySelector('.estimate-totals');
                const discountRow = document.createElement('div');
                discountRow.className = 'totals-row';
                
                discountRow.innerHTML = `
                    <span>Discount (5%)</span>
                    <span>-$0.00</span>
                `;
                
                totalsContainer.insertBefore(discountRow, totalsContainer.querySelector('.grand-total'));
            });
        }
        
        // Add tax
        const addTaxBtn = document.getElementById('add-tax');
        
        if (addTaxBtn) {
            addTaxBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const totalsContainer = document.querySelector('.estimate-totals');
                const taxRow = document.createElement('div');
                taxRow.className = 'totals-row';
                
                taxRow.innerHTML = `
                    <span>Tax (7%)</span>
                    <span>$0.00</span>
                `;
                
                totalsContainer.insertBefore(taxRow, totalsContainer.querySelector('.grand-total'));
            });
        }
    }
    
    function updateEstimateTotal() {
        const subtotalRow = document.querySelector('.estimate-totals .totals-row:first-child');
        const discountRow = document.querySelector('.estimate-totals .totals-row:nth-child(2)');
        const taxRow = document.querySelector('.estimate-totals .totals-row:nth-child(3)');
        const grandTotalRow = document.querySelector('.estimate-totals .grand-total');
        
        if (subtotalRow && grandTotalRow) {
            // Calculate subtotal
            let subtotal = 0;
            const totalCells = document.querySelectorAll('.line-items-table .table-col:nth-last-child(2)');
            
            totalCells.forEach(cell => {
                const value = parseFloat(cell.textContent.replace('$', '')) || 0;
                subtotal += value;
            });
            
            subtotalRow.querySelector('span:last-child').textContent = '$' + subtotal.toFixed(2);
            
            // Calculate discount (5%)
            if (discountRow) {
                const discount = subtotal * 0.05;
                discountRow.querySelector('span:last-child').textContent = '-$' + discount.toFixed(2);
                subtotal -= discount;
            }
            
            // Calculate tax (7%)
            if (taxRow) {
                const tax = subtotal * 0.07;
                taxRow.querySelector('span:last-child').textContent = '$' + tax.toFixed(2);
                subtotal += tax;
            }
            
            // Update grand total
            grandTotalRow.querySelector('span:last-child').textContent = '$' + subtotal.toFixed(2);
        }
    }
    
    // Toggle billing period
    const billingToggle = document.querySelector('.billing-toggle input');
    const monthlyPrices = document.querySelectorAll('.price .amount');
    const annualPrices = ['268', '758', '1910'];
    
    if (billingToggle) {
        billingToggle.addEventListener('change', function() {
            monthlyPrices.forEach((priceEl, index) => {
                if (this.checked) {
                    priceEl.textContent = annualPrices[index];
                } else {
                    const monthlyPrice = priceEl.getAttribute('data-monthly') || 
                                        priceEl.textContent.replace(/[^0-9]/g, '');
                    priceEl.textContent = monthlyPrice;
                }
            });
        });
    }
    
    // Initialize monthly prices data attribute
    if (monthlyPrices.length > 0) {
        monthlyPrices.forEach(priceEl => {
            priceEl.setAttribute('data-monthly', priceEl.textContent);
        });
    }
});