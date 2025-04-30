// Logic for managing application windows (creation, movement, resizing, z-index)

class WindowManager {
    constructor(containerElement) {
        this.containerElement = containerElement;
        this.windows = [];
        this.activeWindow = null;
        this.highestZIndex = 10; // Start z-index stack above desktop/taskbar
        this.dragging = false;
        this.draggedWindow = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.resizing = false;
        this.resizedWindow = null;
        this.resizeHandle = null;
        this.resizeStartX = 0;
        this.resizeStartY = 0;
        this.resizeStartWidth = 0;
        this.resizeStartHeight = 0;

        // Global listeners for mouse move and mouse up during drag/resize
        document.addEventListener('mousemove', (e) => {
            this.handleDrag(e);
            this.handleResize(e);
        });
        document.addEventListener('mouseup', () => {
            this.stopDrag();
            this.stopResize();
        });

        console.log("Window Manager initialized");
    }

    createWindow(options) {
        this.highestZIndex++;

        const windowElement = document.createElement('div');
        windowElement.className = 'window';
        windowElement.style.left = `${options.x || 50}px`;
        windowElement.style.top = `${options.y || 50}px`;
        windowElement.style.width = `${options.width || 300}px`;
        windowElement.style.height = `${options.height || 200}px`;
        windowElement.style.zIndex = this.highestZIndex;

        // Title Bar
        const titleBar = document.createElement('div');
        titleBar.className = 'window-titlebar';
        // Add mousedown listener for dragging
        titleBar.addEventListener('mousedown', (e) => {
            // Prevent dragging if clicking on a control button
            if (e.target.tagName === 'BUTTON') return;
            this.startDrag(e, windowElement);
        });

        const titleText = document.createElement('span');
        titleText.className = 'window-title';
        titleText.textContent = options.title || 'Untitled Window';

        const controls = document.createElement('div');
        controls.className = 'window-controls';

        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.textContent = '[X]';
        closeButton.title = 'Close';
        closeButton.onclick = () => this.closeWindow(windowElement);

        const maximizeButton = document.createElement('button');
        maximizeButton.className = 'maximize-button';
        maximizeButton.textContent = '[ ]';
        maximizeButton.title = 'Maximize';
        // maximizeButton.onclick = () => this.maxWindow(windowElement);

        const minimizeButton = document.createElement('button');
        minimizeButton.className = 'minimize-button';
        minimizeButton.textContent = '[-]';
        minimizeButton.title = 'Minimize';
        // minimizeButton.onclick = () => this.minimizeWindow(windowElement);

        controls.appendChild(minimizeButton);
        controls.appendChild(maximizeButton);
        controls.appendChild(closeButton);

        titleBar.appendChild(titleText);
        titleBar.appendChild(controls);

        // Content Area
        const contentArea = document.createElement('div');
        contentArea.className = 'window-content';
        if (options.content) {
            contentArea.innerHTML = options.content; // Allow basic HTML content
        }

        windowElement.appendChild(titleBar);
        windowElement.appendChild(contentArea);

        // Add Resize Handles
        this.addResizeHandles(windowElement);

        // Add focus handling
        windowElement.addEventListener('mousedown', (e) => {
            this.focusWindow(windowElement);
        });

        this.containerElement.appendChild(windowElement);
        this.windows.push(windowElement);
        this.focusWindow(windowElement); // Focus newly created window

        console.log(`Window "${options.title}" created.`);
        return windowElement;
    }

    addResizeHandles(windowElement) {
        const handles = [
            { class: 'corner-bottom-right', cursor: 'nwse-resize' },
            // Add other handles here (e.g., 'corner-bottom-left', 'edge-bottom')
        ];

        handles.forEach(handleInfo => {
            const handle = document.createElement('div');
            handle.className = `window-resize-handle ${handleInfo.class}`;
            handle.style.cursor = handleInfo.cursor;
            handle.addEventListener('mousedown', (e) => {
                this.startResize(e, windowElement, handleInfo.class);
            });
            windowElement.appendChild(handle);
        });
    }

    focusWindow(windowElement) {
        if (this.activeWindow === windowElement) return; // Already active

        this.highestZIndex++;
        windowElement.style.zIndex = this.highestZIndex;
        this.activeWindow = windowElement;

        // Optional: Add/remove active class for styling
        this.windows.forEach(win => win.classList.remove('active'));
        windowElement.classList.add('active');

        console.log(`Window "${windowElement.querySelector('.window-title').textContent}" focused.`);
    }

