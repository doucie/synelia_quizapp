/**
 * Template Mémoire - Système de Pagination Dynamique
 * 
 * Ce script lit le contenu depuis #contentSource et le répartit
 * dynamiquement sur des pages A4 générées automatiquement.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Initialisation du template mémoire...');
    
    // 0. Initialiser le thème (dark/light)
    initThemeToggle();
    
    // 1. Générer les pages à partir du contenu source
    generatePagesFromContent();
    
    // 2. Initialiser la navigation
    initNavigation();
    
    // 3. Initialiser l'inspecteur de styles
    initStyleInspector();
    
    // 4. Initialiser le navigateur de pages
    initPageNavigator();
    
    // 5. Ajouter la barre de progression
    initProgressBar();
    
    console.log('✅ Template mémoire chargé avec succès');
});

// ============================================
// THEME TOGGLE (DARK/LIGHT MODE)
// ============================================

/**
 * Initialise le système de basculement dark/light mode
 */
function initThemeToggle() {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;
    
    // Charger le thème sauvegardé ou utiliser le thème système
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Gérer le clic sur le bouton
    toggleBtn.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? '' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        console.log('🌓 Thème changé:', newTheme || 'light');
    });
    
    // Écouter les changements de préférence système
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : '');
        }
    });
    
    console.log('🌓 Theme toggle initialisé');
}

// ============================================
// SYSTÈME DE PAGINATION DYNAMIQUE
// ============================================

/**
 * Constantes de dimensions (en pixels)
 */
const CM_TO_PX = 37.795275591;
const PAGE_WIDTH = 21 * CM_TO_PX;       // 21cm (A4)
const PAGE_HEIGHT = 29.7 * CM_TO_PX;    // 29.7cm (A4)
const MARGIN_TOP = 2.5 * CM_TO_PX;      // 2.5cm
const MARGIN_BOTTOM = 2.5 * CM_TO_PX;   // 2.5cm
const MARGIN_LEFT = 2.5 * CM_TO_PX;     // 2.5cm
const MARGIN_RIGHT = 2.5 * CM_TO_PX;    // 2.5cm
const SAFE_ZONE = 20;                    // Marge de sécurité en px

// Hauteur utilisable pour le contenu
const USABLE_HEIGHT = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM - SAFE_ZONE;

console.log('📏 Dimensions page - Hauteur utilisable:', Math.round(USABLE_HEIGHT), 'px (~', (USABLE_HEIGHT / CM_TO_PX).toFixed(1), 'cm)');

/**
 * Génère les pages à partir du contenu source
 */
function generatePagesFromContent() {
    const contentSource = document.getElementById('contentSource');
    const documentContainer = document.getElementById('documentContainer');
    
    if (!contentSource || !documentContainer) {
        console.error('❌ contentSource ou documentContainer introuvable');
        return;
    }
    
    // Vider le conteneur
    documentContainer.innerHTML = '';
    
    // Collecter tous les éléments du contenu source
    const elements = Array.from(contentSource.children);
    
    // Variables de suivi
    let currentPage = null;
    let currentPageContent = null;
    let currentHeight = 0;
    let pageCount = 0;
    let currentSectionId = null;
    let currentSectionTitle = null;
    
    // Traiter chaque élément
    elements.forEach((element, index) => {
        // Vérifier si c'est un marqueur de page-break
        if (element.classList.contains('page-break')) {
            // Sauvegarder les infos de section
            currentSectionId = element.dataset.section || null;
            currentSectionTitle = element.dataset.title || null;
            
            // Vérifier si c'est une page de partie
            if (element.dataset.type === 'part') {
                // La page de partie sera créée avec le prochain part-content
                return;
            }
            
            // Forcer une nouvelle page
            currentPage = createNewPage(documentContainer, currentSectionId, currentSectionTitle, ++pageCount);
            currentPageContent = currentPage.querySelector('.page-content');
            currentHeight = 0;
            
            return;
        }
        
        // Vérifier si c'est un contenu de couverture
        if (element.classList.contains('cover-content')) {
            createCoverPage(documentContainer, element);
            pageCount++;
            currentPage = null;
            currentPageContent = null;
            currentHeight = 0;
            return;
        }
        
        // Vérifier si c'est un contenu de partie
        if (element.classList.contains('part-content')) {
            createPartPage(documentContainer, element, currentSectionId);
            pageCount++;
            currentPage = null;
            currentPageContent = null;
            currentHeight = 0;
            currentSectionId = null;
            return;
        }
        
        // Si pas de page courante, en créer une
        if (!currentPage || !currentPageContent) {
            currentPage = createNewPage(documentContainer, currentSectionId, currentSectionTitle, ++pageCount);
            currentPageContent = currentPage.querySelector('.page-content');
            currentHeight = 0;
            currentSectionId = null; // Réinitialiser après utilisation
            currentSectionTitle = null;
        }
        
        // Cloner l'élément
        const clone = element.cloneNode(true);
        
        // Ajouter temporairement pour mesurer
        currentPageContent.appendChild(clone);
        
        // Forcer le recalcul du layout
        void clone.offsetHeight;
        
        // Mesurer l'élément
        const elementHeight = getElementHeight(clone);
        
        // Vérifier si ça rentre
        if (currentHeight + elementHeight > USABLE_HEIGHT && currentHeight > 0) {
            // Retirer l'élément de la page courante
            currentPageContent.removeChild(clone);
            
            // Créer une nouvelle page de continuation
            currentPage = createNewPage(documentContainer, null, null, ++pageCount);
            currentPageContent = currentPage.querySelector('.page-content');
            currentHeight = 0;
            
            // Ajouter à la nouvelle page
            currentPageContent.appendChild(clone);
        }
        
        // Mettre à jour la hauteur
        currentHeight += elementHeight;
    });
    
    // Ajouter les numéros de page
    addPageNumbers();
    
    console.log(`📄 ${pageCount} pages générées`);
}

