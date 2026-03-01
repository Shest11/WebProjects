(function() {
    // ---------- ПАРАЛЛАКС (видео) ----------
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3; // скорость смещения
            heroVideo.style.transform = `translateY(${rate}px)`;
        });
    }

    // ---------- АНИМАЦИИ ПРИ СКРОЛЛЕ (Intersection Observer) ----------
    const fadeElements = document.querySelectorAll('.fade-up, .feature-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

    fadeElements.forEach(el => observer.observe(el));

    // ---------- ГОРИЗОНТАЛЬНЫЙ СКРОЛЛ ГАЛЕРЕИ (DRAG + СВАЙП) ----------
    const gallery = document.getElementById('galleryContainer');
    if (gallery) {
        let isDown = false;
        let startX;
        let startY;
        let scrollLeft;
        let startScrollLeft;
        let isDragging = false;
        
        // Для тач-событий (свайпы на мобильных)
        gallery.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - gallery.offsetLeft;
            startY = e.touches[0].pageY;
            startScrollLeft = gallery.scrollLeft;
            gallery.style.cursor = 'grabbing';
            isDragging = false;
        });
        
        gallery.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            e.preventDefault(); // предотвращаем вертикальный скролл страницы
            const x = e.touches[0].pageX - gallery.offsetLeft;
            const walk = (x - startX) * 2; // скорость свайпа
            gallery.scrollLeft = startScrollLeft - walk;
            
            // Определяем, что это был свайп (не тап)
            if (Math.abs(e.touches[0].pageY - startY) < 10) {
                isDragging = true;
            }
        });
        
        gallery.addEventListener('touchend', () => {
            isDown = false;
            gallery.style.cursor = 'grab';
            
            // Если это был клик по ссылке/кнопке внутри, не блокируем
            if (!isDragging) {
                // Позволяем обычный клик
            }
        });
        
        // Для мыши (drag-скролл на компьютере)
        gallery.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - gallery.offsetLeft;
            startScrollLeft = gallery.scrollLeft;
            gallery.style.cursor = 'grabbing';
            isDragging = false;
        });
        
        gallery.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - gallery.offsetLeft;
            const walk = (x - startX) * 2;
            gallery.scrollLeft = startScrollLeft - walk;
            
            if (Math.abs(walk) > 5) {
                isDragging = true;
            }
        });
        
        gallery.addEventListener('mouseup', () => {
            isDown = false;
            gallery.style.cursor = 'grab';
        });
        
        gallery.addEventListener('mouseleave', () => {
            isDown = false;
            gallery.style.cursor = 'grab';
        });
        
        // ПОЛНОСТЬЮ УБИРАЕМ скролл колесом мыши
        // Раньше тут был wheel-event, теперь его нет
        
        // Дополнительно: отключаем стандартный вертикальный скролл при свайпе на галерее
        gallery.addEventListener('touchstart', (e) => {
            // Запоминаем начальную позицию для определения направления
            gallery.dataset.touchStartX = e.touches[0].pageX;
        }, { passive: true });
    }

    // ---------- ФОРМА (валидация + отправка через Formspree) ----------
    const form = document.getElementById('contactForm');
    const statusDiv = document.getElementById('formStatus');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Валидация
        const name = form.elements['name'].value.trim();
        const contact = form.elements['contact'].value.trim();
        const message = form.elements['message'].value.trim();

        if (!name || !contact || !message) {
            statusDiv.textContent = 'Все поля обязательны для заполнения.';
            statusDiv.classList.add('error');
            return;
        }

        // Проверка поля contact (email или телефон)
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
        const isPhone = /^[\d\+\-\(\)\s]{10,}$/.test(contact); // простая проверка: минимум 10 цифр
        if (!isEmail && !isPhone) {
            statusDiv.textContent = 'Введите корректный email или телефон (не менее 10 цифр).';
            statusDiv.classList.add('error');
            return;
        }

        statusDiv.textContent = 'Отправка...';
        statusDiv.classList.remove('error');

        // Подготовка данных для Formspree
        const formData = new FormData(form);
        // Добавляем поле для Formspree, если нужно
        formData.append('_gotcha', ''); // антиспам

        try {
            // ЗАМЕНИТЕ URL на ваш актуальный endpoint Formspree
            const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                statusDiv.textContent = 'Спасибо! Заявка отправлена. Мы свяжемся с вами.';
                form.reset();
            } else {
                const data = await response.json();
                if (data.errors) {
                    statusDiv.textContent = 'Ошибка: ' + data.errors.map(e => e.message).join(', ');
                } else {
                    statusDiv.textContent = 'Произошла ошибка при отправке. Попробуйте позже.';
                }
                statusDiv.classList.add('error');
            }
        } catch (error) {
            statusDiv.textContent = 'Ошибка соединения. Проверьте интернет.';
            statusDiv.classList.add('error');
        }
    });

    // ---------- ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ (дополнительно) ----------
    // (уже реализовано через css scroll-behavior, но если хотим мягко обработать клики)
    document.querySelectorAll('.nav-links a, .btn[href="#form"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

        // ---------- ГАМБУРГЕР МЕНЮ ----------
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    // Открытие/закрытие меню
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Блокируем скролл body при открытом меню
        if (mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Закрытие меню при клике на overlay
    overlay.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Закрытие при изменении размера экрана (если стали ПК)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Отключаем восстановление позиции скролла при обновлении
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
})();