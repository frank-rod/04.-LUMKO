document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-links');

    mobileMenu.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        // Animate hamburger to X (optional)
        mobileMenu.classList.toggle('is-active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenu.classList.remove('is-active');
        });
    });

    // ── Card Stack Portfolio ──
    const allProjects = [
        { id: 1, title: 'Dra. Sara Treviño', category: 'personales', href: 'https://www.drasaratrevino.com/', description: 'Sitio personal profesional', image: 'assets/images/drasaratrevino.png' },
        { id: 2, title: 'FJROD', category: 'personales', href: 'https://fjrod.com/', description: 'Portafolio personal creativo', image: 'assets/images/fjrod.png' },
        { id: 3, title: 'TLT Law Firm', category: 'corporativos', href: 'https://www.tltlawfirm.com/', description: 'Sitio corporativo legal', image: 'assets/images/tltlawfirm.png' },
        { id: 4, title: 'S. Careaga', category: 'corporativos', href: 'http://scareaga.com/', description: 'Presencia corporativa profesional', image: 'assets/images/scareaga.png' },
        { id: 5, title: 'Blake Corporation', category: 'corporativos', href: 'https://www.blakecorporation.com/', description: 'Web corporativa empresarial', image: '' },
        { id: 6, title: 'Cinco de Venus', category: 'real-estate', href: 'https://cincodevenus.com/', description: 'Proyecto inmobiliario premium', image: 'assets/images/cincodevenus.png' },
        { id: 7, title: 'RS Events Cancún', category: 'eventos', href: 'https://www.rseventscancun.com/', description: 'Organización de eventos', image: 'assets/images/rsevents.png' },
        { id: 8, title: 'Khanfusion', category: 'restaurantes', href: 'https://frank-rod.github.io/khanfusion/', description: 'Restaurante de fusión asiática', image: 'assets/images/khanfusion.png' },
        { id: 9, title: 'Diabetex', category: 'business', href: 'https://frank-rod.github.io/diabetex/', description: 'Plataforma de salud digital', image: 'assets/images/diabetex.png' },
        { id: 10, title: 'Dr. Baes', category: 'business', href: 'https://frank-rod.github.io/drbaes/', description: 'Consultorio médico online', image: 'assets/images/drbaes.png' },
    ];

    const stage = document.getElementById('card-stack-stage');
    const dotsContainer = document.getElementById('card-stack-dots');
    let currentItems = [...allProjects];
    let activeIndex = 0;
    let autoInterval = null;

    const CARD_W = 480;
    const CARD_H = 320;
    const OVERLAP = 0.48;
    const SPREAD_DEG = 48;
    const DEPTH = 140;
    const TILT_X = 12;
    const LIFT = 22;
    const MAX_VISIBLE = 7;

    function getMaxOffset() { return Math.floor(MAX_VISIBLE / 2); }

    function signedOffset(i, active, len) {
        const raw = i - active;
        const alt = raw > 0 ? raw - len : raw + len;
        return Math.abs(alt) < Math.abs(raw) ? alt : raw;
    }

    let cardElements = [];
    let dragStartX = 0;
    let isDragging = false;

    function buildCards() {
        stage.innerHTML = '';
        dotsContainer.innerHTML = '';
        cardElements = [];

        if (!currentItems.length) {
            stage.innerHTML = '<p style="text-align:center;color:var(--color-text-muted);padding:60px 0;">No hay proyectos en esta categoría aún.</p>';
            return;
        }

        currentItems.forEach((item, i) => {
            const card = document.createElement('div');
            card.className = 'card-stack-card';
            const imgHTML = item.image
                ? `<img src="${item.image}" alt="${item.title}" draggable="false">`
                : `<span>${item.title}</span>`;
            card.innerHTML = `
                <div class="card-img">${imgHTML}</div>
                <div class="card-gradient"></div>
                <div class="card-content">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                    <a href="${item.href}" target="_blank">Visitar Sitio <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (isDragging) return;
                activeIndex = i;
                updatePositions();
            });

            // Drag
            card.addEventListener('mousedown', (e) => { dragStartX = e.clientX; isDragging = false; });
            card.addEventListener('touchstart', (e) => { dragStartX = e.touches[0].clientX; isDragging = false; }, { passive: true });

            const endDrag = (endX) => {
                const diff = endX - dragStartX;
                if (Math.abs(diff) > 80) {
                    isDragging = true;
                    const len = currentItems.length;
                    activeIndex = ((activeIndex + (diff < 0 ? 1 : -1)) % len + len) % len;
                    updatePositions();
                    setTimeout(() => { isDragging = false; }, 50);
                }
            };
            card.addEventListener('mouseup', (e) => endDrag(e.clientX));
            card.addEventListener('touchend', (e) => endDrag(e.changedTouches[0].clientX));

            stage.appendChild(card);
            cardElements.push(card);
        });

        // Build dots
        currentItems.forEach((item, i) => {
            const dot = document.createElement('button');
            dot.className = 'card-stack-dot';
            dot.setAttribute('aria-label', item.title);
            dot.addEventListener('click', () => { activeIndex = i; updatePositions(); });
            dotsContainer.appendChild(dot);
        });

        updatePositions();
    }

    function updatePositions() {
        if (!currentItems.length) return;
        const len = currentItems.length;
        const maxOff = getMaxOffset();
        const spacing = Math.max(10, Math.round(CARD_W * (1 - OVERLAP)));
        const stepDeg = maxOff > 0 ? SPREAD_DEG / maxOff : 0;

        cardElements.forEach((card, i) => {
            const off = signedOffset(i, activeIndex, len);
            const abs = Math.abs(off);

            if (abs > maxOff) {
                card.style.opacity = '0';
                card.style.pointerEvents = 'none';
                card.style.zIndex = '0';
                return;
            }

            const rotateZ = off * stepDeg;
            const x = off * spacing;
            const y = abs * 10;
            const isActive = off === 0;
            const scale = isActive ? 1.03 : 0.94;
            const lift = isActive ? -LIFT : 0;
            const rotateX = isActive ? 0 : TILT_X;
            const zIndex = 100 - abs;

            card.style.zIndex = zIndex;
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
            card.style.transform = `translateX(${x}px) translateY(${y + lift}px) rotateZ(${rotateZ}deg) rotateX(${rotateX}deg) scale(${scale})`;
            card.classList.toggle('active', isActive);
        });

        // Update dots
        const dots = dotsContainer.querySelectorAll('.card-stack-dot');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
    }

    // Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            currentItems = filter === 'all' ? [...allProjects] : allProjects.filter(p => p.category === filter);
            activeIndex = 0;
            buildCards();
        });
    });

    // Auto-advance
    function startAuto() {
        clearInterval(autoInterval);
        autoInterval = setInterval(() => {
            if (!currentItems.length) return;
            activeIndex = (activeIndex + 1) % currentItems.length;
            updatePositions();
        }, 3000);
    }

    const wrapper = document.querySelector('.card-stack-wrapper');
    if (wrapper) {
        wrapper.addEventListener('mouseenter', () => clearInterval(autoInterval));
        wrapper.addEventListener('mouseleave', startAuto);
    }

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (!currentItems.length) return;
        const section = document.getElementById('portafolio');
        const rect = section.getBoundingClientRect();
        if (rect.top > window.innerHeight || rect.bottom < 0) return;
        if (e.key === 'ArrowLeft') { activeIndex = ((activeIndex - 1) % currentItems.length + currentItems.length) % currentItems.length; updatePositions(); }
        if (e.key === 'ArrowRight') { activeIndex = (activeIndex + 1) % currentItems.length; updatePositions(); }
    });

    buildCards();
    startAuto();

    // Contact Form Submission (Prevent default for now)
    const quoteForm = document.getElementById('quote-form');
    if(quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('¡Gracias por tu interés! Nos pondremos en contacto contigo pronto.');
            quoteForm.reset();
        });
    }

    // Lottie Animations Setup
    const lottieIcons = document.querySelectorAll('.icon-lottie');
    lottieIcons.forEach(icon => {
        const jsonPath = icon.getAttribute('data-json');
        if(jsonPath) {
            fetch(jsonPath)
                .then(res => res.json())
                .then(data => {
                    lottie.loadAnimation({
                        container: icon,
                        renderer: 'svg',
                        loop: true,
                        autoplay: true,
                        animationData: data
                    });
                })
                .catch(() => {
                    // Fallback: try with path
                    lottie.loadAnimation({
                        container: icon,
                        renderer: 'svg',
                        loop: true,
                        autoplay: true,
                        path: jsonPath
                    });
                });
        }
    });

    // Fade-in on scroll
    const fadeEls = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    fadeEls.forEach(el => observer.observe(el));

});