/**
 * Crée une page de couverture
 */
function createCoverPage(container, content) {
    const page = document.createElement('section');
    page.className = 'page cover-page';
    page.id = 'couverture';
    
    const pageContent = document.createElement('div');
    pageContent.className = 'page-content cover-content';
    
    // Copier le contenu de la couverture
    pageContent.innerHTML = content.innerHTML;
    
    page.appendChild(pageContent);
    container.appendChild(page);
    
    return page;
}

/**
 * Crée une page de partie
 */
function createPartPage(container, content, sectionId) {
    const page = document.createElement('section');
    page.className = 'page part-page';
    
    if (sectionId) {
        page.id = sectionId;
    }
    
    const pageContent = document.createElement('div');
    pageContent.className = 'page-content part-content-wrapper';
    
    // Copier le contenu de la partie
    pageContent.innerHTML = content.innerHTML;
    
    page.appendChild(pageContent);
    container.appendChild(page);
    
    return page;
}

/**
 * Crée une nouvelle page standard
 */
function createNewPage(container, sectionId, sectionTitle, pageNum) {
    const page = document.createElement('section');
    page.className = 'page';
    
    // Ajouter l'ID si c'est une section
    if (sectionId) {
        page.id = sectionId;
        
        // Ajouter une classe spécifique pour les chapitres
        if (sectionId.startsWith('chapitre')) {
            page.classList.add('chapter-start');
        }
    } else {
        page.classList.add('continuation-page');
    }
    
    // Créer le conteneur de contenu
    const pageContent = document.createElement('div');
    pageContent.className = 'page-content';
    
    page.appendChild(pageContent);
    container.appendChild(page);
    
    return page;
}

/**
 * Calcule la hauteur totale d'un élément (incluant les marges)
 */
function getElementHeight(element) {
    const style = window.getComputedStyle(element);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    
    return element.offsetHeight + marginTop + marginBottom;
}

/**
 * Ajoute les numéros de page
 * - Chiffres romains avant l'introduction
 * - Chiffres arabes à partir de l'introduction
 */
function addPageNumbers() {
    const pages = document.querySelectorAll('.page');
    
    const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
                           'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx',
                           'xxi', 'xxii', 'xxiii', 'xxiv', 'xxv'];
    
    let romanCount = 0;
    let arabicCount = 0;
    let introductionReached = false;
    
    pages.forEach((page) => {
        // La page de couverture n'a pas de numéro
        if (page.classList.contains('cover-page')) {
            return;
        }
        
        // Les pages de partie n'ont pas de numéro
        if (page.classList.contains('part-page')) {
            return;
        }
        
        // Vérifier si on atteint l'introduction
        if (page.id === 'introduction') {
            introductionReached = true;
            arabicCount = 1;
        }
        
        // Créer le numéro de page
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        
        if (!introductionReached) {
            pageNumber.classList.add('page-number-roman');
            pageNumber.textContent = romanNumerals[romanCount] || (romanCount + 1);
            romanCount++;
        } else {
            pageNumber.textContent = arabicCount;
            arabicCount++;
        }
        
        page.appendChild(pageNumber);
    });
}

