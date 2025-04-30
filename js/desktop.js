// js/desktop.js
// Logic for the desktop environment (icon management, background, context menus)

class Desktop {
    constructor(element) {
        this.element = element;
        this.selectedIcon = null;
        console.log("Desktop component initialized");
        this.element.addEventListener('click', (e) => {
            // Deselect icon if clicking on the desktop background itself
            if (e.target === this.element) {
                this.deselectIcon();
            }
        });
    }

    addIcon(name, iconPath, onClick) {
        const iconElement = document.createElement('div');
        iconElement.className = 'desktop-icon';
        iconElement.title = name; // Tooltip

        const img = document.createElement('img');
        img.src = iconPath;
        img.alt = name;
        img.draggable = false; // Prevent native image dragging

        const span = document.createElement('span');
        span.textContent = name;

        iconElement.appendChild(img);
        iconElement.appendChild(span);

        iconElement.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click bubbling to desktop
            this.selectIcon(iconElement);
        });

        iconElement.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (onClick) {
                onClick();
            }
        });

        this.element.appendChild(iconElement);
    }

    selectIcon(iconElement) {
        this.deselectIcon(); // Deselect any currently selected icon
        this.selectedIcon = iconElement;
        this.selectedIcon.classList.add('selected');
    }

    deselectIcon() {
        if (this.selectedIcon) {
            this.selectedIcon.classList.remove('selected');
            this.selectedIcon = null;
        }
    }

    // Methods for handling clicks, etc.
}

export default Desktop; // Enable module export
