// Initialize Supabase
const supabaseUrl = 'https://qjswuwcqyzeuqqqltykz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc3d1d2NxeXpldXFxcWx0eWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMjk0MDUsImV4cCI6MjA3MDgwNTQwNX0.qgH8DMJEoJVuYOXSyr0RAj01Yt7bBR8EYL6qw3YXyAs';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Admin Authentication
document.getElementById('adminLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const errorElement = document.getElementById('loginError');
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        const isAdmin = await checkAdminStatus(data.user.id);
        
        if (isAdmin) {
            window.location.href = 'admin-dashboard.html';
        } else {
            errorElement.textContent = 'Access denied. Administrator privileges required.';
        }
    } catch (error) {
        errorElement.textContent = error.message || 'Login failed. Please try again.';
    }
});

// Check if user has admin privileges
async function checkAdminStatus(userId) {
    const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', userId)
        .single();
    
    if (error) throw error;
    return data.is_admin;
}

// Common functions for all admin pages
async function fetchCompanies() {
    const { data, error } = await supabase
        .from('companies')
        .select(`
            id,
            name,
            created_at,
            subscription_tier,
            user_limit,
            subscriptions(status, current_period_end)
        `)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
}

async function updateCompanySubscription(companyId, tier) {
    const { data, error } = await supabase
        .from('companies')
        .update({ subscription_tier: tier })
        .eq('id', companyId)
        .select();
    
    if (error) throw error;
    return data;
}

async function fetchPlatformStats() {
    // Get total companies
    const { count: totalCompanies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });
    
    // Get active subscriptions
    const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
    
    // Get revenue data (simplified)
    const { data: revenueData } = await supabase
        .from('subscriptions')
        .select('plan_id, current_period_end')
        .eq('status', 'active');
    
    // Calculate MRR
    let mrr = 0;
    revenueData.forEach(sub => {
        if (sub.plan_id === 'starter') mrr += 28;
        else if (sub.plan_id === 'pro') mrr += 79;
        else if (sub.plan_id === 'enterprise') mrr += 199;
    });
    
    return {
        totalCompanies,
        activeSubscriptions,
        monthlyRevenue: mrr
    };
}

// Render companies table
function renderCompaniesTable(companies) {
    const tableBody = document.getElementById('companiesTable')?.querySelector('tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    companies.forEach(company => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${company.name}</td>
            <td>${new Date(company.created_at).toLocaleDateString()}</td>
            <td>
                <select class="subscription-tier" data-company-id="${company.id}">
                    <option value="starter" ${company.subscription_tier === 'starter' ? 'selected' : ''}>Starter</option>
                    <option value="pro" ${company.subscription_tier === 'pro' ? 'selected' : ''}>Pro</option>
                    <option value="enterprise" ${company.subscription_tier === 'enterprise' ? 'selected' : ''}>Enterprise</option>
                </select>
            </td>
            <td>
                <input type="number" class="user-limit" data-company-id="${company.id}" 
                       value="${company.user_limit}" min="1" ${company.subscription_tier === 'enterprise' ? 'disabled' : ''}>
            </td>
            <td>${company.subscriptions[0]?.status || 'inactive'}</td>
            <td>${company.subscriptions[0]?.current_period_end ? 
                new Date(company.subscriptions[0].current_period_end).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn btn-secondary btn-sm view-users" data-company-id="${company.id}">View Users</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners for subscription changes
    document.querySelectorAll('.subscription-tier').forEach(select => {
        select.addEventListener('change', async (e) => {
            const companyId = e.target.dataset.companyId;
            const newTier = e.target.value;
            
            try {
                await updateCompanySubscription(companyId, newTier);
                // Update user limit field based on tier
                const userLimitInput = document.querySelector(`.user-limit[data-company-id="${companyId}"]`);
                if (newTier === 'enterprise') {
                    userLimitInput.disabled = true;
                    userLimitInput.value = 'Unlimited';
                } else {
                    userLimitInput.disabled = false;
                    userLimitInput.value = newTier === 'starter' ? 1 : 5;
                }
                
                alert('Subscription updated successfully');
            } catch (error) {
                alert('Failed to update subscription: ' + error.message);
                e.target.value = e.target.dataset.originalValue;
            }
        });
    });
    
    // Add event listeners for user limit changes
    document.querySelectorAll('.user-limit').forEach(input => {
        input.addEventListener('change', async (e) => {
            const companyId = e.target.dataset.companyId;
            const newLimit = e.target.value;
            
            try {
                const { data, error } = await supabase
                    .from('companies')
                    .update({ user_limit: newLimit })
                    .eq('id', companyId);
                
                if (error) throw error;
                alert('User limit updated successfully');
            } catch (error) {
                alert('Failed to update user limit: ' + error.message);
                e.target.value = e.target.dataset.originalValue;
            }
        });
    });
}

// Initialize dashboard when loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Check admin status on all admin pages
    const user = supabase.auth.user();
    if (user) {
        const isAdmin = await checkAdminStatus(user.id);
        if (!isAdmin && !window.location.pathname.includes('admin-login.html')) {
            window.location.href = 'admin-login.html';
        }
    } else if (!window.location.pathname.includes('admin-login.html')) {
        window.location.href = 'admin-login.html';
    }

    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'admin-login.html';
    });

    // Dashboard stats
    if (document.querySelector('.dashboard-cards')) {
        const stats = await fetchPlatformStats();
        
        document.getElementById('totalCompanies').textContent = stats.totalCompanies;
        document.getElementById('activeSubscriptions').textContent = stats.activeSubscriptions;
        document.getElementById('monthlyRevenue').textContent = `$${stats.monthlyRevenue}`;
    }
    
    // Companies table
    if (document.getElementById('companiesTable')) {
        const companies = await fetchCompanies();
        renderCompaniesTable(companies);
    }

    // CSV Export
    document.getElementById('exportCsv')?.addEventListener('click', async () => {
        const companies = await fetchCompanies();
        
        // Create CSV content
        const headers = ['Company Name', 'Subscription Tier', 'User Limit', 'Status'];
        const rows = companies.map(c => [
            `"${c.name}"`, 
            c.subscription_tier, 
            c.user_limit, 
            c.subscriptions[0]?.status || 'inactive'
        ]);
        
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        
        // Download the file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'companies_export.csv';
        a.click();
    });
});

// Admin Logging Function
async function logAdminAction(action) {
    const user = supabase.auth.user();
    if (!user) return;
    
    await supabase
        .from('admin_logs')
        .insert([{ 
            admin_id: user.id, 
            action: action,
            ip_address: window.ipAddress // Optional
        }]);
}

// Rate Limits Management
async function fetchRateLimits(companyId) {
    const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('company_id', companyId);
    
    if (error) throw error;
    return data;
}

async function updateRateLimit(limitId, newLimit) {
    const { data, error } = await supabase
        .from('rate_limits')
        .update({ usage_limit: newLimit })
        .eq('id', limitId)
        .select();
    
    if (error) throw error;
    return data;
}