    closeWindow(windowElement) {
        const title = windowElement.querySelector('.window-title').textContent;
        this.containerElement.removeChild(windowElement);
        this.windows = this.windows.filter(win => win !== windowElement);
        if (this.activeWindow === windowElement) {
            this.activeWindow = null;
            // Optional: focus the next highest window if available
        }
        console.log(`Window "${title}" closed.`);
    }

    startDrag(event, windowElement) {
        // Bring window to front when starting drag
        this.focusWindow(windowElement);

        this.dragging = true;
        this.draggedWindow = windowElement;
        const rect = windowElement.getBoundingClientRect();
        const containerRect = this.containerElement.getBoundingClientRect();

        // Calculate offset relative to the window's top-left corner
        this.dragOffsetX = event.clientX - rect.left;
        this.dragOffsetY = event.clientY - rect.top;

        // Prevent text selection during drag
        document.body.style.userSelect = 'none';
        console.log(`Started dragging "${windowElement.querySelector('.window-title').textContent}"`);
    }

    handleDrag(event) {
        if (!this.dragging || !this.draggedWindow) return;

        event.preventDefault(); // Prevent unwanted default actions

        // Calculate new position relative to the container
        const containerRect = this.containerElement.getBoundingClientRect();
        let newX = event.clientX - containerRect.left - this.dragOffsetX;
        let newY = event.clientY - containerRect.top - this.dragOffsetY;

        // Optional: Add boundary checks if needed
        // newX = Math.max(0, Math.min(newX, containerRect.width - this.draggedWindow.offsetWidth));
        // newY = Math.max(0, Math.min(newY, containerRect.height - this.draggedWindow.offsetHeight));

        this.draggedWindow.style.left = `${newX}px`;
        this.draggedWindow.style.top = `${newY}px`;
    }

    stopDrag() {
        if (this.dragging) {
            console.log(`Stopped dragging "${this.draggedWindow.querySelector('.window-title').textContent}"`);
            this.dragging = false;
            this.draggedWindow = null;
            // Restore text selection
            document.body.style.userSelect = '';
        }
    }

    startResize(event, windowElement, handleClass) {
        event.stopPropagation(); // Prevent triggering drag
        this.resizing = true;
        this.resizedWindow = windowElement;
        this.resizeHandle = handleClass;

        const rect = windowElement.getBoundingClientRect();
        this.resizeStartX = event.clientX;
        this.resizeStartY = event.clientY;
        this.resizeStartWidth = rect.width;
        this.resizeStartHeight = rect.height;

        document.body.style.userSelect = 'none'; // Prevent text selection
        console.log(`Started resizing "${windowElement.querySelector('.window-title').textContent}" from ${handleClass}`);
    }

    handleResize(event) {
        if (!this.resizing || !this.resizedWindow) return;

        event.preventDefault();

        const dx = event.clientX - this.resizeStartX;
        const dy = event.clientY - this.resizeStartY;

        let newWidth = this.resizeStartWidth;
        let newHeight = this.resizeStartHeight;

        // Adjust dimensions based on the handle being dragged
        if (this.resizeHandle.includes('right')) {
            newWidth = this.resizeStartWidth + dx;
        }
        if (this.resizeHandle.includes('bottom')) {
            newHeight = this.resizeStartHeight + dy;
        }
        // Add logic for left/top handles if implemented (adjusting position as well)

        // Enforce minimum size
        const minWidth = parseInt(this.resizedWindow.style.minWidth || 150);
        const minHeight = parseInt(this.resizedWindow.style.minHeight || 100);
        newWidth = Math.max(minWidth, newWidth);
        newHeight = Math.max(minHeight, newHeight);

        this.resizedWindow.style.width = `${newWidth}px`;
        this.resizedWindow.style.height = `${newHeight}px`;
    }

    stopResize() {
        if (this.resizing) {
            console.log(`Stopped resizing "${this.resizedWindow.querySelector('.window-title').textContent}"`);
            this.resizing = false;
            this.resizedWindow = null;
            this.resizeHandle = null;
            document.body.style.userSelect = ''; // Restore text selection
        }
    }

    // Placeholder methods for resize, minimize, maximize
    // resizeWindow(windowElement, width, height) { ... }
    // minimizeWindow(windowElement) { ... }
    // maximizeWindow(windowElement) { ... }
}

export default WindowManager;
