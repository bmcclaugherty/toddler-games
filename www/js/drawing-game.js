// Drawing game implementation
const drawingTemplates = [
    { id: 'dinosaur', name: 'Dinosaur', imageUrl: 'img/templates/dinosaur.png' },
    { id: 'cheetah', name: 'Cheetah', imageUrl: 'img/templates/cheetah.png' }
];

// Save drawing to localStorage
function saveDrawing(template, canvas) {
    const drawingData = canvas.toDataURL();
    localStorage.setItem(`drawing_${template.id}`, drawingData);
}

// Load drawing from localStorage
function loadDrawing(template, canvas, ctx) {
    const savedDrawing = localStorage.getItem(`drawing_${template.id}`);
    if (savedDrawing) {
        const image = new Image();
        image.src = savedDrawing;
        image.onload = () => {
            ctx.drawImage(image, 0, 0);
        };
        return true;
    }
    return false;
}

// Create a preview canvas for the template card
function createTemplatePreview(template, width, height) {
    const canvas = document.createElement('canvas');
    // Make preview size responsive based on screen size
    const previewSize = Math.min(window.innerWidth * 0.4, 200);
    canvas.width = previewSize;
    canvas.height = previewSize * 0.75;
    canvas.className = 'template-preview';
    canvas.style.maxWidth = '100%';
    const ctx = canvas.getContext('2d');

    // Load the template image first
    const templateImage = new Image();
    templateImage.src = template.imageUrl;

    return new Promise((resolve) => {
        templateImage.onload = () => {
            // Try to load saved drawing first
            const savedDrawing = localStorage.getItem(`drawing_${template.id}`);
            if (savedDrawing) {
                const savedImage = new Image();
                savedImage.src = savedDrawing;
                savedImage.onload = () => {
                    // Draw the saved drawing first
                    ctx.drawImage(savedImage, 0, 0, canvas.width, canvas.height);
                    // Then draw template image on top with full opacity
                    ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
                    resolve(canvas);
                };
                savedImage.onerror = () => {
                    // If saved drawing fails to load, just show template
                    ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
                    resolve(canvas);
                };
            } else {
                // If no saved drawing, just show template
                ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
                resolve(canvas);
            }
        };
        templateImage.onerror = () => resolve(canvas);
    });
}

function initializeDrawingGame() {
    const mainContainer = document.getElementById('app-container');
    mainContainer.innerHTML = ''; // Clear existing content
    
    // Create back button
    const backButton = document.createElement('button');
    backButton.textContent = '← Back';
    backButton.className = 'back-button';
    backButton.addEventListener('click', () => {
        mainContainer.innerHTML = '';
        initializeMainMenu();
    });
    
    // Create game title
    const gameTitle = document.createElement('h1');
    gameTitle.textContent = 'Choose a Picture to Draw';
    gameTitle.className = 'game-title';
    
    // Create templates container
    const templatesContainer = document.createElement('div');
    templatesContainer.className = 'templates-container';
    
    // Create template cards
    const createCards = async () => {
        for (const template of drawingTemplates) {
            const templateCard = document.createElement('div');
            templateCard.className = 'template-card';
            
            // Create preview canvas instead of static image
            const previewCanvas = await createTemplatePreview(template, 200, 150);
            
            const templateName = document.createElement('div');
            templateName.textContent = template.name;
            templateName.className = 'template-name';
            
            templateCard.appendChild(previewCanvas);
            templateCard.appendChild(templateName);
            
            templateCard.addEventListener('click', () => startDrawing(template));
            templatesContainer.appendChild(templateCard);
        }
    };
    
    createCards();
    
    mainContainer.appendChild(backButton);
    mainContainer.appendChild(gameTitle);
    mainContainer.appendChild(templatesContainer);
}

