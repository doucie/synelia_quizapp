/**
 * Template Mémoire - Script de navigation et Inspecteur de Styles
 */

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const navList = document.getElementById('navList');

    // Gérer la pagination automatique (DOIT être fait en premier)
    handlePageOverflow();

    // Générer la navigation automatiquement
    generateNavigation();

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

    /**
     * Génère la navigation à partir des sections du document
     */
    function generateNavigation() {
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(function(section) {
            const id = section.id;
            let title = '';

            // Déterminer le titre selon le type de section
            const sectionTitle = section.querySelector('.section-title');
            const chapterTitle = section.querySelector('.chapter-title');
            const partTitle = section.querySelector('.part-title');

            if (partTitle) {
                const partNumber = section.querySelector('.part-number');
                title = partNumber ? partNumber.textContent : partTitle.textContent;
            } else if (chapterTitle) {
                title = chapterTitle.childNodes[0].textContent;
            } else if (sectionTitle) {
                title = sectionTitle.textContent;
            } else {
                // Utiliser l'ID formaté comme titre par défaut
                title = id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1');
            }

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#' + id;
            a.textContent = title;
            
            // Fermer la sidebar après navigation
            a.addEventListener('click', function() {
                sidebar.classList.remove('open');
            });

            li.appendChild(a);
            navList.appendChild(li);
        });
    }

    // Smooth scroll pour les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Indicateur de progression de lecture
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
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = progress + '%';
    });

    // ========================================
    // INSPECTEUR DE STYLES
    // ========================================
    
    initStyleInspector();

    console.log('📚 Template Mémoire chargé avec succès');
});

/**
 * Initialise l'inspecteur de styles
 */
