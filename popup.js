document.addEventListener('DOMContentLoaded', () => {
  const folderView = document.getElementById('folder-view');
  const bookmarkView = document.getElementById('bookmark-view');
  const folderList = document.getElementById('folder-list');
  const bookmarkList = document.getElementById('bookmark-list');
  const newFolderNameInput = document.getElementById('new-folder-name');
  const createFolderBtn = document.getElementById('create-folder-btn');
  const addBookmarkBtn = document.getElementById('add-bookmark-btn');
  const backToFoldersBtn = document.getElementById('back-to-folders-btn');
  const currentFolderHeader = document.getElementById('current-folder-header');
  const searchInput = document.getElementById('search-input');
  // Target the actual container div that holds the search and add button
  const bookmarkControlsContainer = document.getElementById('bookmark-controls');

  let currentFolderName = null;
  let folders = {}; // This will hold our loaded folders data
  let draggedItem = null;

  // --- Utility Functions ---

  function getBookmarks(callback) {
    chrome.storage.sync.get(['folders'], (result) => {
      folders = result.folders || {}; // Always update the global 'folders' variable
      if (callback) callback();
    });
  }

  function saveBookmarks(callback) {
    chrome.storage.sync.set({ folders: folders }, () => {
      if (callback) callback();
    });
  }

  function showMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
      position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
      background-color: #333; color: white; padding: 10px 20px;
      border-radius: 5px; z-index: 1000; transition: opacity 0.5s;
    `;
    document.body.appendChild(msgDiv);
    setTimeout(() => {
      msgDiv.style.opacity = '0';
      setTimeout(() => msgDiv.remove(), 500);
    }, 2000);
  }

  // --- UI Rendering Functions ---

  function renderFolderList() {
    folderList.innerHTML = '';
    const folderNames = Object.keys(folders);
    if (folderNames.length === 0) {
      folderList.textContent = 'No folders created yet.';
    } else {
      folderNames.forEach(folderName => {
        const item = document.createElement('div');
        item.className = 'item-card folder-item';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${folderName} (${folders[folderName].length})`;
        item.appendChild(nameSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'item-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit-btn';
        editBtn.innerHTML = '&#9999;'; // Pencil icon
        editBtn.title = 'Edit folder name';
        editBtn.onclick = (e) => {
          e.stopPropagation();
          const newName = prompt('Enter new folder name:', folderName);
          if (newName && newName.trim() !== '' && newName !== folderName) {
            if (!folders[newName]) {
              folders[newName] = folders[folderName];
              delete folders[folderName];
              saveBookmarks(renderFolderList);
            } else {
              showMessage('A folder with that name already exists!');
            }
          }
        };
        actionsDiv.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '&#10060;'; // Cross icon
        deleteBtn.title = 'Delete folder';
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete "${folderName}" and all its bookmarks?`)) {
            delete folders[folderName];
            saveBookmarks(renderFolderList);
          }
        };
        actionsDiv.appendChild(deleteBtn);

        item.appendChild(actionsDiv);

        item.onclick = () => showBookmarkView(folderName);
        folderList.appendChild(item);
      });
    }
  }

  function renderBookmarkList(bookmarks) {
    bookmarkList.innerHTML = '';
    if (bookmarks && bookmarks.length > 0) {
      bookmarks.forEach((bookmark, index) => {
        const item = createBookmarkElement(bookmark, index);
        bookmarkList.appendChild(item);
      });
    } else {
      bookmarkList.textContent = 'No bookmarks in this folder.';
    }
  }

  function createBookmarkElement(bookmark, index) {
    const item = document.createElement('div');
    item.className = 'item-card bookmark-item';
    item.draggable = true;
    item.dataset.index = index; // Store original index for reordering logic

    const contentDiv = document.createElement('div');
    contentDiv.className = 'item-content';

    const link = document.createElement('a');
    link.href = bookmark.url;
    link.textContent = bookmark.title || bookmark.url;
    link.target = '_blank';
    contentDiv.appendChild(link);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'item-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn edit-btn';
    editBtn.innerHTML = '&#9999;'; // Pencil icon
    editBtn.title = 'Edit bookmark';
    editBtn.onclick = (e) => {
      e.stopPropagation();
      const newTitle = prompt('Enter new bookmark title:', bookmark.title);
      if (newTitle && newTitle.trim() !== '') {
        folders[currentFolderName][index].title = newTitle;
        saveBookmarks(() => renderBookmarkList(folders[currentFolderName]));
      }
    };
    actionsDiv.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.innerHTML = '&#10060;'; // Cross icon
    deleteBtn.title = 'Delete bookmark';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteBookmark(currentFolderName, index);
    };
    actionsDiv.appendChild(deleteBtn);

    item.appendChild(contentDiv);
    item.appendChild(actionsDiv);
    return item;
  }

  // --- View Management ---

  function showFolderView() {
    folderView.style.display = 'block';
    bookmarkView.style.display = 'none';
    bookmarkControlsContainer.style.display = 'none';
    currentFolderName = null;
    searchInput.value = '';
    currentFolderHeader.textContent = '';
    // CRITICAL FIX: Ensure getBookmarks is called here to load existing data
    getBookmarks(renderFolderList);
  }

  function showBookmarkView(folderName) {
    folderView.style.display = 'none';
    bookmarkView.style.display = 'block';
    bookmarkControlsContainer.style.display = 'flex';
    currentFolderName = folderName;
    currentFolderHeader.textContent = folderName;
    addBookmarkBtn.textContent = `Add to "${folderName}"`;

    // No need to call getBookmarks here again as 'folders' is global and updated
    // by showFolderView. If navigating directly, getBookmarks will be called.
    renderBookmarkList(folders[folderName] || []);
  }

  // --- Event Handlers ---

  createFolderBtn.addEventListener('click', () => {
    const newFolderName = newFolderNameInput.value.trim();
    if (newFolderName) {
      if (!folders[newFolderName]) {
        folders[newFolderName] = [];
        saveBookmarks(() => {
          newFolderNameInput.value = '';
          showMessage(`Folder "${newFolderName}" created!`);
          showBookmarkView(newFolderName);
        });
      } else {
        showMessage(`Folder "${newFolderName}" already exists!`);
      }
    } else {
      showMessage("Please enter a folder name.");
    }
  });

  addBookmarkBtn.addEventListener('click', () => {
    if (currentFolderName) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentPage = tabs[0];
        const newBookmark = {
          title: currentPage.title,
          url: currentPage.url
        };
        folders[currentFolderName].push(newBookmark);
        saveBookmarks(() => {
          renderBookmarkList(folders[currentFolderName]);
          showMessage(`"${newBookmark.title}" added!`);
          // Re-render folder list to update bookmark counts after adding
          getBookmarks(renderFolderList);
        });
      });
    } else {
      showMessage("Please select a folder first.");
    }
  });

  backToFoldersBtn.addEventListener('click', () => {
    showFolderView();
  });

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const bookmarks = folders[currentFolderName] || [];
    const filteredBookmarks = bookmarks.filter(b =>
      (b.title && b.title.toLowerCase().includes(query)) || (b.url && b.url.toLowerCase().includes(query))
    );
    renderBookmarkList(filteredBookmarks);
  });

  // --- Drag and Drop Logic ---

  bookmarkList.addEventListener('dragstart', (e) => {
    draggedItem = e.target;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
    e.target.style.opacity = 0.5;
  });

  bookmarkList.addEventListener('dragend', (e) => {
    e.target.style.opacity = '';
    draggedItem = null;
  });

  bookmarkList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const target = e.target.closest('.bookmark-item');
    if (target && target !== draggedItem) {
      const rect = target.getBoundingClientRect();
      const next = (e.clientY - rect.top) / rect.height > 0.5;
      bookmarkList.insertBefore(draggedItem, next && target.nextSibling || target);
    }
  });

  bookmarkList.addEventListener('drop', (e) => {
    e.preventDefault();
    if (draggedItem) {
      const fromIndex = parseInt(draggedItem.dataset.index);
      const bookmarks = folders[currentFolderName];
      
      const newOrder = Array.from(bookmarkList.children).map(child =>
        bookmarks[parseInt(child.dataset.index)]
      );

      folders[currentFolderName] = newOrder;
      saveBookmarks(() => {
        renderBookmarkList(folders[currentFolderName]);
      });
    }
  });

  // --- Helper Functions ---

  function deleteBookmark(folderName, index) {
    if (confirm(`Are you sure you want to delete this bookmark?`)) {
      folders[folderName].splice(index, 1);
      saveBookmarks(() => {
        renderBookmarkList(folders[folderName]);
        showMessage('Bookmark deleted!');
        // Re-render folder list to update bookmark counts after deleting
        getBookmarks(renderFolderList);
      });
    }
  }

  // Initial load
  // Make sure this is the first thing that happens when the popup opens
  showFolderView(); 
});