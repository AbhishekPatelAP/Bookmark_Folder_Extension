# Bookmark_Folder_Extension

A simple and efficient Chrome extension for managing bookmarks in organized folders. This tool allows you to save web pages, categorize them, and easily access them from a clean, modern interface.

### Features ✨

  * **Create & Manage Folders**: Organize your bookmarks into custom folders with a single click.
  * **Add Bookmarks**: Save the current page to any folder.
  * **Edit & Delete**: Easily edit bookmark titles or folder names, and delete them when you no longer need them.
  * **Drag-and-Drop Reordering**: Rearrange bookmarks within a folder by simply dragging them.
  * **Search Functionality**: Quickly find the bookmark you need with the built-in search bar.
  * **Minimalist UI**: A clean and intuitive design for a seamless user experience.

-----

### How to Install (Developer Mode) 💻

1.  **Clone the Repository**: Clone or download this project to your local machine.
2.  **Open Chrome Extensions**: In your Chrome browser, navigate to `chrome://extensions`.
3.  **Enable Developer Mode**: In the top-right corner, toggle on **Developer mode**.
4.  **Load the Extension**: Click on **Load unpacked** and select the folder `Bookmark_Folder_Extension` that you downloaded.

The extension icon will now appear in your toolbar.

-----

### File Structure 📁

```
Bookmark_Folder_Extension/
├── manifest.json         # Defines the extension's properties and permissions
├── popup.html            # The HTML file for the extension's popup interface
├── popup.js              # The core JavaScript logic for all functionality
└── images/               # Contains the extension icon files
    ├── icon16.png        # Icon for the toolbar
    ├── icon48.png        # Icon for the extensions page
    └── icon128.png       # Icon for the Chrome Web Store
```

-----

### Usage 📖

1.  **Open the Pop-up**: Click the extension icon in your toolbar.
2.  **Create a Folder**: Enter a name in the input field and click **Create**. The view will automatically switch to your new folder.
3.  **Add a Bookmark**: Navigate to a web page you want to save. Open the extension and click **Add Current Page**.
4.  **Manage Bookmarks**: Click on a folder to see your saved bookmarks. You can use the search bar to filter, or click the **edit (✏️)** and **delete (❌)** buttons to manage them.
5.  **Return**: Click **Back to Folders** to return to the main folder list.

-----

### Technical Details ⚙️

This extension uses Chrome's built-in `chrome.storage.sync` API to store data, which means your folders and bookmarks are securely synced across all your signed-in Chrome browsers. The UI is built with plain HTML, CSS, and JavaScript, making it lightweight and fast.