// ============================================
// NAVIGATION LATÉRALE
// ============================================

function initNavigation() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const navList = document.getElementById('navList');
    
    if (!sidebar || !menuToggle || !closeSidebar || !navList) return;
    
    // Générer la navigation automatiquement
    generateNavigation(navList);
    
    // Toggle sidebar
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });
    
    closeSidebar.addEventListener('click', function() {
        sidebar.classList.remove('open');
    });
    
    // Fermer la sidebar en cliquant en dehors
    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && e.target !== menuToggle) {
            sidebar.classList.remove('open');
        }
    });
}

function generateNavigation(navList) {
    const pages = document.querySelectorAll('.page[id]');
    
    pages.forEach(function(page) {
        const id = page.id;
        let title = '';
        
        // Déterminer le titre
        const chapterTitle = page.querySelector('.chapter-title');
        const sectionTitle = page.querySelector('.section-title');
        const partTitle = page.querySelector('.part-title');
        const partNumber = page.querySelector('.part-number');
        
        if (partNumber && partTitle) {
            title = partNumber.textContent + ' - ' + partTitle.textContent;
        } else if (chapterTitle) {
            title = chapterTitle.childNodes[0].textContent.trim();
            const subtitle = chapterTitle.querySelector('.chapter-subtitle');
            if (subtitle) {
                title += ' - ' + subtitle.textContent;
            }
        } else if (sectionTitle) {
            title = sectionTitle.textContent;
        } else {
            // Formater l'ID
            title = id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
        }
        
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + id;
        a.textContent = title;
        
        a.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('sidebar').classList.remove('open');
        });
        
        li.appendChild(a);
        navList.appendChild(li);
    });
}

// ============================================
// NAVIGATEUR DE PAGES
// ============================================

function initPageNavigator() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const indicator = document.getElementById('pageIndicator');
    const chapterSelect = document.getElementById('chapterSelect');
    
    if (!prevBtn || !nextBtn || !indicator) return;
    
    const pages = document.querySelectorAll('.page');
    let currentPage = 0;
    const totalPages = pages.length;
    
    // Remplir le sélecteur de chapitres
    populateChapterSelect(chapterSelect);
    
    function updateIndicator() {
        indicator.textContent = `${currentPage + 1} / ${totalPages}`;
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === totalPages - 1;
    }
    
    function goToPage(index) {
        if (index >= 0 && index < totalPages) {
            currentPage = index;
            pages[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
            updateIndicator();
        }
    }
    
    prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
    
    if (chapterSelect) {
        chapterSelect.addEventListener('change', function() {
            if (this.value) {
                const target = document.getElementById(this.value);
                if (target) {
                    const pageIndex = Array.from(pages).indexOf(target);
                    if (pageIndex !== -1) {
                        goToPage(pageIndex);
                    }
                }
                this.selectedIndex = 0;
            }
        });
    }
    
    // Détecter la page courante au scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollPos = window.scrollY + window.innerHeight / 3;
            
            for (let i = pages.length - 1; i >= 0; i--) {
                if (scrollPos >= pages[i].offsetTop) {
                    if (currentPage !== i) {
                        currentPage = i;
                        updateIndicator();
                    }
                    break;
                }
            }
        }, 100);
    });
    
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                goToPage(currentPage - 1);
                break;
            case 'ArrowRight':
            case 'PageDown':
                e.preventDefault();
                goToPage(currentPage + 1);
                break;
            case 'Home':
                e.preventDefault();
                goToPage(0);
                break;
            case 'End':
                e.preventDefault();
                goToPage(totalPages - 1);
                break;
        }
    });
    
    updateIndicator();
}

