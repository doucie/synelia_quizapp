/**
 * Template Cahier des Charges - Système de Pagination Dynamique
 * 
 * Ce script lit le contenu depuis #contentSource et le répartit
 * dynamiquement sur des pages A4 générées automatiquement.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Initialisation du template Cahier des Charges...');
    
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
    
    console.log('✅ Template Cahier des Charges chargé avec succès');
});

// ============================================
// THEME TOGGLE (DARK/LIGHT MODE)
// ============================================

function initThemeToggle() {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;
    
    const savedTheme = localStorage.getItem('cdc-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    toggleBtn.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? '' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('cdc-theme', newTheme);
        
        console.log('🌓 Thème changé:', newTheme || 'light');
    });
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('cdc-theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : '');
        }
    });
    
    console.log('🌓 Theme toggle initialisé');
}

// ============================================
// SYSTÈME DE PAGINATION DYNAMIQUE
// ============================================

const CM_TO_PX = 37.795275591;
const PAGE_WIDTH = 21 * CM_TO_PX;
const PAGE_HEIGHT = 29.7 * CM_TO_PX;
const MARGIN_TOP = 2.5 * CM_TO_PX;
const MARGIN_BOTTOM = 2.5 * CM_TO_PX;
const MARGIN_LEFT = 2.5 * CM_TO_PX;
const MARGIN_RIGHT = 2.5 * CM_TO_PX;
const SAFE_ZONE = 20;

const USABLE_HEIGHT = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM - SAFE_ZONE;

console.log('📏 Dimensions page - Hauteur utilisable:', Math.round(USABLE_HEIGHT), 'px (~', (USABLE_HEIGHT / CM_TO_PX).toFixed(1), 'cm)');

function generatePagesFromContent() {
    const contentSource = document.getElementById('contentSource');
    const documentContainer = document.getElementById('documentContainer');
    
    if (!contentSource || !documentContainer) {
        console.error('❌ contentSource ou documentContainer introuvable');
        return;
    }
    
    documentContainer.innerHTML = '';
    
    const elements = Array.from(contentSource.children);
    
    let currentPage = null;
    let currentPageContent = null;
    let currentHeight = 0;
    let pageCount = 0;
    let currentSectionId = null;
    let currentSectionTitle = null;
    
    // Fonction helper pour créer une nouvelle page
    function startNewPage(sectionId, sectionTitle) {
        currentPage = createNewPage(documentContainer, sectionId, sectionTitle, ++pageCount);
        currentPageContent = currentPage.querySelector('.page-content');
        currentHeight = 0;
    }
    
    // Fonction helper pour ajouter un élément à la page courante
    function addElementToPage(element) {
        currentPageContent.appendChild(element);
        void element.offsetHeight;
        const height = getElementHeight(element);
        currentHeight += height;
        return height;
    }
    
    // Fonction pour diviser un tableau sur plusieurs pages
    function splitTableAcrossPages(table) {
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        const rows = tbody ? Array.from(tbody.querySelectorAll('tr')) : Array.from(table.querySelectorAll('tr:not(thead tr)'));
        
        if (rows.length === 0) {
            // Pas de lignes, ajouter le tableau tel quel
            const clone = table.cloneNode(true);
            if (currentHeight + getElementHeight(clone) > USABLE_HEIGHT && currentHeight > 0) {
                startNewPage(null, null);
            }
            addElementToPage(clone);
            return;
        }
        
        // Calculer la hauteur du header
        let headerHeight = 0;
        if (thead) {
            const tempTable = document.createElement('table');
            tempTable.className = table.className;
            tempTable.appendChild(thead.cloneNode(true));
            currentPageContent.appendChild(tempTable);
            void tempTable.offsetHeight;
            headerHeight = getElementHeight(tempTable);
            currentPageContent.removeChild(tempTable);
        }
        
        // Créer le premier tableau avec le header
        let currentTable = document.createElement('table');
        currentTable.className = table.className;
        if (thead) {
            currentTable.appendChild(thead.cloneNode(true));
        }
        let currentTbody = document.createElement('tbody');
        currentTable.appendChild(currentTbody);
        
        // Calculer l'espace disponible
        let availableHeight = USABLE_HEIGHT - currentHeight - headerHeight - 20; // 20px marge sécurité
        
        // Si pas assez d'espace pour au moins le header + 1 ligne, nouvelle page
        if (availableHeight < 50) {
            startNewPage(null, null);
            availableHeight = USABLE_HEIGHT - headerHeight - 20;
        }
        
        let tableStarted = false;
        let isFirstTablePart = true;
        
        rows.forEach((row, rowIndex) => {
            // Mesurer la hauteur de la ligne
            const tempRow = row.cloneNode(true);
            const tempTable = document.createElement('table');
            tempTable.className = table.className;
            tempTable.style.visibility = 'hidden';
            tempTable.style.position = 'absolute';
            const tempTbody = document.createElement('tbody');
            tempTbody.appendChild(tempRow);
            tempTable.appendChild(tempTbody);
            currentPageContent.appendChild(tempTable);
            void tempTable.offsetHeight;
            const rowHeight = tempRow.offsetHeight + 2; // +2 pour borders
            currentPageContent.removeChild(tempTable);
            
            // Vérifier si la ligne rentre dans l'espace disponible
            if (availableHeight < rowHeight) {
                // Ajouter le tableau courant à la page
                if (currentTbody.children.length > 0) {
                    if (!isFirstTablePart) {
                        // Ajouter indication "suite" au début du tableau
                        currentTable.classList.add('table-continued');
                    }
                    addElementToPage(currentTable);
                    tableStarted = false;
                }
                
                // Nouvelle page
                startNewPage(null, null);
                
                // Nouveau tableau avec header répété
                currentTable = document.createElement('table');
                currentTable.className = table.className;
                currentTable.classList.add('table-continuation');
                if (thead) {
                    currentTable.appendChild(thead.cloneNode(true));
                }
                currentTbody = document.createElement('tbody');
                currentTable.appendChild(currentTbody);
                
                availableHeight = USABLE_HEIGHT - headerHeight - 20;
                isFirstTablePart = false;
            }
            
            // Ajouter la ligne au tableau courant
            currentTbody.appendChild(row.cloneNode(true));
            availableHeight -= rowHeight;
            tableStarted = true;
        });
        
        // Ajouter le dernier tableau
        if (tableStarted && currentTbody.children.length > 0) {
            if (!isFirstTablePart) {
                currentTable.classList.add('table-continuation');
            }
            addElementToPage(currentTable);
        }
    }
    
    // Fonction pour diviser une liste de définitions (glossaire) sur plusieurs pages
    function splitDefinitionListAcrossPages(dl) {
        const children = Array.from(dl.children);
        
        if (children.length === 0) {
            const clone = dl.cloneNode(true);
            if (currentHeight + getElementHeight(clone) > USABLE_HEIGHT && currentHeight > 0) {
                startNewPage(null, null);
            }
            addElementToPage(clone);
            return;
        }
        
        // Regrouper les dt/dd en paires
        const pairs = [];
        let currentPair = null;
        
        children.forEach(child => {
            if (child.tagName === 'DT') {
                if (currentPair) {
                    pairs.push(currentPair);
                }
                currentPair = { dt: child, dds: [] };
            } else if (child.tagName === 'DD' && currentPair) {
                currentPair.dds.push(child);
            }
        });
        if (currentPair) {
            pairs.push(currentPair);
        }
        
        // Créer la première liste
        let currentDl = document.createElement('dl');
        currentDl.className = dl.className;
        
        let availableHeight = USABLE_HEIGHT - currentHeight - 20;
        
        if (availableHeight < 60) {
            startNewPage(null, null);
            availableHeight = USABLE_HEIGHT - 20;
        }
        
        let dlStarted = false;
        let isFirstPart = true;
        
        pairs.forEach((pair, pairIndex) => {
            // Mesurer la hauteur de cette paire dt/dd
            const tempDl = document.createElement('dl');
            tempDl.className = dl.className;
            tempDl.style.visibility = 'hidden';
            tempDl.style.position = 'absolute';
            tempDl.style.width = '100%';
            tempDl.appendChild(pair.dt.cloneNode(true));
            pair.dds.forEach(dd => tempDl.appendChild(dd.cloneNode(true)));
            currentPageContent.appendChild(tempDl);
            void tempDl.offsetHeight;
            const pairHeight = getElementHeight(tempDl);
            currentPageContent.removeChild(tempDl);
            
            // Vérifier si la paire rentre dans l'espace disponible
            if (availableHeight < pairHeight && dlStarted) {
                // Ajouter la liste courante à la page
                if (currentDl.children.length > 0) {
                    if (!isFirstPart) {
                        currentDl.classList.add('glossary-continuation');
                    }
                    addElementToPage(currentDl);
                }
                
                // Nouvelle page
                startNewPage(null, null);
                
                // Nouvelle liste
                currentDl = document.createElement('dl');
                currentDl.className = dl.className;
                currentDl.classList.add('glossary-continuation');
                
                availableHeight = USABLE_HEIGHT - 20;
                isFirstPart = false;
                dlStarted = false;
            }
            
            // Ajouter la paire à la liste courante
            currentDl.appendChild(pair.dt.cloneNode(true));
            pair.dds.forEach(dd => currentDl.appendChild(dd.cloneNode(true)));
            availableHeight -= pairHeight;
            dlStarted = true;
        });
        
        // Ajouter la dernière liste
        if (dlStarted && currentDl.children.length > 0) {
            if (!isFirstPart) {
                currentDl.classList.add('glossary-continuation');
            }
            addElementToPage(currentDl);
        }
    }
    
    elements.forEach((element, index) => {
        // Marqueur de page-break
        if (element.classList.contains('page-break')) {
            currentSectionId = element.dataset.section || null;
            currentSectionTitle = element.dataset.title || null;
            
            if (element.dataset.type === 'section') {
                return;
            }
            
            startNewPage(currentSectionId, currentSectionTitle);
            currentSectionId = null;
            currentSectionTitle = null;
            
            return;
        }
        
        // Contenu de couverture
        if (element.classList.contains('cover-content')) {
            createCoverPage(documentContainer, element);
            pageCount++;
            currentPage = null;
            currentPageContent = null;
            currentHeight = 0;
            return;
        }
        
        // Contenu de section (page de partie)
        if (element.classList.contains('section-content')) {
            createSectionPage(documentContainer, element, currentSectionId);
            pageCount++;
            currentPage = null;
            currentPageContent = null;
            currentHeight = 0;
            currentSectionId = null;
            return;
        }
        
        // Créer une page si nécessaire
        if (!currentPage || !currentPageContent) {
            startNewPage(currentSectionId, currentSectionTitle);
            currentSectionId = null;
            currentSectionTitle = null;
        }
        
        // Traitement spécial pour les tableaux
        if (element.tagName === 'TABLE') {
            splitTableAcrossPages(element);
            return;
        }
        
        // Traitement spécial pour les listes de définitions (glossaire)
        if (element.tagName === 'DL') {
            splitDefinitionListAcrossPages(element);
            return;
        }
        
        // Traitement spécial pour les éléments contenant des tableaux (comme les divs)
        if (element.querySelector && element.querySelector('table')) {
            // Cloner sans les tableaux d'abord
            const clone = element.cloneNode(true);
            const tablesInClone = clone.querySelectorAll('table');
            
            // Si l'élément contient UNIQUEMENT un tableau, traiter le tableau directement
            if (tablesInClone.length === 1 && element.children.length === 1 && element.children[0].tagName === 'TABLE') {
                splitTableAcrossPages(element.children[0]);
                return;
            }
            
            // Sinon, traiter l'élément normalement (le tableau sera peut-être coupé)
        }
        
        const clone = element.cloneNode(true);
        
        currentPageContent.appendChild(clone);
        
        void clone.offsetHeight;
        
        const elementHeight = getElementHeight(clone);
        
        // Si l'élément est trop grand pour la page ET c'est le premier élément
        if (elementHeight > USABLE_HEIGHT) {
            // L'élément est plus grand que la page entière - on le laisse déborder
            // mais on s'assure qu'il commence sur une nouvelle page
            if (currentHeight > 0) {
                currentPageContent.removeChild(clone);
                startNewPage(null, null);
                currentPageContent.appendChild(clone);
            }
            currentHeight = USABLE_HEIGHT; // Force nouvelle page pour le prochain élément
            console.warn('⚠️ Élément trop grand pour une page, considérez le diviser:', element.tagName);
            return;
        }
        
        if (currentHeight + elementHeight > USABLE_HEIGHT && currentHeight > 0) {
            currentPageContent.removeChild(clone);
            
            startNewPage(null, null);
            
            currentPageContent.appendChild(clone);
            currentHeight = elementHeight;
        } else {
            currentHeight += elementHeight;
        }
    });
    
    addPageNumbers();
    
    console.log(`📄 ${pageCount} pages générées`);
}

function createCoverPage(container, content) {
    const page = document.createElement('section');
    page.className = 'page cover-page';
    page.id = 'couverture';
    
    const pageContent = document.createElement('div');
    pageContent.className = 'page-content cover-content';
    
    pageContent.innerHTML = content.innerHTML;
    
    page.appendChild(pageContent);
    container.appendChild(page);
    
    return page;
}

function createSectionPage(container, content, sectionId) {
    const page = document.createElement('section');
    page.className = 'page section-page';
    
    if (sectionId) {
        page.id = sectionId;
    }
    
    const pageContent = document.createElement('div');
    pageContent.className = 'page-content section-content-wrapper';
    
    pageContent.innerHTML = content.innerHTML;
    
    page.appendChild(pageContent);
    container.appendChild(page);
    
    return page;
}

function createNewPage(container, sectionId, sectionTitle, pageNum) {
    const page = document.createElement('section');
    page.className = 'page';
    
    if (sectionId) {
        page.id = sectionId;
        
        if (sectionId.startsWith('chapitre') || sectionId.startsWith('section')) {
            page.classList.add('chapter-start');
        }
    } else {
        page.classList.add('continuation-page');
    }
    
    const pageContent = document.createElement('div');
    pageContent.className = 'page-content';
    
    page.appendChild(pageContent);
    container.appendChild(page);
    
    return page;
}

function getElementHeight(element) {
    const style = window.getComputedStyle(element);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    
    return element.offsetHeight + marginTop + marginBottom;
}

function addPageNumbers() {
    const pages = document.querySelectorAll('.page');
    
    let pageNum = 0;
    
    pages.forEach((page) => {
        if (page.classList.contains('cover-page')) {
            return;
        }
        
        if (page.classList.contains('section-page')) {
            return;
        }
        
        pageNum++;
        
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        pageNumber.textContent = pageNum;
        
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
    
    generateNavigation(navList);
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });
    
    closeSidebar.addEventListener('click', function() {
        sidebar.classList.remove('open');
    });
    
    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && e.target !== menuToggle) {
            sidebar.classList.remove('open');
        }
    });
}

function generateNavigation(navList) {
    const pages = document.querySelectorAll('.page[id]');
    
    let currentSection = null;
    
    pages.forEach(function(page) {
        const id = page.id;
        let title = '';
        let isSection = false;
        
        const chapterTitle = page.querySelector('.chapter-title');
        const pageTitle = page.querySelector('.page-title');
        const sectionMainTitle = page.querySelector('.section-main-title');
        const sectionNumber = page.querySelector('.section-number');
        
        if (sectionNumber && sectionMainTitle) {
            title = 'Partie ' + sectionNumber.textContent + ' - ' + sectionMainTitle.textContent;
            isSection = true;
        } else if (chapterTitle) {
            const chapterNum = chapterTitle.querySelector('.chapter-number');
            const chapterText = chapterTitle.querySelector('.chapter-text');
            if (chapterNum && chapterText) {
                title = chapterNum.textContent + '. ' + chapterText.textContent;
            } else {
                title = chapterTitle.textContent.trim();
            }
        } else if (pageTitle) {
            title = pageTitle.textContent;
        } else {
            title = id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
        }
        
        const li = document.createElement('li');
        
        if (isSection) {
            li.className = 'nav-section';
            const span = document.createElement('span');
            span.textContent = title;
            li.appendChild(span);
        } else {
            const a = document.createElement('a');
            a.href = '#' + id;
            a.textContent = title;
            
            a.addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.getElementById('sidebar').classList.remove('open');
            });
            
            li.appendChild(a);
        }
        
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
        { id: 'historique', label: 'Historique des versions' },
        { id: 'sommaire', label: 'Sommaire' },
        { id: 'introduction', label: 'Introduction' },
        
        { type: 'group', label: 'Partie I - Présentation' },
        { id: 'partie1', label: 'Page de partie' },
        { id: 'chapitre1', label: '1. Contexte du projet' },
        { id: 'chapitre2', label: '2. Objectifs' },
        { id: 'chapitre3', label: '3. Périmètre' },
        
        { type: 'group', label: 'Partie II - Acteurs' },
        { id: 'partie2', label: 'Page de partie' },
        { id: 'chapitre4', label: '4. Acteurs du système' },
        { id: 'chapitre5', label: '5. Cas d\'utilisation' },
        
        { type: 'group', label: 'Partie III - Spécifications' },
        { id: 'partie3', label: 'Page de partie' },
        { id: 'chapitre6', label: '6. Exigences fonctionnelles' },
        { id: 'chapitre7', label: '7. Exigences techniques' },
        
        { type: 'group', label: 'Partie IV - Architecture' },
        { id: 'partie4', label: 'Page de partie' },
        { id: 'chapitre8', label: '8. Architecture technique' },
        { id: 'chapitre9', label: '9. Sécurité' },
        
        { type: 'group', label: 'Annexes' },
        { id: 'glossaire', label: 'Glossaire' },
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
        background: linear-gradient(90deg, #22c55e, #0d4f3c);
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
        
        const elemTag = document.getElementById('elemTag');
        const elemClass = document.getElementById('elemClass');
        if (elemTag) elemTag.textContent = element.tagName.toLowerCase();
        if (elemClass) elemClass.textContent = element.className.replace('inspector-selected', '').trim() || '-';
        
        const fontFamily = styles.fontFamily.split(',')[0].replace(/['"]/g, '');
        setInspectorValue('fontFamily', fontFamily);
        setInspectorValue('fontSize', styles.fontSize + ' (' + pxToPt(styles.fontSize) + ')');
        setInspectorValue('fontWeight', fontWeightToName(styles.fontWeight));
        setInspectorValue('lineHeight', styles.lineHeight);
        
        const textColor = styles.color;
        const bgColor = styles.backgroundColor;
        
        setInspectorValue('textColor', rgbToHex(textColor));
        const textColorPreview = document.getElementById('textColorPreview');
        if (textColorPreview) textColorPreview.style.backgroundColor = textColor;
        
        setInspectorValue('bgColor', rgbToHex(bgColor));
        const bgColorPreview = document.getElementById('bgColorPreview');
        if (bgColorPreview) bgColorPreview.style.backgroundColor = bgColor;
        
        setInspectorValue('margin', styles.margin);
        setInspectorValue('padding', styles.padding);
        
        generateWordTips(element, styles, fontFamily);
    }
    
    function setInspectorValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
    
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
