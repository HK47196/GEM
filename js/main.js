// Main entry point for the GEM Desktop Environment application

// Import core components
import Desktop from './desktop.js';
import WindowManager from './window-manager.js';
// import Taskbar from './taskbar.js';
// import FileSystem from './file-system.js';

console.log("GEM Desktop Environment Initializing...");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // Initialize core components
    const desktop = new Desktop(document.getElementById('desktop'));
    const windowManager = new WindowManager(document.getElementById('window-container'));
    // const taskbar = new Taskbar(document.getElementById('taskbar'));
    // const fileSystem = new FileSystem();

    // Add initial setup logic, like creating default desktop icons
    desktop.addIcon(
        "Trash",
        "assets/icons/desktop/trash_empty.png",
        () => windowManager.createWindow({ title: "Trash", content: "Trash is empty." })
    );
    desktop.addIcon(
        "Hard Disk",
        "assets/icons/desktop/hard_disk.png",
        () => windowManager.createWindow({ title: "Hard Disk", content: "File Browser Content..." })
    );
    desktop.addIcon(
        "Text Editor",
        "assets/icons/desktop/text_editor.png",
        () => windowManager.createWindow({ title: "Text Editor", content: "<textarea style='width:100%; height: 100%; border: none; resize: none;'></textarea>" })
    );
    desktop.addIcon(
        "Calculator",
        "assets/icons/desktop/calculator.png",
        () => windowManager.createWindow({ title: "Calculator", content: "Calculator UI..." })
    );

    console.log("Desktop initialized and default icons added.");
});