function startDrawing(template) {
    const mainContainer = document.getElementById('app-container');
    mainContainer.innerHTML = '';
    
    // Create back button
    const backButton = document.createElement('button');
    backButton.textContent = '← Back to Templates';
    backButton.className = 'back-button';
    backButton.addEventListener('click', () => {
        // Save the current drawing before going back
        saveDrawing(template, canvas);
        initializeDrawingGame();
    });
    
    // Create canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'canvas-container';
    
    // Calculate canvas size based on screen dimensions
    const aspectRatio = 4/3; // Maintain 4:3 aspect ratio
    let canvasWidth, canvasHeight;
    
    if (window.innerWidth < 768) { // Mobile devices
        canvasWidth = window.innerWidth * 0.95;
        canvasHeight = canvasWidth / aspectRatio;
        
        // Ensure the canvas doesn't take up too much vertical space on mobile
        const maxHeight = window.innerHeight * 0.6;
        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = canvasHeight * aspectRatio;
        }
    } else { // Tablets and larger devices
        canvasWidth = Math.min(window.innerWidth * 0.8, 1000);
        canvasHeight = canvasWidth / aspectRatio;
    }
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'drawing-canvas';
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.maxWidth = '100%';
    canvas.setAttribute('data-template', template.imageUrl);
    
    // Create an overlay canvas for the template
    const templateCanvas = document.createElement('canvas');
    templateCanvas.className = 'template-overlay';
    templateCanvas.width = canvasWidth;
    templateCanvas.height = canvasHeight;
    templateCanvas.style.position = 'absolute';
    templateCanvas.style.pointerEvents = 'none';
    templateCanvas.style.top = '0';
    templateCanvas.style.left = '0';
    templateCanvas.style.maxWidth = '100%';
    
    // Add touch-action manipulation for better touch handling
    canvas.style.touchAction = 'none';
    templateCanvas.style.touchAction = 'none';
    
    // Load template image
    const templateImage = new Image();
    templateImage.src = template.imageUrl;
    templateImage.onload = () => {
        const ctx = canvas.getContext('2d');
        const templateCtx = templateCanvas.getContext('2d');
        
        // Try to load saved drawing first
        const hasSavedDrawing = loadDrawing(template, canvas, ctx);
        
        // Draw template on the overlay canvas
        templateCtx.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight);
        
        // Set up drawing functionality
        setupDrawing(canvas, template);
    };
    
    canvasContainer.style.position = 'relative';
    canvasContainer.style.maxWidth = '100%';
    canvasContainer.style.margin = '0 auto';
    canvasContainer.appendChild(canvas);
    canvasContainer.appendChild(templateCanvas);
    
    // Create color picker and brush size controls
    const controls = createDrawingControls(canvas);
    
    mainContainer.appendChild(backButton);
    mainContainer.appendChild(canvasContainer);
    mainContainer.appendChild(controls);
}

