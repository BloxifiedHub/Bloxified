/* ========================================
   VISITOR WEBHOOK TRACKER
   ======================================== */

(function() {
    const WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1518619425249431664/26ttGsRZyzc13CmEgzjerImLUo4TE9Hr9Cri6KFzNV7Be0wadYc2nt_Dm6Vuapa5mdwr'; // <-- Paste your Discord webhook URL here

    async function getVisitorInfo() {
        let ip = 'Unknown', country = 'Unknown', city = 'Unknown', isp = 'Unknown';
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            ip = data.ip || 'Unknown';
            country = data.country_name || 'Unknown';
            city = data.city || 'Unknown';
            isp = data.org || 'Unknown';
        } catch(e) {
            // Fallback: try backup API
            try {
                const res2 = await fetch('https://ipinfo.io/json');
                const data2 = await res2.json();
                ip = data2.ip || 'Unknown';
                country = data2.country || 'Unknown';
                city = data2.city || 'Unknown';
                isp = data2.org || 'Unknown';
            } catch(e2) {}
        }
        return { ip, country, city, isp };
    }

    function getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        if (ua.includes('Firefox/')) browser = 'Firefox';
        else if (ua.includes('Edg/')) browser = 'Edge';
        else if (ua.includes('Chrome/')) browser = 'Chrome';
        else if (ua.includes('Safari/')) browser = 'Safari';
        else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

        let os = 'Unknown';
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac OS')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

        return { browser, os, userAgent: ua };
    }

    function getScreenInfo() {
        return {
            resolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            colorDepth: screen.colorDepth + '-bit'
        };
    }

    async function sendVisitorPing() {
        if (WEBHOOK_URL === 'YOUR_DISCORD_WEBHOOK_URL') return; // Don't fire if not configured

        // Deduplicate: only ping once per session
        if (sessionStorage.getItem('_sv_pinged')) return;
        sessionStorage.setItem('_sv_pinged', '1');

        const visitor = await getVisitorInfo();
        const browserInfo = getBrowserInfo();
        const screenInfo = getScreenInfo();
        const referrer = document.referrer || 'Direct';
        const page = window.location.href;
        const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });

        const embed = {
            embeds: [{
                author: {
                    name: '',
                    icon_url: 'https://cdn.discordapp.com/emojis/1055188001520066590.webp'
                },
                title: '⠀',
                color: 0xED4245, // red
                description: [
                    '```',
                    '╔══════════════════════════════════╗',
                    '║     NEW VISITOR DETECTED         ║',
                    '╚══════════════════════════════════╝',
                    '```'
                ].join('\n'),
                fields: [
                    { name: '⠀', value: '**━━━━ Network ━━━━**', inline: false },
                    { name: 'IP', value: `\`\`\`${visitor.ip}\`\`\``, inline: true },
                    { name: 'Location', value: `\`\`\`📍 ${visitor.city}, ${visitor.country}\`\`\``, inline: true },
                    { name: 'ISP', value: `\`\`\`${visitor.isp}\`\`\``, inline: false },
                    { name: '⠀', value: '**━━━━ Device ━━━━**', inline: false },
                    { name: 'Browser', value: `\`\`\`${browserInfo.browser}\`\`\``, inline: true },
                    { name: 'OS', value: `\`\`\`${browserInfo.os}\`\`\``, inline: true },
                    { name: 'Resolution', value: `\`\`\`${screenInfo.resolution} • ${screenInfo.viewport} viewport\`\`\``, inline: false },
                    { name: '⠀', value: '**━━━━ Source ━━━━**', inline: false },
                    { name: 'Referrer', value: `\`${referrer}\``, inline: true },
                    { name: 'Page', value: `\`${page}\``, inline: true }
                ],
                footer: {
                    text: `Bloxified Hub • ${timestamp}`,
                    icon_url: 'https://cdn.discordapp.com/emojis/1055188001520066590.webp'
                },
                thumbnail: {
                    url: 'https://cdn.discordapp.com/emojis/1072657557939437658.webp'
                },
                timestamp: new Date().toISOString()
            }]
        };

        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(embed)
            });
        } catch(e) {}
    }

    // Fire on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', sendVisitorPing);
    } else {
        sendVisitorPing();
    }
})();

