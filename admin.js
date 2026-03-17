// --- Admin Dashboard Logic ---

/**
 * Toggles the Ban status of a user in the UI.
 * In a real application, this would make an API call to the backend.
 */
function toggleBan(button) {
    // Navigate up the DOM to find the table row (tr)
    const row = button.closest('tr');
    
    // Find the status span inside this row
    const statusSpan = row.querySelector('.status-badge');
    
    // Check current status and toggle
    if (statusSpan.classList.contains('status-banned')) {
        // User is currently banned, so Unban them
        if(confirm("Are you sure you want to UNBAN this user?")) {
            statusSpan.className = 'status-badge status-active';
            statusSpan.textContent = 'Active';
            
            // Change icon back to Ban
            button.innerHTML = '<i class="fas fa-ban"></i>';
            button.title = "Ban User";
            
            alert("User has been successfully unbanned.");
        }
    } else {
        // User is Active/Reported, so Ban them
        if(confirm("Are you sure you want to BAN this user? They will lose access to AnnexLink.")) {
            statusSpan.className = 'status-badge status-banned';
            statusSpan.textContent = 'Banned';
            
            // Change icon to Undo/Unban
            button.innerHTML = '<i class="fas fa-undo"></i>';
            button.title = "Unban User";
            
            alert("User has been banned.");
        }
    }
}

/**
 * Removes a user row from the table.
 * In a real application, this would delete the user from MongoDB.
 */
function deleteRow(button) {
    if(confirm("CRITICAL WARNING: Are you sure you want to permanently delete this user and all their data? This action cannot be undone.")) {
        const row = button.closest('tr');
        
        // Add a smooth fade out effect before removing
        row.style.transition = "opacity 0.4s ease";
        row.style.opacity = "0";
        
        setTimeout(() => {
            row.remove();
        }, 400);
    }
}