/* ============================================================
   SYED PRODUCTIONS — MAIN JAVASCRIPT
   ============================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------------
     DATA — loaded from API (fallbacks to empty arrays)
  -------------------------------------------------------- */
  let destinations = [];
  let reviews = [];
  let deals = [];
  let videos = [];
  let galleryImages = [];
  let teamMembers = [];
  let bookingConfig = { serviceFee: 2000, porterFeePerNight: 3000, childDiscount: 0.5 };

  /* AI chat/planner responses — defaults overridden by site settings */
  let aiResponses = {
    wedding: [
      'For your wedding, I recommend our **Cinematic Wedding Film** package! Multi-camera coverage, drone shots, and a highlight reel your guests will love.',
      'Our **Premium Wedding Package** includes full-day coverage, same-day edit, and a beautifully crafted 10-minute cinematic film.',
    ],
    corporate: [
      'For corporate needs, our **Corporate Video Production** service delivers professional brand films, training videos, and promotional content.',
      'We offer **Corporate Event Coverage** with multi-camera setups, live streaming, and quick-turnaround highlight reels.',
    ],
    music: [
      'Our **Music Video Production** team brings creative direction, cinematic visuals, and professional color grading to every project.',
      'From concept to final cut, we create **stunning music videos** with choreography coordination, location scouting, and VFX.',
    ],
    event: [
      'For events, our **Full Coverage Package** includes multi-camera recording, drone footage, and a polished highlight film.',
      'We specialize in **corporate events, conferences, and galas** — capturing every key moment with professional quality.',
    ],
    documentary: [
      'Our **Documentary Filmmaking** service tells your story with depth — from research and interviews to narration and post-production.',
      'We produce **compelling documentaries** for NGOs, brands, and personal projects with cinematic storytelling techniques.',
    ],
    photography: [
      'Our **Photography Services** cover portraits, products, events, and fashion — with professional lighting and retouching.',
      'From **product photography** to **fashion shoots**, our team delivers magazine-quality images for every need.',
    ],
    commercial: [
      'Our **Commercial Production** service creates TV ads, social media campaigns, and branded content that converts.',
      'We produce **high-impact commercials** with creative scripting, professional talent, and broadcast-quality finishing.',
    ],
    branding: [
      'Our **Brand Identity** service includes logo design, style guides, and visual branding across all your media.',
      'From **logo creation** to full brand packages, we build visual identities that stand out in the market.',
    ],
    default: [
      'I have some great production recommendations based on your project needs! Let me create a personalized estimate.',
    ]
  };

  let chatResponses = {
    'hello': 'Assalam o Alaikum! Welcome to Syed Productions. Tell me about your project or click Plan My Project!',
    'hi': 'Welcome! What kind of production service are you looking for?',
    'salam': 'Walaikum Assalam! Welcome to Syed Productions. How can I help with your project?',
    'help': 'I can help you plan your production project! Set your preferences on the left panel, or ask me about our services like wedding films, corporate videos, or photography.',
    'wedding': 'Our wedding film packages include multi-camera coverage, drone shots, same-day edits, and cinematic highlight reels. We cover events across Pakistan!',
    'corporate': 'We produce professional corporate videos — brand films, training videos, event coverage, and promotional content with broadcast-quality finishing.',
    'photography': 'Our photography services cover portraits, products, events, fashion, and real estate — with professional lighting, retouching, and fast delivery.',
    'music': 'We create stunning music videos from concept to final cut — creative direction, choreography, location scouting, and professional color grading.',
    'price': 'Our packages start from PKR 25,000 for basic shoots. Wedding films from PKR 150,000, corporate videos from PKR 75,000. Custom quotes available!',
    'budget': 'We have packages for every budget! Basic event coverage starts at PKR 25,000. Contact us for a custom quote tailored to your needs.',
    'editing': 'Our post-production services include video editing, color grading, motion graphics, VFX, and sound design — all done in-house.',
    'branding': 'Our branding services include logo design, visual identity, brand guidelines, and social media assets — everything to establish your brand.',
    'event': 'We cover all types of events — corporate conferences, product launches, galas, concerts, and private celebrations with multi-camera setups.',
    'default': 'That sounds like an exciting project! Set your preferences and click Plan My Project for a personalized production estimate. You can also ask me about specific services like wedding films, corporate videos, or photography!'
  };

  /* --------------------------------------------------------
     UTILITIES
  -------------------------------------------------------- */
  function $(selector, context = document) {
    return context.querySelector(selector);
  }

  function $$(selector, context = document) {
    return [...context.querySelectorAll(selector)];
  }

  function createEl(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'className') el.className = val;
      else if (key === 'innerHTML') el.innerHTML = val;
      else if (key === 'textContent') el.textContent = val;
      else if (key.startsWith('data')) el.setAttribute(key.replace(/([A-Z])/g, '-$1').toLowerCase(), val);
      else el.setAttribute(key, val);
    }
    children.forEach(child => {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else el.appendChild(child);
    });
    return el;
  }

  function generateStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let html = '';
    for (let i = 0; i < full; i++) html += '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/></svg>';
    if (half) html += '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor" opacity="0.4"/></svg>';
    for (let i = 0; i < empty; i++) html += '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor" opacity="0.15"/></svg>';
    return html;
  }

  function formatPKR(amount) {
    return 'PKR ' + amount.toLocaleString('en-PK');
  }

  /* --------------------------------------------------------
     NAVIGATION
  -------------------------------------------------------- */
  const navbar = $('#navbar');
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* --------------------------------------------------------
     HERO CAROUSEL
  -------------------------------------------------------- */
  const heroSlides = $$('.hero-slide');
  const heroDots = $$('.carousel-dot');
  let currentSlide = 0;
  let heroInterval;

  function setHeroSlide(index) {
    heroSlides[currentSlide].classList.remove('active');
    heroDots[currentSlide].classList.remove('active');
    heroDots[currentSlide].setAttribute('aria-selected', 'false');
    currentSlide = index;
    heroSlides[currentSlide].classList.add('active');
    heroDots[currentSlide].classList.add('active');
    heroDots[currentSlide].setAttribute('aria-selected', 'true');
  }

  function nextHeroSlide() {
    setHeroSlide((currentSlide + 1) % heroSlides.length);
  }

  heroInterval = setInterval(nextHeroSlide, 6000);

  heroDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(heroInterval);
      setHeroSlide(i);
      heroInterval = setInterval(nextHeroSlide, 6000);
    });
  });

  /* --------------------------------------------------------
     STAT COUNTER ANIMATION
  -------------------------------------------------------- */
  function animateCounters() {
    $$('.stat-number').forEach(el => {
      const target = parseFloat(el.dataset.target);
      const isDecimal = target % 1 !== 0;
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;
        el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    });
  }

  /* --------------------------------------------------------
     SCROLL REVEAL (IntersectionObserver)
  -------------------------------------------------------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  // NOTE: .reveal-up observers are started inside init() AFTER applySiteSettings()
  // to prevent flash of old hardcoded content before dynamic settings are applied.

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  /* --------------------------------------------------------
     DESTINATION CARDS
  -------------------------------------------------------- */
  const destGrid = $('#destinationsGrid');

  function renderDestinations(filter = 'all') {
    const filtered = filter === 'all' ? destinations : destinations.filter(d => d.category === filter);
    destGrid.innerHTML = '';

    filtered.forEach(dest => {
      const card = createEl('div', {
        className: 'dest-card',
        role: 'listitem',
        'data-id': String(dest.id)
      });
      card.innerHTML = `
        <div class="dest-card-img">
          <img src="${dest.image}" alt="${dest.name}" loading="lazy">
          <span class="dest-card-badge">${dest.category}</span>
          ${dest.featured ? '<span class="dest-card-top-badge">Top Pick</span>' : ''}
          <button class="dest-card-favorite" aria-label="Add ${dest.name} to favorites">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>
          </button>
        </div>
        <div class="dest-card-body">
          <span class="dest-card-location">
            <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/></svg>
            ${dest.country}
          </span>
          <h3 class="dest-card-name">${dest.name}</h3>
          <div class="dest-card-rating">
            <span class="stars">${generateStars(dest.rating)}</span>
            <span class="rating-text">${dest.rating} (${dest.reviews.toLocaleString()})</span>
          </div>
          <div class="dest-card-footer">
            <div class="dest-card-price">
              <span class="price-amount">${formatPKR(dest.price)}</span>
              <span class="price-per"> /person</span>
            </div>
            <button class="dest-card-btn" data-id="${dest.id}">Explore</button>
          </div>
        </div>
      `;
      destGrid.appendChild(card);
    });

    $$('.dest-card-btn', destGrid).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(parseInt(btn.dataset.id));
      });
    });

    $$('.dest-card', destGrid).forEach(card => {
      card.addEventListener('click', () => {
        openModal(parseInt(card.dataset.id));
      });
    });

    $$('.dest-card-favorite', destGrid).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        btn.classList.toggle('active');
      });
    });
  }

  function renderTopDestinations() {
    const topGrid = $('#topDestGrid');
    if (!topGrid) return;
    topGrid.innerHTML = '';
    const featured = destinations.filter(d => d.featured);
    featured.forEach(dest => {
      const card = createEl('div', { className: 'top-dest-card', role: 'button', tabindex: '0' });
      card.innerHTML = `
        <img src="${dest.image}" alt="${dest.name}" loading="lazy">
        <div class="top-dest-overlay">
          <span class="top-dest-tag">Featured Service</span>
          <h3 class="top-dest-name">${dest.name}</h3>
          <p class="top-dest-region">${dest.country}</p>
          <div class="top-dest-meta">
            <span class="top-dest-rating">
              <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/></svg>
              ${dest.rating}
            </span>
            <span class="top-dest-price">From ${formatPKR(dest.price)}</span>
          </div>
          <button class="top-dest-btn" data-id="${dest.id}">Explore</button>
        </div>
      `;
      card.addEventListener('click', () => openModal(dest.id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(dest.id); }
      });
      topGrid.appendChild(card);
    });
  }

  function renderMapList() {
    const mapDestList = $('#mapDestList');
    if (!mapDestList) return;
    mapDestList.innerHTML = '';
    destinations.forEach(dest => {
      const item = createEl('div', { className: 'map-dest-item', role: 'button', tabindex: '0' });
      item.innerHTML = `
        <div class="map-dest-pin">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/></svg>
        </div>
        <div class="map-dest-info">
          <div class="map-dest-name">${dest.name}</div>
          <div class="map-dest-detail">From ${formatPKR(dest.price)}</div>
        </div>
      `;
      item.addEventListener('click', () => openModal(dest.id));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(dest.id);
        }
      });
      mapDestList.appendChild(item);
    });
  }

  function renderBookingDestinations() {
    const bookingDests = $('#bookingDestinations');
    if (!bookingDests) return;
    bookingDests.innerHTML = '';
    const bookingList = [...destinations.filter(d => d.featured), ...destinations.filter(d => !d.featured)].slice(0, 6);
    bookingList.forEach(dest => {
      const card = createEl('div', { className: 'booking-dest-card', 'data-id': String(dest.id) });
      card.innerHTML = `
        <img src="${dest.image}" alt="${dest.name}" loading="lazy">
        <h4>${dest.name}</h4>
        <p>From ${formatPKR(dest.price)}/person</p>
      `;
      card.addEventListener('click', () => {
        $$('.booking-dest-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        booking.destination = dest;
      });
      bookingDests.appendChild(card);
    });
  }

  // Filter tabs
  $$('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.filter-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      renderDestinations(tab.dataset.filter);
    });
  });

  /* --------------------------------------------------------
     DESTINATION MODAL
  -------------------------------------------------------- */
  const modal = $('#destinationModal');
  const modalClose = $('#modalClose');

  function openModal(id) {
    const dest = destinations.find(d => d.id === id);
    if (!dest) return;

    $('#modalImage').src = dest.image;
    $('#modalImage').alt = dest.name;
    $('#modalTitle').textContent = dest.name;
    $('#modalRating').innerHTML = `<span class="stars">${generateStars(dest.rating)}</span> ${dest.rating} (${dest.reviews.toLocaleString()} reviews)`;
    $('#modalDescription').textContent = dest.description;
    $('#modalHighlights').innerHTML = dest.highlights.map(h => `<span class="highlight-tag">${h}</span>`).join('');
    $('#modalPrice').innerHTML = `${formatPKR(dest.price)} <span>/person</span>`;
    $('#modalBookBtn').onclick = () => {
      closeModal();
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    };

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    setTimeout(() => {
      modal.hidden = true;
      document.body.style.overflow = '';
    }, 300);
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  /* --------------------------------------------------------
     AI TRIP PLANNER
  -------------------------------------------------------- */
  const chatMessages = $('#chatMessages');
  const chatInput = $('#chatInput');
  const chatSendBtn = $('#chatSendBtn');
  const plannerGenerate = $('#plannerGenerate');

  $$('.planner-tag').forEach(tag => {
    tag.addEventListener('click', () => tag.classList.toggle('active'));
  });

  function addChatMessage(text, isUser = false) {
    const msg = createEl('div', { className: `chat-message ${isUser ? 'user' : 'ai'}` });
    msg.innerHTML = `
      <div class="chat-avatar">${isUser ? 'You' : 'AI'}</div>
      <div class="chat-bubble">${text}</div>
    `;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTypingIndicator() {
    const typing = createEl('div', { className: 'chat-message ai', id: 'typingIndicator' });
    typing.innerHTML = `
      <div class="chat-avatar">AI</div>
      <div class="chat-bubble">
        <div class="typing-indicator"><span></span><span></span><span></span></div>
      </div>
    `;
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = $('#typingIndicator');
    if (el) el.remove();
  }

  function generateItinerary() {
    const budget = $('#plannerBudget').value;
    const duration = $('#plannerDuration').value;
    const style = $('#plannerStyle').value;
    const interests = $$('.planner-tag.active').map(t => t.dataset.interest);

    if (interests.length === 0) interests.push('wedding');

    const primaryInterest = interests[0];
    const responsePool = aiResponses[primaryInterest] || aiResponses.default;
    const intro = responsePool[Math.floor(Math.random() * responsePool.length)];

    const durationMap = { weekend: '3 Days', week: '7 Days', twoweeks: '14 Days', month: '30 Days' };
    const budgetMap = { budget: 'PKR 25,000–75,000', mid: 'PKR 75,000–200,000', luxury: 'PKR 200,000+' };

    const relevant = destinations.filter(d =>
      interests.includes(d.category) ||
      interests.some(i => d.highlights.some(h => h.toLowerCase().includes(i)))
    ).slice(0, 4);

    if (relevant.length === 0 && destinations.length >= 3) relevant.push(destinations[0], destinations[2]);

    const days = duration === 'weekend' ? 3 : duration === 'week' ? 7 : duration === 'twoweeks' ? 14 : 30;

    const itineraryDays = [];
    const dayActivities = [
      'Pre-production planning and storyboarding for',
      'Location scouting and setup for',
      'Principal shooting day for',
      'B-roll and detail shots for',
      'Interview and testimonial recording for',
      'Aerial/drone footage capture for',
      'Post-production and review for'
    ];

    for (let i = 1; i <= Math.min(days, 7); i++) {
      if (relevant.length === 0) break;
      const dest = relevant[(i - 1) % relevant.length];
      const activity = dayActivities[(i - 1) % dayActivities.length];
      itineraryDays.push(`<div class="itinerary-day"><strong>Day ${i}:</strong> ${activity} ${dest.name} — ${dest.highlights[i % dest.highlights.length]}</div>`);
    }

    const itineraryHTML = `
      <p>${intro}</p>
      <div class="itinerary-card">
        <h4>Your ${durationMap[duration]} ${style === 'solo' ? 'Solo' : style === 'couple' ? 'Couple' : style === 'family' ? 'Family' : 'Group'} Production Plan</h4>
        <p style="font-size:12px; color:#64748b; margin-bottom:8px;">Budget: ${budgetMap[budget]} | Interests: ${interests.join(', ')}</p>
        ${itineraryDays.join('')}
        ${days > 7 ? '<div class="itinerary-day"><strong>Days 8–' + days + ':</strong> Extended post-production — color grading, VFX, sound design, and final delivery!</div>' : ''}
      </div>
      <p style="margin-top:12px; font-size:13px;">Would you like me to adjust anything or start booking? Contact us on WhatsApp for instant confirmation!</p>
    `;

    return itineraryHTML;
  }

  plannerGenerate.addEventListener('click', () => {
    const interests = $$('.planner-tag.active').map(t => t.textContent).join(', ') || 'Wedding';
    addChatMessage(`Plan a project with interests: ${interests}`, true);

    showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      addChatMessage(generateItinerary());
    }, 1800);
  });

  function getKeywordResponse(text) {
    const lower = text.toLowerCase();
    for (const [key, val] of Object.entries(chatResponses)) {
      if (key === 'default') continue;
      const regex = new RegExp('\\b' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      if (regex.test(lower)) return val;
    }
    return null;
  }

  async function handleChatSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    addChatMessage(text, true);
    chatInput.value = '';
    showTypingIndicator();

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await resp.json();
      if (!resp.ok || !data.reply) throw new Error('AI unavailable');
      removeTypingIndicator();
      addChatMessage(`<p>${data.reply}</p>`);
    } catch (err) {
      console.error('Chat AI error:', err);
      // Fallback to keyword matching
      removeTypingIndicator();
      const fallback = getKeywordResponse(text) || chatResponses.default;
      addChatMessage(`<p>${fallback}</p>`);
    }
  }

  chatSendBtn.addEventListener('click', handleChatSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleChatSend();
  });

  /* --------------------------------------------------------
     BOOKING WIZARD
  -------------------------------------------------------- */
  let wizardStep = 1;
  const totalSteps = 5;
  const booking = { destination: null, checkIn: '', checkOut: '', adults: 2, children: 0, infants: 0 };

  const wizardPrev = $('#wizardPrev');
  const wizardNext = $('#wizardNext');

  function updateWizard() {
    $$('.wizard-step').forEach((step, i) => {
      const num = i + 1;
      step.classList.remove('active', 'completed');
      if (num === wizardStep) step.classList.add('active');
      else if (num < wizardStep) step.classList.add('completed');
    });

    $$('.wizard-connector').forEach((conn, i) => {
      conn.classList.toggle('active', i + 1 < wizardStep);
    });

    $$('.wizard-panel').forEach(panel => {
      panel.classList.toggle('active', parseInt(panel.dataset.panel) === wizardStep);
    });

    wizardPrev.disabled = wizardStep === 1;
    wizardNext.textContent = wizardStep === totalSteps - 1 ? 'Confirm Booking' : wizardStep === totalSteps ? 'Book Another Service' : 'Continue';

    if (wizardStep === 4) renderBookingReview();

    if (wizardStep === 5) {
      wizardPrev.style.display = 'none';
    } else {
      wizardPrev.style.display = '';
    }
  }

  // Step 3: Traveler counters
  $$('.counter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const isPlus = btn.classList.contains('plus');
      const current = booking[target];

      if (isPlus && current < 10) booking[target]++;
      else if (!isPlus && current > (target === 'adults' ? 1 : 0)) booking[target]--;

      $(`#${target}Count`).textContent = booking[target];
    });
  });

  const bookingCheckIn = $('#bookingCheckIn');
  const bookingCheckOut = $('#bookingCheckOut');

  function updateDateSummary() {
    const ci = bookingCheckIn.value;
    const co = bookingCheckOut.value;
    if (ci && co) {
      const days = Math.ceil((new Date(co) - new Date(ci)) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        $('#dateSummary').textContent = `${days} day${days > 1 ? 's' : ''} production schedule`;
        booking.checkIn = ci;
        booking.checkOut = co;
      } else {
        $('#dateSummary').textContent = 'End date must be after start date';
      }
    }
  }

  bookingCheckIn.addEventListener('change', updateDateSummary);
  bookingCheckOut.addEventListener('change', updateDateSummary);

  function renderBookingReview() {
    const review = $('#bookingReview');
    const dest = booking.destination;
    if (!dest) {
      review.innerHTML = '<p style="text-align:center; color:#94a3b8;">Please select a service first.</p>';
      return;
    }

    const nights = booking.checkIn && booking.checkOut
      ? Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))
      : 5;

    const basePrice = dest.price * booking.adults + dest.price * bookingConfig.childDiscount * booking.children;
    const nightsTotal = basePrice * (nights / 5);
    const porterFee = booking.infants * bookingConfig.porterFeePerNight * nights;
    const serviceFee = bookingConfig.serviceFee;
    const total = nightsTotal + porterFee + serviceFee;

    // Store total for submission
    booking.totalPrice = Math.round(total);

    review.innerHTML = `
      <div class="review-line"><span class="label">Service</span><span>${dest.name}</span></div>
      <div class="review-line"><span class="label">Region</span><span>${dest.country}</span></div>
      <div class="review-line"><span class="label">Dates</span><span>${booking.checkIn || 'Flexible'} → ${booking.checkOut || 'Flexible'}</span></div>
      <div class="review-line"><span class="label">Duration</span><span>${nights} days</span></div>
      <div class="review-line"><span class="label">Travelers</span><span>${booking.adults} adult${booking.adults > 1 ? 's' : ''}${booking.children ? ', ' + booking.children + ' child' + (booking.children > 1 ? 'ren' : '') : ''}</span></div>
      ${booking.infants > 0 ? `<div class="review-line"><span class="label">Porters</span><span>${booking.infants} porter${booking.infants > 1 ? 's' : ''}</span></div>` : ''}
      <div class="review-line"><span class="label">Base Package</span><span>${formatPKR(Math.round(nightsTotal))}</span></div>
      ${porterFee > 0 ? `<div class="review-line"><span class="label">Porter Fee</span><span>${formatPKR(porterFee)}</span></div>` : ''}
      <div class="review-line"><span class="label">Service Fee</span><span>${formatPKR(serviceFee)}</span></div>
      <div class="review-line total"><span>Total</span><span>${formatPKR(Math.round(total))}</span></div>
    `;
  }

  async function submitBooking() {
    const dest = booking.destination;
    if (!dest) return;

    const reference = 'SP-2026-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const headers = { 'Content-Type': 'application/json' };
    const userToken = localStorage.getItem('user_token');
    if (userToken) {
      headers['Authorization'] = 'Bearer ' + userToken;
    }

    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          reference,
          destination: dest.name,
          region: dest.country,
          checkIn: booking.checkIn || null,
          checkOut: booking.checkOut || null,
          adults: booking.adults,
          children: booking.children,
          infants: booking.infants,
          totalPrice: booking.totalPrice || 0
        })
      });
    } catch (err) {
      // Silently fail — booking UI still shows confirmation
    }

    $('#bookingRef').textContent = reference;
  }

  wizardNext.addEventListener('click', async () => {
    if (wizardStep === totalSteps) {
      wizardStep = 1;
      booking.destination = null;
      $$('.booking-dest-card').forEach(c => c.classList.remove('selected'));
      updateWizard();
      return;
    }
    if (wizardStep === totalSteps - 1) {
      // Confirm Booking — submit to API then advance
      await submitBooking();
      wizardStep++;
      updateWizard();
      return;
    }
    if (wizardStep < totalSteps) {
      wizardStep++;
      updateWizard();
    }
  });

  wizardPrev.addEventListener('click', () => {
    if (wizardStep > 1) {
      wizardStep--;
      updateWizard();
    }
  });

  /* --------------------------------------------------------
     REVIEWS CAROUSEL
  -------------------------------------------------------- */
  const reviewsTrack = $('#reviewsTrack');
  const reviewsPrev = $('#reviewsPrev');
  const reviewsNext = $('#reviewsNext');
  const reviewsDots = $('#reviewsDots');
  let reviewIndex = 0;

  function renderReviews() {
    reviewsTrack.innerHTML = '';
    reviews.forEach(rev => {
      const card = createEl('div', { className: 'review-card' });
      card.innerHTML = `
        <div class="review-card-header">
          <img class="review-avatar" src="${rev.avatar}" alt="${rev.name}" loading="lazy">
          <div>
            <div class="review-author">${rev.name}</div>
            <div class="review-meta">
              ${rev.location}
              ${rev.verified ? '<span class="verified-badge"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg> Verified</span>' : ''}
            </div>
          </div>
        </div>
        <div class="review-stars">${generateStars(rev.rating)}</div>
        <p class="review-text">"${rev.text}"</p>
        <span class="review-destination">${rev.destination}</span>
      `;
      reviewsTrack.appendChild(card);
    });
    reviewIndex = 0;
    updateReviewsCarousel();
  }

  function getReviewsPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function getMaxReviewIndex() {
    return Math.max(0, reviews.length - getReviewsPerView());
  }

  function updateReviewsCarousel() {
    const cardWidth = reviewsTrack.children[0]?.offsetWidth || 300;
    const gap = 24;
    reviewsTrack.style.transform = `translateX(-${reviewIndex * (cardWidth + gap)}px)`;

    const totalDots = getMaxReviewIndex() + 1;
    reviewsDots.innerHTML = '';
    for (let i = 0; i < totalDots; i++) {
      const dot = createEl('button', {
        className: `carousel-dot${i === reviewIndex ? ' active' : ''}`,
        'aria-label': `Review group ${i + 1}`
      });
      dot.addEventListener('click', () => {
        reviewIndex = i;
        updateReviewsCarousel();
      });
      reviewsDots.appendChild(dot);
    }
  }

  reviewsPrev.addEventListener('click', () => {
    reviewIndex = Math.max(0, reviewIndex - 1);
    updateReviewsCarousel();
  });

  reviewsNext.addEventListener('click', () => {
    reviewIndex = Math.min(getMaxReviewIndex(), reviewIndex + 1);
    updateReviewsCarousel();
  });

  window.addEventListener('resize', () => {
    reviewIndex = Math.min(reviewIndex, getMaxReviewIndex());
    updateReviewsCarousel();
  });

  /* --------------------------------------------------------
     DEALS & COUNTDOWNS
  -------------------------------------------------------- */
  const dealsGrid = $('#dealsGrid');
  let countdownEndTimes = [];

  function renderDeals() {
    dealsGrid.innerHTML = '';
    countdownEndTimes = deals.map(d => new Date(d.expiresAt).getTime());

    deals.forEach((deal, idx) => {
      const card = createEl('div', { className: 'deal-card' });
      const savePercent = Math.round((1 - deal.newPrice / deal.oldPrice) * 100);

      card.innerHTML = `
        <span class="deal-badge">${deal.badge}</span>
        <div class="deal-card-img">
          <img src="${deal.image}" alt="${deal.name}" loading="lazy">
        </div>
        <div class="deal-card-body">
          <h3 class="deal-card-name">${deal.name}</h3>
          <p class="deal-card-desc">${deal.description}</p>
          <div class="deal-pricing">
            <span class="deal-old-price">${formatPKR(deal.oldPrice)}</span>
            <span class="deal-new-price">${formatPKR(deal.newPrice)}</span>
            <span class="deal-save">Save ${savePercent}%</span>
          </div>
          <div class="deal-countdown" data-idx="${idx}">
            <div class="countdown-unit"><span class="countdown-value" data-unit="days">0</span><span class="countdown-label">Days</span></div>
            <div class="countdown-unit"><span class="countdown-value" data-unit="hours">0</span><span class="countdown-label">Hours</span></div>
            <div class="countdown-unit"><span class="countdown-value" data-unit="mins">0</span><span class="countdown-label">Mins</span></div>
            <div class="countdown-unit"><span class="countdown-value" data-unit="secs">0</span><span class="countdown-label">Secs</span></div>
          </div>
          <a href="#booking" class="deal-book-btn">Book This Package</a>
        </div>
      `;
      dealsGrid.appendChild(card);
    });

    updateCountdowns();
  }

  function updateCountdowns() {
    $$('.deal-countdown').forEach((el, idx) => {
      const remaining = Math.max(0, countdownEndTimes[idx] - Date.now());
      const days = Math.floor(remaining / 86400000);
      const hours = Math.floor((remaining % 86400000) / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);

      const vals = el.querySelectorAll('.countdown-value');
      vals[0].textContent = String(days).padStart(2, '0');
      vals[1].textContent = String(hours).padStart(2, '0');
      vals[2].textContent = String(mins).padStart(2, '0');
      vals[3].textContent = String(secs).padStart(2, '0');
    });
  }

  setInterval(updateCountdowns, 1000);

  /* --------------------------------------------------------
     NEWSLETTER — POST to API
  -------------------------------------------------------- */
  const newsletterForm = $('#newsletterForm');
  const newsletterSuccess = $('#newsletterSuccess');

  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#newsletterEmail').value;
    if (email) {
      try {
        const res = await fetch('/api/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        newsletterForm.style.display = 'none';
        newsletterSuccess.hidden = false;
        if (data.message === 'Already subscribed') {
          newsletterSuccess.querySelector('p').textContent = "You're already subscribed! Stay tuned for updates.";
        }
      } catch (err) {
        newsletterForm.style.display = 'none';
        newsletterSuccess.hidden = false;
      }
    }
  });

  /* --------------------------------------------------------
     HERO SEARCH
  -------------------------------------------------------- */
  const heroSearchBtn = $('#heroSearchBtn');
  if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', () => {
      const dest = $('#heroSearchDest').value.trim().toLowerCase();
      if (dest) {
        const match = destinations.find(d =>
          d.name.toLowerCase().includes(dest) ||
          d.country.toLowerCase().includes(dest) ||
          d.category.includes(dest)
        );
        if (match) {
          const category = match.category;
          $$('.filter-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.filter === category);
            t.setAttribute('aria-selected', t.dataset.filter === category ? 'true' : 'false');
          });
          renderDestinations(category);
        }
      }
      document.getElementById('destinations').scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------
     GALLERY SEE MORE
  -------------------------------------------------------- */
  const gallerySeeMore = $('#gallerySeeMore');
  const galleryGrid = $('#galleryGrid');

  if (gallerySeeMore && galleryGrid) {
    gallerySeeMore.addEventListener('click', () => {
      const expanded = galleryGrid.classList.toggle('expanded');
      gallerySeeMore.classList.toggle('active', expanded);
      gallerySeeMore.innerHTML = expanded
        ? 'See Less <svg viewBox="0 0 24 24" width="18" height="18"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor"/></svg>'
        : 'See More <svg viewBox="0 0 24 24" width="18" height="18"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor"/></svg>';
    });
  }

  /* --------------------------------------------------------
     GALLERY LIGHTBOX
  -------------------------------------------------------- */
  const lightbox = $('#galleryLightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxCounter = $('#lightboxCounter');
  let galleryItems = [];
  let lightboxIndex = 0;

  function getGalleryImageUrl(el) {
    const bg = el.style.backgroundImage;
    return bg.replace(/url\(['"]?/, '').replace(/['"]?\)/, '').replace('w=400', 'w=1200');
  }

  function openLightbox(index) {
    lightboxIndex = index;
    const url = getGalleryImageUrl(galleryItems[index]);
    lightboxImg.src = url;
    lightboxCounter.textContent = `${index + 1} / ${galleryItems.length}`;
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    setTimeout(() => {
      lightbox.hidden = true;
      lightboxImg.src = '';
      document.body.style.overflow = '';
    }, 300);
  }

  function lightboxNav(dir) {
    lightboxIndex = (lightboxIndex + dir + galleryItems.length) % galleryItems.length;
    lightboxImg.src = getGalleryImageUrl(galleryItems[lightboxIndex]);
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${galleryItems.length}`;
  }

  function initLightboxBindings() {
    galleryItems = $$('.gallery-item');
    galleryItems.forEach((item, i) => {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', `View photo ${i + 1}`);
      item.addEventListener('click', () => openLightbox(i));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });
    });
  }

  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightboxPrev').addEventListener('click', () => lightboxNav(-1));
  $('#lightboxNext').addEventListener('click', () => lightboxNav(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  });

  function renderGallery() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    galleryImages.forEach(img => {
      const item = createEl('div', {
        className: img.hidden ? 'gallery-item gallery-hidden' : 'gallery-item'
      });
      item.style.backgroundImage = `url('${img.imageUrl}')`;
      galleryGrid.appendChild(item);
    });

    initLightboxBindings();
  }

  function renderTeam() {
    const teamGrid = $('#teamGrid');
    if (!teamGrid) return;
    teamGrid.innerHTML = '';

    const fbSvg = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/></svg>';
    const igSvg = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/></svg>';

    teamMembers.forEach(m => {
      const card = createEl('div', { className: 'team-card' });
      card.innerHTML = `
        <div class="team-card-img">
          <img src="${m.image}" alt="${m.name}" loading="lazy">
          <div class="team-card-socials">
            ${m.facebook ? `<a href="${m.facebook}" aria-label="Facebook">${fbSvg}</a>` : ''}
            ${m.instagram ? `<a href="${m.instagram}" aria-label="Instagram">${igSvg}</a>` : ''}
          </div>
        </div>
        <div class="team-card-body">
          <h3 class="team-card-name">${m.name}</h3>
          <span class="team-card-role">${m.role}</span>
          <p class="team-card-bio">${m.bio}</p>
        </div>
      `;
      teamGrid.appendChild(card);
    });
  }

  /* --------------------------------------------------------
     VIDEO SHOWCASE
  -------------------------------------------------------- */

  /**
   * Detect video URL type and return embed info.
   * Returns { type: 'youtube'|'instagram'|'facebook'|'direct', embedUrl, videoId? }
   */
  function getVideoEmbed(url) {
    if (!url) return { type: 'direct', embedUrl: url };

    // YouTube: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/
    var ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/);
    if (ytMatch) {
      return {
        type: 'youtube',
        videoId: ytMatch[1],
        embedUrl: 'https://www.youtube.com/embed/' + ytMatch[1] + '?autoplay=1&loop=1&playlist=' + ytMatch[1]
      };
    }

    // Instagram: instagram.com/reel/CODE/ or instagram.com/p/CODE/
    var igMatch = url.match(/instagram\.com\/(?:reel|p)\/([\w-]+)/);
    if (igMatch) {
      return {
        type: 'instagram',
        videoId: igMatch[1],
        embedUrl: 'https://www.instagram.com/reel/' + igMatch[1] + '/embed/'
      };
    }

    // Facebook: facebook.com/...video or fb.watch/
    if (/facebook\.com\/.*video|fb\.watch\//.test(url)) {
      return {
        type: 'facebook',
        embedUrl: 'https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(url) + '&show_text=false&autoplay=true'
      };
    }

    // Direct file (.mp4, local paths, etc.)
    return { type: 'direct', embedUrl: url };
  }

  // Autoplay muted previews on cards when visible (direct .mp4 only)
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const card = entry.target;
      // Skip external platform cards (they use thumbnails, not <video>)
      if (card.dataset.videoType && card.dataset.videoType !== 'direct') return;
      const vid = card.querySelector('video');
      const src = card.dataset.video;
      if (!vid || !src) return;

      if (entry.isIntersecting) {
        if (!vid.src || vid.src === '') vid.src = src;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, { threshold: 0.3 });

  /* ── Reels-Style Fullscreen Viewer ── */
  const reelsViewer = $('#reelsViewer');
  const reelsTrack = $('#reelsTrack');
  const reelsClose = $('#reelsClose');
  const reelsCounter = $('#reelsCounter');
  let reelsObserver = null;

  var reelsMuted = false; // start unmuted — user clicked to watch

  function updateMuteBtn() {
    var btn = $('#reelsMuteBtn');
    if (!btn) return;
    btn.classList.toggle('muted', reelsMuted);
    btn.setAttribute('aria-label', reelsMuted ? 'Unmute' : 'Mute');
  }

  function applyMuteState() {
    reelsTrack.querySelectorAll('video').forEach(function(v) { v.muted = reelsMuted; });
    updateMuteBtn();
  }

  var reelsMuteBtn = $('#reelsMuteBtn');
  if (reelsMuteBtn) {
    reelsMuteBtn.addEventListener('click', function() {
      reelsMuted = !reelsMuted;
      applyMuteState();
    });
  }

  function openReels(startIndex) {
    if (!reelsViewer || videos.length === 0) return;

    reelsTrack.innerHTML = '';
    videos.forEach((v, i) => {
      const slide = document.createElement('div');
      slide.className = 'reel-slide' + (i !== startIndex ? ' paused' : '');
      slide.dataset.index = i;

      const embed = getVideoEmbed(v.videoUrl);
      slide.dataset.embedType = embed.type;

      if (embed.type === 'direct') {
        // Direct .mp4 — use <video> element with sound
        const video = document.createElement('video');
        video.playsInline = true;
        video.loop = true;
        video.preload = 'none';
        video.muted = reelsMuted;
        video.src = encodeURI(v.videoUrl);

        video.addEventListener('click', () => {
          if (video.paused) {
            video.play().catch(() => {});
            slide.classList.remove('paused');
          } else {
            video.pause();
            slide.classList.add('paused');
          }
        });

        slide.appendChild(video);
      } else {
        // YouTube / Instagram / Facebook — use <iframe>
        var iframe = document.createElement('iframe');
        iframe.src = embed.embedUrl;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('allow', 'autoplay; encrypted-media; gyroscope; picture-in-picture');
        iframe.loading = 'lazy';
        slide.appendChild(iframe);
        slide.classList.remove('paused'); // no play/pause for iframes
      }

      const playBtn = document.createElement('div');
      playBtn.className = 'reel-play-btn';
      playBtn.innerHTML = '<svg viewBox="0 0 48 48" width="48" height="48"><path d="M19 15v18l15-9z" fill="white"/></svg>';

      const info = document.createElement('div');
      info.className = 'reel-info';
      info.innerHTML = '<h3>' + v.title + '</h3><p>' + v.description + '</p>';

      slide.appendChild(playBtn);
      slide.appendChild(info);
      reelsTrack.appendChild(slide);
    });

    reelsViewer.hidden = false;
    requestAnimationFrame(() => reelsViewer.classList.add('open'));
    document.body.style.overflow = 'hidden';
    updateMuteBtn();

    const targetSlide = reelsTrack.children[startIndex];
    if (targetSlide) targetSlide.scrollIntoView({ behavior: 'instant' });

    updateReelsCounter(startIndex);

    // Auto-play the first direct video with sound
    const initialVideo = targetSlide?.querySelector('video');
    if (initialVideo) {
      initialVideo.muted = reelsMuted;
      initialVideo.play().then(() => {
        targetSlide.classList.remove('paused');
      }).catch(() => {
        // Browser blocked unmuted autoplay — fallback to muted
        initialVideo.muted = true;
        reelsMuted = true;
        updateMuteBtn();
        initialVideo.play().catch(() => {});
        targetSlide.classList.remove('paused');
      });
    }

    reelsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const slide = entry.target;
        const vid = slide.querySelector('video');
        const iframe = slide.querySelector('iframe');

        if (entry.isIntersecting) {
          updateReelsCounter(parseInt(slide.dataset.index, 10));
          if (vid) {
            vid.muted = reelsMuted;
            vid.play().catch(() => {
              // Fallback to muted if unmuted play blocked
              vid.muted = true;
              vid.play().catch(() => {});
            });
            slide.classList.remove('paused');
          }
          // Restore iframe src when scrolling back into view
          if (iframe && !iframe.src && iframe.dataset.src) {
            iframe.src = iframe.dataset.src;
          }
        } else {
          if (vid) {
            vid.pause();
            slide.classList.add('paused');
          }
          // Remove iframe src when off-screen to stop playback, restore when visible
          if (iframe && iframe.src) {
            iframe.dataset.src = iframe.src;
            iframe.src = '';
          }
        }
      });
    }, { root: reelsTrack, threshold: 0.7 });

    reelsTrack.querySelectorAll('.reel-slide').forEach(s => {
      reelsObserver.observe(s);
    });
  }

  function updateReelsCounter(index) {
    if (reelsCounter) reelsCounter.textContent = (index + 1) + ' / ' + videos.length;
  }

  function closeReels() {
    if (!reelsViewer) return;
    reelsTrack.querySelectorAll('video').forEach(v => { v.pause(); v.src = ''; });
    reelsTrack.querySelectorAll('iframe').forEach(f => { f.src = ''; });
    if (reelsObserver) { reelsObserver.disconnect(); reelsObserver = null; }
    reelsViewer.classList.remove('open');
    setTimeout(() => {
      reelsViewer.hidden = true;
      reelsTrack.innerHTML = '';
      document.body.style.overflow = '';
    }, 300);
  }

  if (reelsClose) reelsClose.addEventListener('click', closeReels);
  if (reelsViewer) {
    document.addEventListener('keydown', (e) => {
      if (!reelsViewer.hidden && e.key === 'Escape') closeReels();
    });
  }

  var activeVideoFilter = 'all';

  function renderVideos() {
    const videoGrid = $('#videoGrid');
    if (!videoGrid) return;
    videoGrid.innerHTML = '';

    const filtered = activeVideoFilter === 'all'
      ? videos
      : videos.filter(v => (v.category || '').toLowerCase() === activeVideoFilter);

    filtered.forEach((v) => {
      const origIndex = videos.indexOf(v);
      const tagClass = v.tag === 'Client Story' ? 'video-card-tag video-card-tag--client' : 'video-card-tag';
      const embed = getVideoEmbed(v.videoUrl);
      const card = createEl('div', {
        className: 'video-card',
        role: 'button',
        tabindex: '0',
        'data-video': encodeURI(v.videoUrl),
        'data-video-type': embed.type
      });

      var mediaHTML = '';
      if (embed.type === 'youtube') {
        // YouTube: muted autoplay iframe preview
        mediaHTML = '<iframe src="https://www.youtube.com/embed/' + embed.videoId + '?autoplay=1&mute=1&loop=1&playlist=' + embed.videoId + '&controls=0&showinfo=0&modestbranding=1" frameborder="0" allow="autoplay; encrypted-media" loading="lazy"></iframe>';
      } else if (embed.type === 'instagram') {
        // Instagram: autoplay embed preview
        mediaHTML = '<iframe src="' + embed.embedUrl + '" frameborder="0" allow="autoplay; encrypted-media" loading="lazy"></iframe>';
      } else if (embed.type === 'facebook') {
        // Facebook: autoplay embed preview (muted by default)
        mediaHTML = '<iframe src="' + embed.embedUrl + '&mute=1" frameborder="0" allow="autoplay; encrypted-media" loading="lazy"></iframe>';
      } else {
        // Direct .mp4: autoplay muted preview
        mediaHTML = '<video muted loop playsinline preload="metadata" src="' + encodeURI(v.videoUrl) + '"></video>';
      }

      card.innerHTML = mediaHTML + `
        <div class="video-card-overlay">
          <span class="${tagClass}">${v.tag}</span>
          <h3 class="video-card-title">${v.title}</h3>
          <p class="video-card-desc">${v.description}</p>
        </div>
      `;
      card.addEventListener('click', () => openReels(origIndex));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReels(origIndex); }
      });
      videoGrid.appendChild(card);
    });

    if (filtered.length === 0) {
      videoGrid.innerHTML = '<p style="text-align:center;color:var(--clr-gray-500);padding:2rem;">No videos in this category yet.</p>';
    }

    // Re-observe video cards for autoplay
    $$('.video-card', videoGrid).forEach(card => videoObserver.observe(card));
  }

  // Video filter tabs
  (function() {
    var tabs = $$('[data-vfilter]');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.forEach(function(t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        activeVideoFilter = tab.dataset.vfilter;
        renderVideos();
      });
    });
  })();

  /* --------------------------------------------------------
     INITIAL SETUP — Date pickers
  -------------------------------------------------------- */
  const today = new Date().toISOString().split('T')[0];
  bookingCheckIn.min = today;
  bookingCheckOut.min = today;

  bookingCheckIn.addEventListener('change', () => {
    bookingCheckOut.min = bookingCheckIn.value;
  });

  /* --------------------------------------------------------
     ASYNC INIT — Fetch data from API, then render
  -------------------------------------------------------- */
  /* --------------------------------------------------------
     NAVBAR AUTH — login / user info toggle
  -------------------------------------------------------- */
  function updateNavAuth() {
    const container = document.getElementById('navAuthLinks');
    if (!container) return;

    const token = localStorage.getItem('user_token');
    const name = localStorage.getItem('user_name');

    if (token && name) {
      var avatar = localStorage.getItem('user_avatar');
      var avatarSrc = avatar || '';
      container.innerHTML =
        '<a href="profile.html" class="nav-link" style="display:inline-flex;align-items:center;padding:0.25rem;" title="' + name + '">' +
          (avatarSrc
            ? '<img src="' + avatarSrc + '" alt="' + name + '" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.4);" onerror="this.outerHTML=\'<svg viewBox=\\\'0 0 24 24\\\' width=\\\'24\\\' height=\\\'24\\\' style=\\\'fill:currentColor\\\'><path d=\\\'M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z\\\'/></svg>\'">'
            : '<svg viewBox="0 0 24 24" width="24" height="24" style="fill:currentColor;"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>') +
        '</a>';
    } else {
      container.innerHTML =
        '<a href="login.html" class="nav-link" style="display:inline-flex;align-items:center;padding:0.25rem;" title="Login">' +
          '<svg viewBox="0 0 24 24" width="24" height="24" style="fill:currentColor;"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>' +
        '</a>';
    }
  }

  /* --------------------------------------------------------
     APPLY SITE SETTINGS — Dynamic content from developer panel
  -------------------------------------------------------- */
  function applySiteSettings(s) {
    if (!s) return;

    // Branding
    if (s.branding) {
      const b = s.branding;
      if (b.logoUrl) {
        $$('.logo-img').forEach(img => {
          img.onerror = function() { this.onerror = null; this.src = 'images/Syed-production.png'; };
          img.src = b.logoUrl;
          img.alt = b.companyName || '';
          if (b.logoSize) { img.style.width = b.logoSize + 'px'; img.style.height = b.logoSize + 'px'; }
          if (b.logoBorderRadius != null) img.style.borderRadius = b.logoBorderRadius + '%';
        });
      }
      if (b.companyName) {
        // Split company name into two parts for brand swap animation
        var parts = b.companyName.split(' ');
        var brandSyed = document.getElementById('brandSyed');
        var brandProd = document.getElementById('brandProd');
        if (brandSyed && brandProd && parts.length >= 2) {
          brandSyed.textContent = parts[0];
          brandProd.textContent = parts.slice(1).join(' ');
        } else {
          var logoSpan = $('.nav-logo span');
          if (logoSpan) logoSpan.textContent = b.companyName;
        }
        document.title = b.companyName;
      }
      if (b.faviconUrl) {
        // Apply border-radius by rendering favicon through canvas
        if (b.faviconBorderRadius > 0) {
          const fImg = new Image();
          fImg.crossOrigin = 'anonymous';
          fImg.onload = function() {
            const size = 64;
            const c = document.createElement('canvas');
            c.width = size; c.height = size;
            const ctx = c.getContext('2d');
            const r = (b.faviconBorderRadius / 100) * (size / 2);
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(size - r, 0);
            ctx.quadraticCurveTo(size, 0, size, r);
            ctx.lineTo(size, size - r);
            ctx.quadraticCurveTo(size, size, size - r, size);
            ctx.lineTo(r, size);
            ctx.quadraticCurveTo(0, size, 0, size - r);
            ctx.lineTo(0, r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(fImg, 0, 0, size, size);
            const favicon = $('link[rel="icon"]');
            if (favicon) favicon.href = c.toDataURL('image/png');
          };
          fImg.src = b.faviconUrl;
        } else {
          const favicon = $('link[rel="icon"]');
          if (favicon) favicon.href = b.faviconUrl;
        }
      }
      if (b.companyShortName) {
        const footerLogoSpan = $('.footer-brand .nav-logo span');
        if (footerLogoSpan) footerLogoSpan.textContent = b.companyShortName;
      }
    }

    // Hero text
    if (s.hero) {
      const h = s.hero;
      const heroSubtitle = $('.hero-subtitle');
      const heroTitle = $('.hero-title');
      const heroDesc = $('.hero-description');
      if (heroSubtitle && h.subtitle) heroSubtitle.textContent = h.subtitle;
      if (heroTitle && h.title) heroTitle.innerHTML = h.title;
      if (heroDesc && h.description) heroDesc.textContent = h.description;
    }

    // Section headers
    if (s.sectionHeaders) {
      const sectionMap = {
        gallery: '#gallery',
        videos: '#videos',
        team: '#team',
        topDestinations: '#top-destinations',
        destinations: '#destinations',
        map: '#map',
        tripPlanner: '#trip-planner',
        booking: '#booking',
        reviews: '#reviews',
        deals: '#deals'
      };
      for (const [key, selector] of Object.entries(sectionMap)) {
        const section = s.sectionHeaders[key];
        if (!section) continue;
        const el = $(selector);
        if (!el) continue;
        const tag = $('.section-tag', el);
        const title = $('.section-title', el);
        const desc = $('.section-description', el);
        if (tag && section.tag) tag.textContent = section.tag;
        if (title && section.title) title.textContent = section.title;
        if (desc && section.description) desc.textContent = section.description;
      }
    }

    // Footer
    if (s.footer) {
      const f = s.footer;
      const footerDesc = $('.footer-brand > p');
      if (footerDesc && f.description) footerDesc.textContent = f.description;
      const copyright = $('.footer-bottom p');
      if (copyright && f.copyrightText) copyright.innerHTML = f.copyrightText;
    }

    // Newsletter
    if (s.newsletter) {
      const n = s.newsletter;
      const nlHeading = $('.newsletter-content h2');
      const nlDesc = $('.newsletter-content > p');
      const nlNote = $('.newsletter-note');
      if (nlHeading && n.heading) nlHeading.textContent = n.heading;
      if (nlDesc && n.description) nlDesc.textContent = n.description;
      if (nlNote && n.subscriberNote) nlNote.textContent = n.subscriberNote;
    }

    // Loading screen
    if (s.loadingScreen) {
      const lt = $('.loading-title');
      const ltxt = $('.loading-text');
      if (lt && s.loadingScreen.title) lt.textContent = s.loadingScreen.title;
      if (ltxt && s.loadingScreen.text) ltxt.textContent = s.loadingScreen.text;
    }

    // Booking config
    if (s.bookingConfig) {
      if (s.bookingConfig.serviceFee !== undefined) bookingConfig.serviceFee = s.bookingConfig.serviceFee;
      if (s.bookingConfig.porterFeePerNight !== undefined) bookingConfig.porterFeePerNight = s.bookingConfig.porterFeePerNight;
      if (s.bookingConfig.childDiscount !== undefined) bookingConfig.childDiscount = s.bookingConfig.childDiscount;
    }

    // AI planner responses (override defaults if present)
    if (s.aiTripPlanner) {
      if (s.aiTripPlanner.aiResponses && Object.keys(s.aiTripPlanner.aiResponses).length > 0) {
        aiResponses = s.aiTripPlanner.aiResponses;
      }
      if (s.aiTripPlanner.chatResponses && Object.keys(s.aiTripPlanner.chatResponses).length > 0) {
        chatResponses = s.aiTripPlanner.chatResponses;
      }
      if (s.aiTripPlanner.welcomeMessage) {
        const firstAiMsg = $('.chat-message.ai .chat-bubble');
        if (firstAiMsg) firstAiMsg.innerHTML = '<p>' + s.aiTripPlanner.welcomeMessage + '</p>';
      }
    }
  }

  async function init() {
    try {
      // Reuse pre-fetched data from loading screen script, or fetch fresh
      const data = (window.__publicDataPromise && await window.__publicDataPromise) || await fetch('/api/public-data').then(r => r.json());
      delete window.__publicDataPromise;
      destinations = data.destinations || [];
      reviews = data.reviews || [];
      deals = data.deals || [];
      videos = data.videos || [];
      galleryImages = data.gallery || [];
      teamMembers = data.team || [];

      // Preload video thumbnails so they're ready before user scrolls
      videos.forEach(function(v) {
        var embed = getVideoEmbed(v.videoUrl);
        if (embed.type === 'youtube') {
          var img = new Image();
          img.src = 'https://img.youtube.com/vi/' + embed.videoId + '/hqdefault.jpg';
        }
      });

      // Apply site settings before rendering
      if (data.settings) {
        applySiteSettings(data.settings);
      }
    } catch (err) {
      console.warn('API not available, site will show empty sections:', err.message);
    }

    // Render data-dependent sections
    renderDestinations();
    renderTopDestinations();
    renderMapList();
    renderBookingDestinations();
    renderReviews();
    renderDeals();
    renderVideos();
    renderGallery();
    renderTeam();
    updateNavAuth();

    // Start reveal animations NOW — after settings are applied and content rendered
    // This prevents flash of old hardcoded text before dynamic settings replace it
    $$('.reveal-up').forEach(el => revealObserver.observe(el));
    const heroStats = $('.hero-stats');
    if (heroStats) statsObserver.observe(heroStats);

    // Hide loading screen
    const loader = document.getElementById('loadingScreen');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 600);
    }
  }

  init();

  /* --------------------------------------------------------
     DARK MODE
  -------------------------------------------------------- */
  function setDarkMode(enabled) {
    var root = document.documentElement;
    // Add transition class for smooth color shift
    root.classList.add('dark-mode-transition');
    if (enabled) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
    localStorage.setItem('dark_mode', String(enabled));
    // Update ARIA on toggle button
    var btn = document.getElementById('darkModeToggle');
    if (btn) {
      btn.setAttribute('aria-pressed', String(enabled));
    }
    // Remove transition class after animation completes
    setTimeout(function() {
      root.classList.remove('dark-mode-transition');
    }, 500);
  }

  function initDarkMode() {
    var stored = localStorage.getItem('dark_mode');
    // Dark mode is default unless user explicitly set it to false
    var enabled = stored !== 'false';
    // Apply without transition on initial load (class already set by inline script in <head>)
    if (enabled) {
      document.documentElement.classList.add('dark-mode');
    }
    var btn = document.getElementById('darkModeToggle');
    if (btn) {
      btn.setAttribute('aria-pressed', String(enabled));
      btn.addEventListener('click', function() {
        var isDark = document.documentElement.classList.contains('dark-mode');
        setDarkMode(!isDark);
      });
    }
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', function(e) {
      // Only follow system if user hasn't explicitly set a preference
      if (localStorage.getItem('dark_mode') === null) {
        setDarkMode(e.matches);
      }
    });
  }

  // Initialize dark mode immediately (not inside async init)
  initDarkMode();

  /* --------------------------------------------------------
     BRAND FONT SWAP (every 1 second)
  -------------------------------------------------------- */
  (function() {
    var syed = document.getElementById('brandSyed');
    var prod = document.getElementById('brandProd');
    if (syed && prod) {
      setInterval(function() {
        syed.classList.toggle('swapped');
        prod.classList.toggle('swapped');
      }, 1000);
    }
  })();

  /* --------------------------------------------------------
     HOMEPAGE REVIEW MODAL
  -------------------------------------------------------- */
  var rmModal = document.getElementById('reviewModal');
  var rmRating = 0;

  // Open modal
  var writeBtn = document.getElementById('writeReviewBtn');
  if (writeBtn) {
    writeBtn.addEventListener('click', function() {
      if (!localStorage.getItem('user_token')) {
        window.location.href = 'login.html';
        return;
      }
      // Populate destinations
      var sel = document.getElementById('rmDest');
      if (sel.options.length <= 1) {
        destinations.forEach(function(d) {
          var opt = document.createElement('option');
          opt.value = d.name;
          opt.textContent = d.name;
          sel.appendChild(opt);
        });
      }
      rmRating = 0;
      rmUpdateStars();
      document.getElementById('rmForm').reset();
      document.getElementById('rmError').style.display = 'none';
      document.getElementById('rmSuccess').style.display = 'none';
      rmModal.style.display = 'flex';
    });
  }

  // Close modal
  var rmClose = document.getElementById('reviewModalClose');
  if (rmClose) {
    rmClose.addEventListener('click', function() { rmModal.style.display = 'none'; });
  }
  if (rmModal) {
    rmModal.addEventListener('click', function(e) {
      if (e.target === rmModal) rmModal.style.display = 'none';
    });
  }

  // Stars
  function rmUpdateStars() {
    document.querySelectorAll('.rm-star').forEach(function(s) {
      s.style.color = parseInt(s.getAttribute('data-v')) <= rmRating ? '#D4A03C' : '#e2e8f0';
    });
  }
  document.querySelectorAll('.rm-star').forEach(function(star) {
    star.addEventListener('click', function() {
      rmRating = parseInt(this.getAttribute('data-v'));
      rmUpdateStars();
    });
    star.addEventListener('mouseenter', function() {
      var v = parseInt(this.getAttribute('data-v'));
      document.querySelectorAll('.rm-star').forEach(function(s) {
        s.style.color = parseInt(s.getAttribute('data-v')) <= v ? '#D4A03C' : '#e2e8f0';
      });
    });
  });
  var rmStarsWrap = document.getElementById('rmStars');
  if (rmStarsWrap) {
    rmStarsWrap.addEventListener('mouseleave', rmUpdateStars);
  }

  // Submit
  var rmForm = document.getElementById('rmForm');
  if (rmForm) {
    rmForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var errEl = document.getElementById('rmError');
      var sucEl = document.getElementById('rmSuccess');
      var btn = document.getElementById('rmSubmit');
      errEl.style.display = 'none';
      sucEl.style.display = 'none';

      var dest = document.getElementById('rmDest').value;
      var text = document.getElementById('rmText').value.trim();

      if (!dest) { errEl.textContent = 'Please select a service'; errEl.style.display = 'block'; return; }
      if (!rmRating) { errEl.textContent = 'Please select a rating'; errEl.style.display = 'block'; return; }
      if (!text) { errEl.textContent = 'Please write your review'; errEl.style.display = 'block'; return; }

      btn.disabled = true;
      btn.textContent = 'Submitting...';
      try {
        var res = await fetch('/api/reviews/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('user_token')
          },
          body: JSON.stringify({ destination: dest, rating: rmRating, text: text })
        });
        var data = await res.json();
        if (!res.ok) {
          errEl.textContent = data.message || 'Failed to submit';
          errEl.style.display = 'block';
        } else {
          sucEl.textContent = 'Review submitted! It will appear after admin approval.';
          sucEl.style.display = 'block';
          rmForm.reset();
          rmRating = 0;
          rmUpdateStars();
        }
      } catch (err) {
        errEl.textContent = 'Network error';
        errEl.style.display = 'block';
      }
      btn.disabled = false;
      btn.textContent = 'Submit Review';
    });
  }

})();
