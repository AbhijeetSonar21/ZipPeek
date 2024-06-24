// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const selectFileBtn = document.getElementById('selectFileBtn');
    const selectedFileName = document.getElementById('selectedFileName');

    // Add click event listener to the select file button
    selectFileBtn.addEventListener('click', async () => {
        try {
            // Call the Rust function to open file dialog
            await window.__TAURI__.invoke('select_zip_file');
        } catch (error) {
            console.error('Error selecting file:', error);
            selectedFileName.textContent = 'Error selecting file. Please try again.';
        }
    });

    // Listen for the custom event emitted by Rust when a file is selected
    window.__TAURI__.event.listen('file-selected', (event) => {
        // Display the selected file path
        selectedFileName.textContent = `Selected file: ${event.payload}`;
    });
});