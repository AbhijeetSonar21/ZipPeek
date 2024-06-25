document.addEventListener('DOMContentLoaded', () => {
    const selectFileBtn = document.getElementById('selectFileBtn');
    const selectedFileName = document.getElementById('selectedFileName');
    const zipContents = document.getElementById('zipContents');
    const fileTree = document.getElementById('fileTree');
    const passwordPrompt = document.getElementById('passwordPrompt');
    const zipPassword = document.getElementById('zipPassword');
    const submitPassword = document.getElementById('submitPassword');

    let currentFilePath = null;

    selectFileBtn.addEventListener('click', async () => {
        try {
            await window.__TAURI__.invoke('select_zip_file');
        } catch (error) {
            console.error('Error selecting file:', error);
            selectedFileName.textContent = 'Error selecting file. Please try again.';
        }
    });

    window.__TAURI__.event.listen('file-selected', async (event) => {
        currentFilePath = event.payload;
        selectedFileName.textContent = `Selected file: ${currentFilePath}`;
        await parseZipFile(currentFilePath);
    });

    async function parseZipFile(filePath, password = null) {
        try {
            const contents = await window.__TAURI__.invoke('parse_zip_file', { filePath, password });
            if (contents.is_encrypted && !password) {
                showPasswordPrompt();
            } else {
                hidePasswordPrompt();
                displayZipContents(contents.files);
            }
        } catch (error) {
            console.error('Error parsing ZIP file:', error);
            selectedFileName.textContent = 'Error parsing ZIP file. Please try again.';
            hidePasswordPrompt();
        }
    }

    function showPasswordPrompt() {
        passwordPrompt.style.display = 'block';
        zipPassword.value = ''; 
        zipPassword.focus();
    }

    function hidePasswordPrompt() {
        passwordPrompt.style.display = 'none';
    }

    submitPassword.addEventListener('click', () => {
        const password = zipPassword.value;
        if (password && currentFilePath) {
            parseZipFile(currentFilePath, password);
        } else {
            selectedFileName.textContent = 'Password input cancelled. Please try again.';
        }
    });

    // Allow submitting password with Enter key
    zipPassword.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            submitPassword.click();
        }
    });

    function displayZipContents(files) {
        fileTree.innerHTML = '';
        const tree = createTreeStructure(files);
        renderTree(tree, fileTree);
        zipContents.style.display = 'block';
    }

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