function populateChapterSelect(select) {
    if (!select) return;
    
    const structure = [
        { type: 'group', label: 'Préliminaires' },
        { id: 'couverture', label: 'Page de garde' },
        { id: 'remerciements', label: 'Remerciements' },
        { id: 'resume', label: 'Résumé / Abstract' },
        { id: 'sommaire', label: 'Sommaire' },
        { id: 'avant-propos', label: 'Avant-propos' },
        { id: 'glossaire', label: 'Glossaire' },
        { id: 'introduction', label: 'Introduction' },
        
        { type: 'group', label: 'Partie I' },
        { id: 'partie1', label: 'Page de partie' },
        { id: 'chapitre1', label: 'Chapitre 1' },
        { id: 'chapitre2', label: 'Chapitre 2' },
        
        { type: 'group', label: 'Partie II' },
        { id: 'partie2', label: 'Page de partie' },
        { id: 'chapitre3', label: 'Chapitre 3' },
        { id: 'chapitre4', label: 'Chapitre 4' },
        
        { type: 'group', label: 'Partie III' },
        { id: 'partie3', label: 'Page de partie' },
        { id: 'chapitre5', label: 'Chapitre 5' },
        { id: 'chapitre6', label: 'Chapitre 6' },
        
        { type: 'group', label: 'Partie IV' },
        { id: 'partie4', label: 'Page de partie' },
        { id: 'chapitre7', label: 'Chapitre 7' },
        { id: 'chapitre8', label: 'Chapitre 8' },
        { id: 'chapitre9', label: 'Chapitre 9' },
        
        { type: 'group', label: 'Fin' },
        { id: 'conclusion', label: 'Conclusion' },
        { id: 'references', label: 'Références' },
        { id: 'annexes', label: 'Annexes' }
    ];
    
    let currentGroup = null;
    
    structure.forEach(item => {
        if (item.type === 'group') {
            currentGroup = document.createElement('optgroup');
            currentGroup.label = item.label;
            select.appendChild(currentGroup);
        } else if (item.id && document.getElementById(item.id)) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.label;
            (currentGroup || select).appendChild(option);
        }
    });
}

// ============================================
// BARRE DE PROGRESSION
// ============================================

function initProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.id = 'readingProgress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #3182ce, #2c5282);
        z-index: 9999;
        transition: width 0.1s;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
    });
}

// ============================================
// INSPECTEUR DE STYLES
// ============================================