/* ========================================
   SCREYPTD HUB — APP.JS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ========================================
    // PARTICLES SYSTEM
    // ========================================
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: 0, y: 0 };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.hue = Math.random() > 0.5 ? 239 : 187; // brand or accent
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // mouse repulsion
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                this.x += (dx / dist) * force * 1.5;
                this.y += (dy / dist) * force * 1.5;
            }

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity})`;
            ctx.fill();
        }
    }

    const particleCount = Math.min(80, Math.floor(window.innerWidth / 15));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.08 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ========================================
    // CURSOR GLOW
    // ========================================
    const cursorGlow = document.getElementById('cursor-glow');
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        cursorGlow.style.left = e.clientX - 250 + 'px';
        cursorGlow.style.top = e.clientY - 250 + 'px';
        cursorGlow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });

    // ========================================
    // NAVBAR SCROLL EFFECT
    // ========================================
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    window.addEventListener('scroll', () => {
        // Navbar background
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active section highlighting
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === current) link.classList.add('active');
        });
    });

    // ========================================
    // MOBILE MENU
    // ========================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // ========================================
    // SCROLL REVEAL
    // ========================================
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ========================================
    // COUNTER ANIMATION
    // ========================================
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    function animateCounter(el, target) {
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current).toLocaleString();
            }
        }, 25);
    }

    // ========================================
    // COPY SCRIPT BUTTONS
    // ========================================
    const copyBtns = document.querySelectorAll('.copy-btn');

    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const script = btn.dataset.script;
            navigator.clipboard.writeText(script).then(() => {
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                showToast();
                setTimeout(() => {
                    btn.textContent = 'Copy Script';
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(() => {
                // fallback
                const textarea = document.createElement('textarea');
                textarea.value = script;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                showToast();
                setTimeout(() => {
                    btn.textContent = 'Copy Script';
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
    });

    // ========================================
    // TOAST
    // ========================================
    function showToast() {
        const toast = document.getElementById('toast');
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
        toast.style.pointerEvents = 'auto';
        setTimeout(() => {
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
            toast.style.pointerEvents = 'none';
        }, 2500);
    }

    // ========================================
    // SCRIPT FILTER
    // ========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const scriptCards = document.querySelectorAll('.script-card');
    const scriptsGrid = document.getElementById('scripts-grid');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            scriptCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden-card');
                    card.style.display = '';
                } else {
                    card.classList.add('hidden-card');
                    setTimeout(() => {
                        if (card.classList.contains('hidden-card')) {
                            card.style.display = 'none';
                        }
                    }, 400);
                }
            });
        });
    });

    // ========================================
    // FAQ ACCORDION
    // ========================================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            faqItems.forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });

    // ========================================
    // LAST CHECKED TIMESTAMP
    // ========================================
    const lastChecked = document.getElementById('last-checked');
    function updateTimestamp() {
        const now = new Date();
        lastChecked.textContent = now.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
    updateTimestamp();
    setInterval(updateTimestamp, 30000);

    // ========================================
    // TILT EFFECT ON SCRIPT CARDS
    // ========================================
    const cardInners = document.querySelectorAll('.script-card-inner');

    cardInners.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            card.style.transform = `translateY(-6px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) perspective(1000px) rotateX(0) rotateY(0)';
        });
    });

    // ========================================
    // SMOOTH ANCHOR SCROLL
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ========================================
    // VIDEO FALLBACK
    // ========================================
    const video = document.getElementById('bg-video');
    video.addEventListener('error', () => {
        const videoBg = document.getElementById('video-bg');
        videoBg.style.background = 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 25%, #0a1a2e 50%, #0a0a1a 75%, #1a0a2e 100%)';
        videoBg.style.backgroundSize = '400% 400%';
        videoBg.style.animation = 'gradientX 15s ease infinite';
    });

    // ========================================
    // FAKE LIVE TESTIMONIALS
    // ========================================
const testimonials = [
    { name: "James Mitchell", stars: "★★★★★", text: "Best script loader I've ever used. Execution is instant and never fails." },
    { name: "Sarah Chen", stars: "★★★★★", text: "Finally a reliable script hub. The auto-update feature is a lifesaver." },
    { name: "Marcus Johnson", stars: "★★★★☆", text: "Very solid script collection. Only 4 stars because the UI could be more intuitive." },
    { name: "Emily Rodriguez", stars: "★★★★★", text: "Scripts load flawlessly every single time. Zero crashes so far." },
    { name: "David Kim", stars: "★★★★★", text: "Been using this for months now. Most stable scripts I've found." },
    { name: "Rachel Thompson", stars: "★★★★★", text: "The script optimizer made my games run so much smoother. Absolutely love it." },
    { name: "Michael O'Brien", stars: "★★★★☆", text: "Great scripts overall. Sometimes takes a second to load but worth the wait." },
    { name: "Jessica Park", stars: "★★★★★", text: "Hands down the best script repository. The anti-detection is top tier." },
    { name: "Daniel Wright", stars: "★★★★★", text: "Clean code, fast execution, and constant updates. Couldn't ask for more." },
    { name: "Amanda Foster", stars: "★★★★★", text: "The script hub I've been searching for. Everything works as advertised." },
    { name: "Brian Taylor", stars: "★★★★★", text: "Frequent updates and new scripts added weekly. Incredible service." },
    { name: "Michelle Lee", stars: "★★★★☆", text: "Love the variety. Some scripts need better documentation but overall amazing." },
    { name: "Kevin Martinez", stars: "★★★★★", text: "Worth every penny. The scripts are optimized perfectly." },
    { name: "Lauren Scott", stars: "★★★★★", text: "Saved me so much time. Execution is lightning fast." },
    { name: "Christopher Evans", stars: "★★★★★", text: "Most reliable scripts I've ever used. Highly recommended." },
    { name: "Ashley Rivera", stars: "★★★★★", text: "The UI is gorgeous and the scripts perform flawlessly." },
    { name: "Thomas Baker", stars: "★★★★★", text: "Script library is massive and growing every day. Love it." },
    { name: "Nicole Adams", stars: "★★★★☆", text: "Great execution speed. Would love to see more AI-powered scripts soon." },
    { name: "Robert Hayes", stars: "★★★★★", text: "Best investment for my gaming setup. Scripts are top quality." },
    { name: "Stephanie Cruz", stars: "★★★★★", text: "Zero issues so far. The automatic script injection is seamless." }
];

    const testiWidget = document.getElementById('live-testimonial');
    const testiName = document.getElementById('testi-name');
    const testiAvatar = document.getElementById('testi-avatar');
    const testiStars = document.getElementById('testi-stars');
    const testiText = document.getElementById('testi-text');

    function showRandomTestimonial() {
        const random = testimonials[Math.floor(Math.random() * testimonials.length)];
        
        testiName.textContent = random.name;
        testiAvatar.textContent = random.name.charAt(0).toUpperCase();
        testiStars.textContent = random.stars;
        testiText.textContent = `"${random.text}"`;
        
        // Randomize avatar color
        const hues = [239, 187, 340, 150, 45]; // Brand, Accent, Pink, Green, Yellow
        const randomHue = hues[Math.floor(Math.random() * hues.length)];
        testiAvatar.style.background = `linear-gradient(135deg, hsl(${randomHue}, 80%, 60%), hsl(${randomHue}, 80%, 40%))`;

        // Show
        testiWidget.style.transform = 'translateY(0)';
        testiWidget.style.opacity = '1';

        // Hide after 6 seconds
        setTimeout(() => {
            testiWidget.style.transform = 'translateY(20px)';
            testiWidget.style.opacity = '0';
        }, 6000);

        // Schedule next one (between 10 and 25 seconds)
        const nextDelay = Math.floor(Math.random() * 15000) + 10000;
        setTimeout(showRandomTestimonial, nextDelay);
    }

    // Start testimonials loop after 3 seconds
    setTimeout(showRandomTestimonial, 3000);

});
