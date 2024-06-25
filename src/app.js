document.addEventListener('DOMContentLoaded', async () => {
    const elements = {
        selectFileBtn: document.getElementById('selectFileBtn'),
        selectedFileName: document.getElementById('selectedFileName'),
        zipContents: document.getElementById('zipContents'),
        fileTree: document.getElementById('fileTree'),
        passwordModal: document.getElementById('passwordModal'),
        zipPassword: document.getElementById('zipPassword'),
        submitPassword: document.getElementById('submitPassword'),
        cancelPassword: document.getElementById('cancelPassword'),
        zipMetadata: document.getElementById('zipMetadata'),
        recentZipsList: document.getElementById('recentZipsList'),
        platformInfo: document.getElementById('platformInfo'),
        passwordErrorMsg: document.getElementById('passwordErrorMsg')
    };

    let currentFilePath = null;

    function animateElement(element) {
        element.classList.remove('fade-in');
        void element.offsetWidth;
        element.classList.add('fade-in');
    }

    async function getPlatformInfo() {
        try {
            const platformInfo = await window.__TAURI__.invoke('get_platform_info');
            elements.platformInfo.textContent = `ZipPeek is running on ${platformInfo}`;
        } catch (error) {
            console.error('Error getting platform information:', error);
            elements.platformInfo.textContent = 'Error retrieving platform information';
        }
    }

    function loadRecentZips() {
        const recentZips = JSON.parse(localStorage.getItem('recentZips')) || [];
        elements.recentZipsList.innerHTML = '';
        recentZips.forEach(zip => {
            const li = document.createElement('li');
            li.textContent = zip.name;
            li.addEventListener('click', () => handleFileSelection(zip.path));
            elements.recentZipsList.appendChild(li);
        });
    }

    function addToRecentZips(filePath) {
        const fileName = filePath.split('\\').pop().split('/').pop();
        const recentZips = JSON.parse(localStorage.getItem('recentZips')) || [];
        const newZip = { path: filePath, name: fileName };
        const updatedZips = [newZip, ...recentZips.filter(zip => zip.path !== filePath)].slice(0, 5);
        localStorage.setItem('recentZips', JSON.stringify(updatedZips));
        loadRecentZips();
    }

    async function handleFileSelection(filePath) {
        currentFilePath = filePath;
        const fileName = filePath.split('\\').pop().split('/').pop();
        elements.selectedFileName.textContent = `Selected file: ${fileName}`;
        animateElement(elements.selectedFileName);
        addToRecentZips(filePath);

        elements.zipContents.classList.add('hidden');
        elements.zipMetadata.classList.add('hidden');
        elements.passwordModal.classList.add('hidden');
        elements.passwordErrorMsg.classList.add('hidden');

        await parseZipFile(filePath);
    }

    async function parseZipFile(filePath, password = null) {
        try {
            const contents = await window.__TAURI__.invoke('parse_zip_file', { filePath, password });
            if (contents.is_encrypted && !password) {
                showPasswordPrompt();
            } else {
                hidePasswordPrompt();
                if (!contents.is_encrypted) {
                    elements.selectedFileName.textContent = `Selected file: ${filePath.split('\\').pop().split('/').pop()}`;
                }
                displayZipContents(contents.files);
                displayZipMetadata(contents.metadata);
            }
        } catch (error) {
            if (error.includes('Invalid password')) {
                showPasswordError('Wrong password, please try again.');
            } else {
                console.error('Error parsing ZIP file:', error);
                elements.selectedFileName.textContent = 'Error parsing ZIP file. Please try again.';
            }
        }
    }

    function showPasswordPrompt() {
        elements.passwordModal.classList.remove('hidden');
        elements.zipPassword.value = '';
        elements.zipPassword.focus();
    }

    function hidePasswordPrompt() {
        elements.passwordModal.classList.add('hidden');
    }

    function showPasswordError(message) {
        elements.passwordErrorMsg.textContent = message;
        elements.passwordErrorMsg.classList.remove('hidden');
    }

    function displayZipContents(files) {
        elements.fileTree.innerHTML = '';
        const tree = createTreeStructure(files);
        renderTree(tree, elements.fileTree);
        elements.zipContents.classList.remove('hidden');
        animateElement(elements.zipContents);
    }

    function displayZipMetadata(metadata) {
        elements.zipMetadata.innerHTML = `
            <h3>ZIP File Metadata</h3>
            <p><strong>Name:</strong> ${metadata.name}</p>
            <p><strong>Size:</strong> ${formatBytes(metadata.size)}</p>
            <p><strong>Compressed Size:</strong> ${formatBytes(metadata.compressed_size)}</p>
            <p><strong>Number of Files:</strong> ${metadata.number_of_files}</p>
        `;
        elements.zipMetadata.classList.remove('hidden');
        animateElement(elements.zipMetadata);
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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

    elements.selectFileBtn.addEventListener('click', async () => {
        try {
            await window.__TAURI__.invoke('select_zip_file');
        } catch (error) {
            console.error('Error selecting file:', error);
            elements.selectedFileName.textContent = 'Error selecting file. Please try again.';
        }
    });

    window.__TAURI__.event.listen('file-selected', async (event) => {
        await handleFileSelection(event.payload);
    });

    elements.submitPassword.addEventListener('click', () => {
        const password = elements.zipPassword.value;
        if (password && currentFilePath) {
            hidePasswordPrompt();
            parseZipFile(currentFilePath, password);
        } else {
            elements.zipPassword.classList.add('error');
            setTimeout(() => elements.zipPassword.classList.remove('error'), 500);
        }
    });

    elements.cancelPassword.addEventListener('click', hidePasswordPrompt);

    loadRecentZips();
    await getPlatformInfo();
});
