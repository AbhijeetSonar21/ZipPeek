// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const selectFileBtn = document.getElementById('selectFileBtn');
    const selectedFileName = document.getElementById('selectedFileName');
    const zipContents = document.getElementById('zipContents');
    const fileTree = document.getElementById('fileTree');

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
    window.__TAURI__.event.listen('file-selected', async (event) => {
        // Display the selected file path
        selectedFileName.textContent = `Selected file: ${event.payload}`;

        try {
            // Parse the ZIP file and get its contents
            const contents = await window.__TAURI__.invoke('parse_zip_file', { filePath: event.payload });
            // Display the ZIP contents
            displayZipContents(contents);
        } catch (error) {
            console.error('Error parsing ZIP file:', error);
            selectedFileName.textContent = 'Error parsing ZIP file. Please try again.';
        }
    });

    // Function to display ZIP contents as a tree
    function displayZipContents(contents) {
        // Clear previous contents
        fileTree.innerHTML = '';
        
        // Create a tree structure from the file paths
        const tree = createTreeStructure(contents);
        
        // Render the tree
        renderTree(tree, fileTree);
        
        // Show the ZIP contents section
        zipContents.style.display = 'block';
    }

    // Function to create a tree structure from file paths
    function createTreeStructure(paths) {
        const tree = {};
        paths.forEach(path => {
            const parts = path.split('/');
            let current = tree;
            parts.forEach((part, index) => {
                if (!current[part]) {
                    current[part] = index === parts.length - 1 ? null : {};
                }
                current = current[part];
            });
        });
        return tree;
    }

    // Function to render the tree structure
    function renderTree(tree, parentElement) {
        for (const [name, subtree] of Object.entries(tree)) {
            const li = document.createElement('li');
            li.textContent = name;
            if (subtree !== null) {
                li.classList.add('folder');
                const ul = document.createElement('ul');
                renderTree(subtree, ul);
                li.appendChild(ul);
            }
            parentElement.appendChild(li);
        }
    }
});