function createDrawingControls(canvas) {
    const controls = document.createElement('div');
    controls.className = 'drawing-controls';
    controls.style.maxWidth = '100%';
    controls.style.padding = '10px';
    controls.style.overflowX = 'auto';
    controls.style.WebkitOverflowScrolling = 'touch'; // Smooth scrolling on iOS
    
    // Create brush picker container
    const brushPicker = document.createElement('div');
    brushPicker.className = 'brush-picker';
    brushPicker.style.display = 'flex';
    brushPicker.style.gap = '10px';
    brushPicker.style.flexWrap = 'nowrap';
    brushPicker.style.overflowX = 'auto';
    brushPicker.style.padding = '5px';
    
    // Define brush options
    const brushes = [
        { name: 'Thin', width: 3, style: 'round' },
        { name: 'Thick', width: 15, style: 'round' },
        { name: 'Square Thick', width: 12, style: 'square' },
        { name: 'Spray', width: 20, style: 'spray' }
    ];
    
    // Create brush preview canvas
    function createBrushPreview(brush) {
        const preview = document.createElement('canvas');
        // Make preview size smaller on mobile
        const previewSize = window.innerWidth < 768 ? 60 : 80;
        preview.width = previewSize;
        preview.height = previewSize / 2;
        const ctx = preview.getContext('2d');
        
        // Draw the brush stroke preview
        ctx.strokeStyle = '#000000';
        
        if (brush.style === 'spray') {
            ctx.fillStyle = ctx.strokeStyle;
            for (let i = 0; i < 50; i++) {
                const spread = brush.width;
                const x = preview.width/2 + (Math.random() * spread * 2 - spread);
                const y = preview.height/2 + (Math.random() * spread/2 - spread/4);
                const size = Math.random() * 1.5;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            ctx.lineWidth = brush.width;
            ctx.lineCap = brush.style;
            ctx.lineJoin = brush.style;
            ctx.beginPath();
            ctx.moveTo(preview.width * 0.25, preview.height/2);
            ctx.lineTo(preview.width * 0.75, preview.height/2);
            ctx.stroke();
        }
        
        return preview;
    }
    
    // Create brush buttons
    brushes.forEach(brush => {
        const brushButton = document.createElement('button');
        brushButton.className = 'brush-button';
        if (canvas.getContext('2d').lineWidth === brush.width && 
            ((brush.style === 'spray' && canvas.getAttribute('data-brush') === 'spray') ||
             (brush.style !== 'spray' && canvas.getContext('2d').lineCap === brush.style))) {
            brushButton.classList.add('selected');
        }
        
        // Create brush preview
        const preview = createBrushPreview(brush);
        brushButton.appendChild(preview);
        
        // Add brush name
        const brushName = document.createElement('span');
        brushName.textContent = brush.name;
        brushName.className = 'brush-name';
        brushButton.appendChild(brushName);
        
        brushButton.addEventListener('click', () => {
            // Remove selected class from all brush buttons
            document.querySelectorAll('.brush-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            // Add selected class to clicked button
            brushButton.classList.add('selected');
            
            // Update canvas brush style
            const ctx = canvas.getContext('2d');
            ctx.lineWidth = brush.width;
            if (brush.style === 'spray') {
                canvas.setAttribute('data-brush', 'spray');
            } else {
                canvas.setAttribute('data-brush', 'normal');
                ctx.lineCap = brush.style;
                ctx.lineJoin = brush.style;
            }
        });
        
        brushPicker.appendChild(brushButton);
    });
    
    // Create color picker container
    const colorPicker = document.createElement('div');
    colorPicker.className = 'color-picker';
    
    // Define child-friendly colors
    const colors = [
        { name: 'Black', value: '#000000' },
        { name: 'Red', value: '#FF4136' },
        { name: 'Blue', value: '#0074D9' },
        { name: 'Green', value: '#2ECC40' },
        { name: 'Yellow', value: '#FFDC00' },
        { name: 'Purple', value: '#B10DC9' },
        { name: 'Orange', value: '#FF851B' },
        { name: 'Pink', value: '#FF69B4' }
    ];
    
    // Create color buttons
    colors.forEach(color => {
        const colorButton = document.createElement('button');
        colorButton.className = 'color-button';
        colorButton.style.backgroundColor = color.value;
        colorButton.title = color.name;
        colorButton.setAttribute('aria-label', `Choose ${color.name} color`);
        
        // Add white border to current color
        if (canvas.getContext('2d').strokeStyle === color.value) {
            colorButton.classList.add('selected');
        }
        
        colorButton.addEventListener('click', () => {
            // Remove selected class from all buttons
            document.querySelectorAll('.color-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            // Add selected class to clicked button
            colorButton.classList.add('selected');
            // Update canvas stroke style
            canvas.getContext('2d').strokeStyle = color.value;
            
            // Update all brush previews with new color
            document.querySelectorAll('.brush-button canvas').forEach(preview => {
                const ctx = preview.getContext('2d');
                ctx.clearRect(0, 0, preview.width, preview.height);
                ctx.strokeStyle = color.value;
                ctx.beginPath();
                ctx.moveTo(20, 20);
                ctx.lineTo(60, 20);
                ctx.stroke();
            });
        });
        
        colorPicker.appendChild(colorButton);
    });
    
    // Add clear button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Drawing';
    clearButton.className = 'control-button';
    clearButton.addEventListener('click', () => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    
    controls.appendChild(brushPicker);
    controls.appendChild(colorPicker);
    controls.appendChild(clearButton);
    return controls;
}

function setupDrawing(canvas, template) {
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let sprayInterval = null;
    let autoSaveTimeout = null;
    
    ctx.strokeStyle = '#000000';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 8; // Set default to medium brush
    canvas.setAttribute('data-brush', 'normal');
    
    // Auto-save function
    function autoSave() {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }
        autoSaveTimeout = setTimeout(() => {
            saveDrawing(template, canvas);
        }, 2000); // Auto-save 2 seconds after last drawing action
    }
    
    function spray(x, y) {
        const spread = ctx.lineWidth;
        const density = spread * 2;
        
        for (let i = 0; i < density; i++) {
            const offsetX = Math.random() * spread * 2 - spread;
            const offsetY = Math.random() * spread * 2 - spread;
            const size = Math.random() * 1.5;
            
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
            ctx.fill();
        }
        autoSave();
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        // Get correct coordinates for touch or mouse event
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        
        if (canvas.getAttribute('data-brush') === 'spray') {
            ctx.fillStyle = ctx.strokeStyle;
            spray(x, y);
        } else {
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            autoSave();
        }
        
        [lastX, lastY] = [x, y];
    }
    
    // Mouse Events
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
        if (canvas.getAttribute('data-brush') === 'spray') {
            ctx.fillStyle = ctx.strokeStyle;
            spray(lastX, lastY);
            sprayInterval = setInterval(() => {
                if (isDrawing) spray(lastX, lastY);
            }, 50);
        }
    });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
        if (sprayInterval) {
            clearInterval(sprayInterval);
            sprayInterval = null;
        }
    });
    canvas.addEventListener('mouseout', () => {
        isDrawing = false;
        if (sprayInterval) {
            clearInterval(sprayInterval);
            sprayInterval = null;
        }
    });
    
    // Touch Events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        [lastX, lastY] = [
            e.touches[0].clientX - rect.left,
            e.touches[0].clientY - rect.top
        ];
        if (canvas.getAttribute('data-brush') === 'spray') {
            ctx.fillStyle = ctx.strokeStyle;
            spray(lastX, lastY);
            sprayInterval = setInterval(() => {
                if (isDrawing) spray(lastX, lastY);
            }, 50);
        }
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e);
    });
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        isDrawing = false;
        if (sprayInterval) {
            clearInterval(sprayInterval);
            sprayInterval = null;
        }
    });
} 