function initStyleInspector() {
    const inspector = document.getElementById('styleInspector');
    const inspectorToggle = document.getElementById('inspectorToggle');
    const closeInspector = document.getElementById('closeInspector');
    const inspectorDetails = document.getElementById('inspectorDetails');
    const inspectorHint = document.querySelector('.inspector-hint');
    
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
    document.querySelector('.document').addEventListener('click', function(e) {
        if (!inspectorActive) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // Ne pas sélectionner le document lui-même
        if (e.target.classList.contains('document')) return;
        
        selectElement(e.target);
    });

    // Sélectionner un élément
    function selectElement(element) {
        // Retirer la sélection précédente
        if (selectedElement) {
            selectedElement.classList.remove('inspector-selected');
        }
        
        selectedElement = element;
        selectedElement.classList.add('inspector-selected');
        
        // Afficher les détails
        inspectorHint.style.display = 'none';
        inspectorDetails.style.display = 'block';
        
        // Analyser les styles
        analyzeStyles(element);
    }

    // Effacer la sélection
    function clearSelection() {
        if (selectedElement) {
            selectedElement.classList.remove('inspector-selected');
            selectedElement = null;
        }
        inspectorHint.style.display = 'block';
        inspectorDetails.style.display = 'none';
    }

    // Analyser les styles d'un élément
    function analyzeStyles(element) {
        const styles = window.getComputedStyle(element);
        
        // Élément
        document.getElementById('elemTag').textContent = element.tagName.toLowerCase();
        document.getElementById('elemClass').textContent = element.className.replace('inspector-selected', '').trim() || '-';
        
        // Typographie
        const fontFamily = styles.fontFamily.split(',')[0].replace(/['"]/g, '');
        document.getElementById('fontFamily').textContent = fontFamily;
        document.getElementById('fontSize').textContent = styles.fontSize + ' (' + pxToPt(styles.fontSize) + ')';
        document.getElementById('fontWeight').textContent = fontWeightToName(styles.fontWeight);
        document.getElementById('fontStyle').textContent = styles.fontStyle;
        document.getElementById('lineHeight').textContent = styles.lineHeight;
        document.getElementById('textAlign').textContent = styles.textAlign;
        
        // Couleurs
        const textColor = styles.color;
        const bgColor = styles.backgroundColor;
        
        document.getElementById('textColor').textContent = rgbToHex(textColor);
        document.getElementById('textColorPreview').style.backgroundColor = textColor;
        
        document.getElementById('bgColor').textContent = rgbToHex(bgColor);
        document.getElementById('bgColorPreview').style.backgroundColor = bgColor;
        
        // Bordures
        const borderLeft = styles.borderLeftWidth + ' ' + styles.borderLeftStyle + ' ' + styles.borderLeftColor;
        const borderAll = styles.border;
        
        let borderDisplay = '-';
        let borderColorDisplay = 'transparent';
        
        if (styles.borderLeftWidth !== '0px' && styles.borderLeftStyle !== 'none') {
            borderDisplay = styles.borderLeftWidth + ' ' + styles.borderLeftStyle;
            borderColorDisplay = styles.borderLeftColor;
        } else if (styles.borderTopWidth !== '0px' && styles.borderTopStyle !== 'none') {
            borderDisplay = styles.borderTopWidth + ' ' + styles.borderTopStyle;
            borderColorDisplay = styles.borderTopColor;
        } else if (styles.borderBottomWidth !== '0px' && styles.borderBottomStyle !== 'none') {
            borderDisplay = styles.borderBottomWidth + ' ' + styles.borderBottomStyle;
            borderColorDisplay = styles.borderBottomColor;
        }
        
        document.getElementById('border').textContent = borderDisplay;
        document.getElementById('borderColor').textContent = rgbToHex(borderColorDisplay);
        document.getElementById('borderColorPreview').style.backgroundColor = borderColorDisplay;
        document.getElementById('borderRadius').textContent = styles.borderRadius !== '0px' ? styles.borderRadius : '-';
        
        // Espacement
        document.getElementById('margin').textContent = styles.margin;
        document.getElementById('padding').textContent = styles.padding;
        
        // Dimensions
        document.getElementById('width').textContent = styles.width + ' (' + pxToCm(styles.width) + ')';
        document.getElementById('height').textContent = styles.height + ' (' + pxToCm(styles.height) + ')';
        
        // Dégradés
        analyzeGradient(element, styles);
        
        // Conseils pour Word
        generateWordTips(element, styles, fontFamily);
    }
    
    // Analyser les dégradés
    function analyzeGradient(element, styles) {
        const gradientSection = document.getElementById('gradientSection');
        const gradientType = document.getElementById('gradientType');
        const gradientColors = document.getElementById('gradientColors');
        
        const bgImage = styles.backgroundImage;
        
        if (bgImage && bgImage !== 'none') {
            gradientSection.style.display = 'block';
            
            if (bgImage.includes('linear-gradient')) {
                gradientType.textContent = 'Dégradé linéaire';
            } else if (bgImage.includes('radial-gradient')) {
                gradientType.textContent = 'Dégradé radial';
            } else {
                gradientType.textContent = 'Image';
            }
            
            // Extraire les couleurs du dégradé
            const colorMatches = bgImage.match(/rgb[a]?\([^)]+\)|#[a-fA-F0-9]{3,8}/g);
            gradientColors.innerHTML = '';
            
            if (colorMatches) {
                colorMatches.forEach(color => {
                    const hex = rgbToHex(color);
                    const item = document.createElement('div');
                    item.className = 'gradient-color-item';
                    item.innerHTML = `<span class="gradient-color-swatch" style="background:${color}"></span>${hex}`;
                    item.addEventListener('click', (e) => {
                        navigator.clipboard.writeText(hex);
                        showCopyTooltip(e.clientX, e.clientY);
                    });
                    gradientColors.appendChild(item);
                });
            }
        } else {
            gradientSection.style.display = 'none';
        }
    }

    // Générer des conseils pour Word
    function generateWordTips(element, styles, fontFamily) {
        const tips = document.getElementById('wordTips');
        const className = element.className.replace('inspector-selected', '').trim();
        const tagName = element.tagName.toLowerCase();
        let html = '';
        
        // Détecter le type d'élément
        const isSeparator = className.includes('separator');
        const isContainer = className.includes('info') || className.includes('content') || className.includes('tech-');
        const isDecorative = isSeparator || (tagName === 'div' && parseFloat(styles.height) < 10);
        
        if (isSeparator) {
            // Conseils pour les séparateurs/lignes
            html += `<p class="tip-title">🔹 Créer cette ligne dans Word :</p>`;
            html += `<ul>`;
            html += `<li><strong>Largeur:</strong> ${pxToCm(styles.width)}</li>`;
            html += `<li><strong>Hauteur:</strong> ${pxToCm(styles.height)}</li>`;
            
            const bgImage = styles.backgroundImage;
            if (bgImage.includes('gradient')) {
                html += `<li><strong>Méthode:</strong> Insertion → Formes → Rectangle</li>`;
                html += `<li><strong>Remplissage:</strong> Dégradé (voir couleurs ci-dessus)</li>`;
            } else {
                const bgColor = rgbToHex(styles.backgroundColor);
                html += `<li><strong>Couleur:</strong> ${bgColor}</li>`;
                html += `<li><strong>Méthode:</strong> Insertion → Formes → Rectangle sans contour</li>`;
            }
            html += `</ul>`;
            
        } else if (isContainer || className.includes('cover-info') || className.includes('tech-item')) {
            // Conseils pour les encadrés/conteneurs
            html += `<p class="tip-title">🔹 Créer cet encadré dans Word :</p>`;
            html += `<ul>`;
            
            if (styles.borderLeftWidth !== '0px' && styles.borderLeftStyle !== 'none') {
                html += `<li><strong>Bordure gauche:</strong> ${styles.borderLeftWidth} (${pxToCm(styles.borderLeftWidth)})</li>`;
                html += `<li><strong>Couleur bordure:</strong> ${rgbToHex(styles.borderLeftColor)}</li>`;
            }
            
            const bgColor = rgbToHex(styles.backgroundColor);
            if (bgColor !== 'transparent' && bgColor !== '#ffffff') {
                html += `<li><strong>Fond:</strong> ${bgColor}</li>`;
            }
            
            html += `<li><strong>Marge interne:</strong> ${styles.padding}</li>`;
            html += `<li><strong>Méthode:</strong> Sélectionner le texte → Bordures et trames → Encadrement</li>`;
            html += `</ul>`;
            
        } else if (className.includes('logo') || className.includes('placeholder') || className.includes('figure')) {
            // Conseils pour les emplacements d'images
            html += `<p class="tip-title">🔹 Emplacement image :</p>`;
            html += `<ul>`;
            html += `<li><strong>Largeur:</strong> ${pxToCm(styles.width)}</li>`;
            html += `<li><strong>Hauteur:</strong> ${pxToCm(styles.height)}</li>`;
            html += `<li><strong>Méthode:</strong> Insertion → Images</li>`;
            html += `</ul>`;
            
        } else {
            // Conseils généraux pour le texte
            let wordFont = fontFamily;
            if (fontFamily.includes('Crimson')) {
                wordFont = 'Crimson Pro ou Georgia';
            } else if (fontFamily.includes('Source Sans')) {
                wordFont = 'Source Sans 3 ou Calibri';
            }
            
            html += `<p><strong>Police:</strong> ${wordFont}</p>`;
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
            
            if (styles.letterSpacing !== 'normal' && styles.letterSpacing !== '0px') {
                html += `<p><strong>Espacement lettres:</strong> ${styles.letterSpacing}</p>`;
            }
        }
        
        tips.innerHTML = html;
    }

    // Convertir RGB en HEX
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

    // Convertir px en pt
    function pxToPt(px) {
        const value = parseFloat(px);
        return Math.round(value * 0.75) + 'pt';
    }
    
    // Convertir px en cm
    function pxToCm(px) {
        const value = parseFloat(px);
        const cm = value / 37.795; // 1cm ≈ 37.795px
        return cm.toFixed(2) + 'cm';
    }

    // Convertir font-weight en nom
    function fontWeightToName(weight) {
        const w = parseInt(weight);
        if (w <= 300) return 'Light (' + w + ')';
        if (w <= 400) return 'Normal (' + w + ')';
        if (w <= 500) return 'Medium (' + w + ')';
        if (w <= 600) return 'Semi-bold (' + w + ')';
        if (w <= 700) return 'Bold (' + w + ')';
        return 'Extra-bold (' + w + ')';
    }

    // Copier au clic avec tooltip
    document.querySelectorAll('.style-value.copyable').forEach(el => {
        el.addEventListener('click', function(e) {
            const text = this.textContent;
            navigator.clipboard.writeText(text).then(() => {
                this.classList.add('copied');
                showCopyTooltip(e.clientX, e.clientY);
                setTimeout(() => this.classList.remove('copied'), 1000);
            });
        });
    });

    // Afficher le tooltip "Copié"
    function showCopyTooltip(x, y) {
        // Créer ou réutiliser le tooltip
        let tooltip = document.getElementById('copyTooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'copyTooltip';
            tooltip.className = 'copy-tooltip';
            tooltip.textContent = '✓ Copié !';
            document.body.appendChild(tooltip);
        }
        
        // Positionner le tooltip au-dessus du clic
        tooltip.style.left = x + 'px';
        tooltip.style.top = (y - 40) + 'px';
        tooltip.style.transform = 'translateX(-50%) translateY(0)';
        
        // Afficher
        tooltip.classList.add('show');
        
        // Masquer après un délai
        setTimeout(() => {
            tooltip.classList.remove('show');
        }, 1200);
    }

    // ========================================
    // NAVIGATEUR DE PAGES
    // ========================================
    initPageNavigator();

    function initPageNavigator() {
        const pages = document.querySelectorAll('.page');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const indicator = document.getElementById('pageIndicator');
        const chapterSelect = document.getElementById('chapterSelect');
        
        let currentPage = 0;
        const totalPages = pages.length;

        // Ajouter les numéros de page
        addPageNumbers(pages);

        // Remplir le sélecteur de chapitres
        populateChapterSelect(chapterSelect);

        // Mettre à jour l'indicateur
        function updateIndicator() {
            indicator.textContent = `${currentPage + 1} / ${totalPages}`;
            prevBtn.disabled = currentPage === 0;
            nextBtn.disabled = currentPage === totalPages - 1;
        }

        // Aller à une page
        function goToPage(index) {
            if (index >= 0 && index < totalPages) {
                currentPage = index;
                pages[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
                updateIndicator();
            }
        }

        // Navigation précédent/suivant
        prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
        nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

        // Navigation par chapitre
        chapterSelect.addEventListener('change', function() {
            if (this.value) {
                const target = document.getElementById(this.value);
                if (target) {
                    const page = target.closest('.page');
                    if (page) {
                        const pageIndex = Array.from(pages).indexOf(page);
                        goToPage(pageIndex);
                    }
                }
                this.selectedIndex = 0; // Reset selection
            }
        });

        // Détecter la page courante au scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPos = window.scrollY + window.innerHeight / 3;
                
                for (let i = pages.length - 1; i >= 0; i--) {
                    const pageTop = pages[i].offsetTop;
                    if (scrollPos >= pageTop) {
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
            // Ignorer si on est dans un champ de formulaire
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }
            
            if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                e.preventDefault();
                goToPage(currentPage - 1);
            } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                e.preventDefault();
                goToPage(currentPage + 1);
            } else if (e.key === 'Home') {
                e.preventDefault();
                goToPage(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                goToPage(totalPages - 1);
            }
        });

        updateIndicator();
    }

    /**
     * Ajoute les numéros de page à chaque page
     */
    function addPageNumbers(pages) {
        // Pages liminaires en chiffres romains (avant l'introduction)
        const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 
                               'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx'];
        
        let romanCount = 0;
        let arabicCount = 0;
        let foundIntroduction = false;

        pages.forEach((page, index) => {
            // La page de couverture n'a pas de numéro
            if (page.classList.contains('cover-page')) {
                return;
            }

            // Vérifier si on est à l'introduction
            const introSection = page.querySelector('#introduction');
            if (introSection) {
                foundIntroduction = true;
                arabicCount = 1;
            }

            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';

            if (!foundIntroduction) {
                // Numérotation romaine pour les pages liminaires
                pageNumber.classList.add('page-number-roman');
                pageNumber.textContent = romanNumerals[romanCount] || (romanCount + 1);
                romanCount++;
            } else {
                // Numérotation arabe à partir de l'introduction
                pageNumber.textContent = arabicCount;
                arabicCount++;
            }

            page.appendChild(pageNumber);
        });
    }

    /**
     * Remplit le sélecteur de chapitres
     */
    function populateChapterSelect(select) {
        // Structure : Parties et Chapitres
        const structure = [
            { type: 'group', label: 'Préliminaires' },
            { id: 'couverture', label: 'Page de garde' },
            { id: 'remerciements', label: 'Remerciements' },
            { id: 'resume', label: 'Résumé / Abstract' },
            { id: 'sommaire', label: 'Sommaire' },
            { id: 'avant-propos', label: 'Avant-propos' },
            { id: 'glossaire', label: 'Glossaire' },
            { id: 'introduction', label: 'Introduction' },
            
            { type: 'group', label: 'Partie I - Présentation' },
            { id: 'chapitre1', label: 'Ch.1 - Présentation générale' },
            { id: 'chapitre2', label: 'Ch.2 - État de l\'art' },
            { id: 'chapitre3', label: 'Ch.3 - Cahier des charges' },
            
            { type: 'group', label: 'Partie II - Analyse' },
            { id: 'chapitre4', label: 'Ch.4 - Spécifications' },
            { id: 'chapitre5', label: 'Ch.5 - Conception' },
            
            { type: 'group', label: 'Partie III - Développement' },
            { id: 'chapitre6', label: 'Ch.6 - Technologies' },
            { id: 'chapitre7', label: 'Ch.7 - Implémentation' },
            
            { type: 'group', label: 'Partie IV - Bilan' },
            { id: 'chapitre8', label: 'Ch.8 - Tests & Validation' },
            { id: 'chapitre9', label: 'Ch.9 - Bilan & Perspectives' },
            
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
            } else if (item.id) {
                // Vérifier si l'élément existe dans le document
                if (document.getElementById(item.id)) {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = item.label;
                    
                    if (currentGroup) {
                        currentGroup.appendChild(option);
                    } else {
                        select.appendChild(option);
                    }
                }
            }
        });
    }

    // ========================================
    // GESTION DES DÉBORDEMENTS DE PAGE
    // ========================================
    
    /**
     * Gère les débordements de contenu en créant des pages de continuation
     * Cette fonction parcourt toutes les pages et redistribue le contenu
     */
    function handlePageOverflow() {
        const documentEl = document.querySelector('.document');
        if (!documentEl) return;

        // Constantes de dimensions (en pixels)
        const CM_TO_PX = 37.795275591;
        const PAGE_HEIGHT = 29.7 * CM_TO_PX;  // 29.7cm
        const MARGIN = 2.5 * CM_TO_PX;        // 2.5cm
        const SAFE_ZONE = 30;                  // Marge de sécurité supplémentaire en px
        
        // Hauteur utilisable pour le contenu (padding top + bottom = margin * 2)
        const USABLE_HEIGHT = PAGE_HEIGHT - (MARGIN * 2) - SAFE_ZONE;

        console.log('📄 Pagination - Hauteur utilisable:', Math.round(USABLE_HEIGHT), 'px (~', (USABLE_HEIGHT / CM_TO_PX).toFixed(1), 'cm)');

        // Temporairement permettre le débordement pour calculer les hauteurs
        documentEl.classList.add('calculating-overflow');

        // Traitement itératif des pages (max 100 itérations pour éviter boucle infinie)
        let iterations = 0;
        const MAX_ITERATIONS = 100;

        function processAllPages() {
            if (iterations >= MAX_ITERATIONS) {
                console.warn('⚠️ Pagination: limite d\'itérations atteinte');
                documentEl.classList.remove('calculating-overflow');
                return;
            }
            iterations++;

            const pages = Array.from(documentEl.querySelectorAll('.page:not(.cover-page):not(.part-page)'));
            
            for (const page of pages) {
                if (splitPageIfNeeded(page, documentEl, USABLE_HEIGHT)) {
                    // Une page a été modifiée, on recommence
                    requestAnimationFrame(processAllPages);
                    return;
                }
            }
            
            // Pagination terminée - rétablir le masquage
            documentEl.classList.remove('calculating-overflow');
            console.log('✅ Pagination terminée après', iterations, 'itération(s)');
        }

        // Démarrer après un court délai pour que le DOM soit bien rendu
        setTimeout(processAllPages, 100);
    }

    /**
     * Vérifie si une page déborde et la divise si nécessaire
     * @param {Element} page - La page à vérifier
     * @param {Element} documentEl - Le conteneur document
     * @param {number} usableHeight - Hauteur utilisable en pixels
     * @returns {boolean} true si la page a été modifiée
     */
    function splitPageIfNeeded(page, documentEl, usableHeight) {
        // Récupérer tous les éléments enfants directs (sauf numéro de page)
        const children = Array.from(page.children).filter(el => 
            !el.classList.contains('page-number')
        );

        if (children.length === 0) return false;

        // Calculer la hauteur totale du contenu
        let contentHeight = 0;
        let overflowIndex = -1;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const style = getComputedStyle(child);
            const marginTop = parseFloat(style.marginTop) || 0;
            const marginBottom = parseFloat(style.marginBottom) || 0;
            const childHeight = child.offsetHeight + marginTop + marginBottom;

            // Vérifier si cet élément fait dépasser
            if (contentHeight + childHeight > usableHeight) {
                overflowIndex = i;
                break;
            }

            contentHeight += childHeight;
        }

        // Pas de débordement
        if (overflowIndex === -1) {
            page.classList.remove('has-overflow');
            return false;
        }

        // Marquer comme ayant un débordement (debug)
        page.classList.add('has-overflow');

        // Créer une page de continuation
        const continuationPage = document.createElement('section');
        continuationPage.className = 'page continuation-page';

        // Récupérer l'ID du parent pour navigation
        const pageId = page.id || page.getAttribute('data-parent');
        if (pageId) {
            continuationPage.setAttribute('data-parent', pageId.replace('-suite', '').replace(/-\d+$/, ''));
        }

        // Déplacer les éléments qui débordent vers la nouvelle page
        for (let i = overflowIndex; i < children.length; i++) {
            continuationPage.appendChild(children[i]);
        }

        // Insérer la nouvelle page après l'actuelle
        page.after(continuationPage);
        page.classList.remove('has-overflow');

        console.log('📄 Page divisée:', page.id || 'continuation', '- éléments déplacés:', children.length - overflowIndex);

        return true;
    }
}