function initStyleInspector() {
    const inspector = document.getElementById('styleInspector');
    const inspectorToggle = document.getElementById('inspectorToggle');
    const closeInspector = document.getElementById('closeInspector');
    const inspectorDetails = document.getElementById('inspectorDetails');
    const inspectorHint = document.querySelector('.inspector-hint');
    const documentContainer = document.getElementById('documentContainer');
    
    if (!inspector || !inspectorToggle || !closeInspector || !documentContainer) return;
    
    let selectedElement = null;
    let inspectorActive = false;
    
    // Toggle inspecteur
    inspectorToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        inspector.classList.toggle('open');
        document.body.classList.toggle('inspector-active');
        inspectorActive = inspector.classList.contains('open');
    });
    
    closeInspector.addEventListener('click', function() {
        inspector.classList.remove('open');
        document.body.classList.remove('inspector-active');
        inspectorActive = false;
        clearSelection();
    });
    
    // Clic sur un élément du document
    documentContainer.addEventListener('click', function(e) {
        if (!inspectorActive) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        if (e.target.classList.contains('document') || e.target.id === 'documentContainer') return;
        
        selectElement(e.target);
    });
    
    function selectElement(element) {
        if (selectedElement) {
            selectedElement.classList.remove('inspector-selected');
        }
        
        selectedElement = element;
        selectedElement.classList.add('inspector-selected');
        
        if (inspectorHint) inspectorHint.style.display = 'none';
        if (inspectorDetails) inspectorDetails.style.display = 'block';
        
        analyzeStyles(element);
    }
    
    function clearSelection() {
        if (selectedElement) {
            selectedElement.classList.remove('inspector-selected');
            selectedElement = null;
        }
        if (inspectorHint) inspectorHint.style.display = 'block';
        if (inspectorDetails) inspectorDetails.style.display = 'none';
    }
    
    function analyzeStyles(element) {
        const styles = window.getComputedStyle(element);
        
        // Élément
        const elemTag = document.getElementById('elemTag');
        const elemClass = document.getElementById('elemClass');
        if (elemTag) elemTag.textContent = element.tagName.toLowerCase();
        if (elemClass) elemClass.textContent = element.className.replace('inspector-selected', '').trim() || '-';
        
        // Typographie
        const fontFamily = styles.fontFamily.split(',')[0].replace(/['"]/g, '');
        setInspectorValue('fontFamily', fontFamily);
        setInspectorValue('fontSize', styles.fontSize + ' (' + pxToPt(styles.fontSize) + ')');
        setInspectorValue('fontWeight', fontWeightToName(styles.fontWeight));
        setInspectorValue('lineHeight', styles.lineHeight);
        
        // Couleurs
        const textColor = styles.color;
        const bgColor = styles.backgroundColor;
        
        setInspectorValue('textColor', rgbToHex(textColor));
        const textColorPreview = document.getElementById('textColorPreview');
        if (textColorPreview) textColorPreview.style.backgroundColor = textColor;
        
        setInspectorValue('bgColor', rgbToHex(bgColor));
        const bgColorPreview = document.getElementById('bgColorPreview');
        if (bgColorPreview) bgColorPreview.style.backgroundColor = bgColor;
        
        // Espacement
        setInspectorValue('margin', styles.margin);
        setInspectorValue('padding', styles.padding);
        
        // Conseils pour Word
        generateWordTips(element, styles, fontFamily);
    }
    
    function setInspectorValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
    
    // Fonctions utilitaires
    function rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') {
            return 'transparent';
        }
        
        const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return rgb;
        
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    
    function pxToPt(px) {
        const value = parseFloat(px);
        return Math.round(value * 0.75) + 'pt';
    }
    
    function pxToCm(px) {
        const value = parseFloat(px);
        const cm = value / 37.795;
        return cm.toFixed(2) + 'cm';
    }
    
    function fontWeightToName(weight) {
        const w = parseInt(weight);
        if (w <= 300) return 'Light (' + w + ')';
        if (w <= 400) return 'Normal (' + w + ')';
        if (w <= 500) return 'Medium (' + w + ')';
        if (w <= 600) return 'Semi-bold (' + w + ')';
        if (w <= 700) return 'Bold (' + w + ')';
        return 'Extra-bold (' + w + ')';
    }
    
    function generateWordTips(element, styles, fontFamily) {
        const tips = document.getElementById('wordTips');
        if (!tips) return;
        
        let wordFont = fontFamily;
        if (fontFamily.includes('Crimson')) {
            wordFont = 'Crimson Pro ou Georgia';
        } else if (fontFamily.includes('Source Sans')) {
            wordFont = 'Source Sans 3 ou Calibri';
        }
        
        let html = `<p><strong>Police:</strong> ${wordFont}</p>`;
        html += `<p><strong>Taille:</strong> ${pxToPt(styles.fontSize)}</p>`;
        
        const stylesList = [];
        if (parseInt(styles.fontWeight) >= 600) stylesList.push('Gras');
        if (styles.fontStyle === 'italic') stylesList.push('Italique');
        if (styles.textTransform === 'uppercase') stylesList.push('MAJUSCULES');
        
        if (stylesList.length > 0) {
            html += `<p><strong>Style:</strong> ${stylesList.join(', ')}</p>`;
        }
        
        const hexColor = rgbToHex(styles.color);
        if (hexColor !== '#000000' && hexColor !== '#1a202c') {
            html += `<p><strong>Couleur:</strong> ${hexColor}</p>`;
        }
        
        tips.innerHTML = html;
    }
    
    // Copier au clic
    document.querySelectorAll('.style-value.copyable').forEach(el => {
        el.addEventListener('click', function(e) {
            const text = this.textContent;
            navigator.clipboard.writeText(text).then(() => {
                showCopyTooltip(e.clientX, e.clientY);
            });
        });
    });
}

function showCopyTooltip(x, y) {
    let tooltip = document.getElementById('copyTooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'copyTooltip';
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = '✓ Copié !';
        document.body.appendChild(tooltip);
    }
    
    tooltip.style.left = x + 'px';
    tooltip.style.top = (y - 40) + 'px';
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.classList.add('show');
    
    setTimeout(() => {
        tooltip.classList.remove('show');
    }, 1200);
}
