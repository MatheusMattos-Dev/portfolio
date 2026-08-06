/* ==========================================================================
   MATHEUS MATTOS CHAVES - ADVANCED INTERACTIVE ANIMATIONS SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initScrollProgress();
  initNavbar();
  initScrollReveals();
  initSkillTabs();
  initAnimatedCounters();
  initInteractiveCardTilt();
  initTerminalTyping();
  initContactForm();
  initQuickActions();
});

/* 1. Background Particle Canvas Animation */
function initParticleCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const numParticles = Math.min(Math.floor(width / 25), 50);

  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? 'rgba(60, 96, 238, 0.4)' : 'rgba(239, 255, 149, 0.3)'
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Draw connecting lines between close particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(60, 96, 238, ${0.15 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/* 2. Scroll Progress Bar at Top */
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalScroll) * 100;
    progressBar.style.width = `${progress}%`;
  });
}

/* 3. Navbar Scroll Effect & Active Link Highlight */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 150 && currentScrollY > lastScrollY) {
      navbar.style.transform = 'translateY(-120%)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }

    lastScrollY = currentScrollY;
    highlightActiveNavLink();
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        const icon = mobileToggle?.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      }
    });
  });
}

function highlightActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const scrollPosition = window.scrollY + 200;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

/* 4. Scroll Reveal Animations with Staggering */
function initScrollReveals() {
  const cards = document.querySelectorAll('.ub-box-white, .ub-box-blue, .ub-box-lime, .timeline-card-wrapper, .stat-circle-box');
  
  cards.forEach((card) => {
    card.classList.add('reveal-on-scroll');
  });

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('is-visible');

          const skillBar = entry.target.querySelector('.skill-bar-fill');
          if (skillBar) {
            const width = skillBar.getAttribute('data-width') || '85%';
            skillBar.style.width = width;
          }
        }, 100);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  cards.forEach(el => observer.observe(el));
}

/* 5. Skill Filter Tabs */
function initSkillTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px) scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* 6. Animated Counters for Stat Numbers */
function initAnimatedCounters() {
  const counterElements = document.querySelectorAll('.stat-circle-num');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNumber(entry.target, 5, '+', 1500);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(el => observer.observe(el));
}

function animateNumber(element, target, suffix = '', duration = 1500) {
  let start = 0;
  const increment = target / (duration / 16);
  
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = `${target}${suffix}`;
      clearInterval(timer);
    } else {
      element.textContent = `${Math.floor(start)}${suffix}`;
    }
  }, 16);
}

/* 7. 3D Magnetic Card Tilt Effect on Mouse Move */
function initInteractiveCardTilt() {
  const tiltCards = document.querySelectorAll('.hero-photo-card, .stat-circle-box');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotateX = (-y / rect.height) * 12;
      const rotateY = (x / rect.width) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* 8. Terminal Typing Effect Animation */
function initTerminalTyping() {
  const promptEl = document.querySelector('.terminal-prompt');
  if (!promptEl) return;

  const fullText = '$ matheus.getStatus()';
  promptEl.textContent = '$ ';
  let index = 2;

  const interval = setInterval(() => {
    if (index < fullText.length) {
      promptEl.textContent += fullText[index];
      index++;
    } else {
      clearInterval(interval);
    }
  }, 70);
}

/* 9. Contact Form Handler with Animated Success State */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-check"></i> Mensagem Enviada!';
      form.reset();
      showToast('Mensagem enviada com sucesso! Matheus entrará em contato em breve.', 'success');

      setTimeout(() => {
        submitBtn.innerHTML = originalContent;
      }, 3000);
    }, 1200);
  });
}

/* 10. Quick Action Helpers */
function initQuickActions() {
  window.copyToClipboard = function(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} copiado com sucesso!`, 'success');
    }).catch(() => {
      showToast(`Não foi possível copiar o ${label}.`, 'error');
    });
  };

  window.downloadCV = function() {
    showToast('Gerando prévia de impressão do Currículo...', 'info');
    window.print();
  };
}

/* Toast System with Spring Bounce Animation */
function showToast(message, type = 'info') {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'fa-circle-info';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'error') iconClass = 'fa-circle-exclamation';

  toast.innerHTML = `
    <i class="fas ${iconClass}" style="font-size: 1.2rem;"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(120%)';
    toast.style.transition = 'all 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
