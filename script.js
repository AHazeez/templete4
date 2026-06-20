// ============================================
// TGV WORLDWIDE HOLIDAYS — INTERACTIONS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- NAV SCROLL STATE ---------- */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 12);
    }, { passive: true });
  }

  /* ---------- MOBILE NAV TOGGLE ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    }));
  }

  /* ---------- SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---------- WORLD MAP DOTS (generated) ---------- */
  const mapDotsGroup = document.querySelector('.map-dots');
  if (mapDotsGroup) {
    let dotsHTML = '';
    const dotClusters = [
      {cx: 150, cy: 160, count: 40, spread: 90},
      {cx: 480, cy: 130, count: 30, spread: 70},
      {cx: 600, cy: 230, count: 35, spread: 90},
      {cx: 420, cy: 300, count: 30, spread: 80},
      {cx: 700, cy: 300, count: 35, spread: 90},
      {cx: 820, cy: 360, count: 20, spread: 60},
    ];
    dotClusters.forEach(c => {
      for (let i = 0; i < c.count; i++) {
        const x = c.cx + (Math.random() - 0.5) * c.spread * 2;
        const y = c.cy + (Math.random() - 0.5) * c.spread;
        dotsHTML += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2" fill="#E3D9C9" />`;
      }
    });
    mapDotsGroup.innerHTML = dotsHTML;
  }

  /* ====================================================
     JOURNEY BUILDER (Focus Page or Home Section)
     ==================================================== */
  const builderSteps = document.getElementById('builderSteps');
  if (builderSteps) {
    const steps = Array.from(document.querySelectorAll('.b-step'));
    const panes = Array.from(document.querySelectorAll('.b-pane'));
    const bPrev = document.getElementById('bPrev');
    const bNext = document.getElementById('bNext');
    let currentStep = 1;
    const totalSteps = steps.length;

    const journeyState = {
      destination: 'Maldives',
      destCity: { Maldives: 'Maldives', Switzerland: 'Switzerland', Japan: 'Japan', Italy: 'Italy', Dubai: 'Dubai', Bali: 'Bali', Turkey: 'Turkey', Greece: 'Greece' },
      destCode: { Maldives: 'MLE', Switzerland: 'ZRH', Japan: 'NRT', Italy: 'FCO', Dubai: 'DXB', Bali: 'DPS', Turkey: 'IST', Greece: 'ATH' },
      start: '2026-11-14',
      end: '2026-11-21',
      budget: 250000,
      style: 'Relaxed Luxury',
      experiences: []
    };

    function goToStep(n) {
      if (n < 1 || n > totalSteps) return;
      currentStep = n;
      steps.forEach(s => {
        const sn = +s.dataset.step;
        s.classList.toggle('active', sn === currentStep);
        s.classList.toggle('done', sn < currentStep);
      });
      panes.forEach(p => p.classList.toggle('active', +p.dataset.pane === currentStep));
      if (bPrev) bPrev.disabled = currentStep === 1;
      
      if (bNext) {
        bNext.textContent = '';
        if (currentStep === totalSteps) {
          bNext.innerHTML = 'Talk to a Concierge <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          renderPlanSummary();
        } else {
          bNext.innerHTML = 'Continue <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
      }
    }

    steps.forEach(s => s.addEventListener('click', () => goToStep(+s.dataset.step)));
    if (bPrev) bPrev.addEventListener('click', () => goToStep(currentStep - 1));
    if (bNext) {
      bNext.addEventListener('click', () => {
        if (currentStep === totalSteps) {
          // If contact form exists on page, scroll there. Otherwise direct to contact.html with pre-filled plan query?
          const contactSec = document.getElementById('contact') || document.getElementById('inquiryForm');
          if (contactSec) {
            contactSec.scrollIntoView({ behavior: 'smooth' });
          } else {
            // Redirect to contact page
            window.location.href = 'contact.html?plan=ready';
          }
          return;
        }
        goToStep(currentStep + 1);
      });
    }

    // Step 1: destination chips
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        journeyState.destination = chip.dataset.dest;
      });
    });

    // Step 2: dates
    const dateStart = document.getElementById('dateStart');
    const dateEnd = document.getElementById('dateEnd');
    const tripLength = document.getElementById('tripLength');
    
    function updateTripLength() {
      if (!dateStart || !dateEnd) return;
      const d1 = new Date(dateStart.value);
      const d2 = new Date(dateEnd.value);
      const nights = Math.max(1, Math.round((d2 - d1) / 86400000));
      journeyState.start = dateStart.value;
      journeyState.end = dateEnd.value;
      const month = d1.getMonth();
      const season = [10, 11, 0, 1].includes(month) ? 'Peak season' : [5, 6, 7].includes(month) ? 'Monsoon season' : 'Shoulder season';
      if (tripLength) {
        tripLength.textContent = `${nights} night${nights > 1 ? 's' : ''} · ${season}`;
      }
    }
    
    if (dateStart && dateEnd) {
      dateStart.addEventListener('change', updateTripLength);
      dateEnd.addEventListener('change', updateTripLength);
      updateTripLength();
    }

    // Step 3: budget slider
    const budgetSlider = document.getElementById('budgetSlider');
    const budgetVal = document.getElementById('budgetVal');
    function formatINR(n) {
      return Number(n).toLocaleString('en-IN');
    }
    if (budgetSlider && budgetVal) {
      budgetSlider.addEventListener('input', () => {
        journeyState.budget = +budgetSlider.value;
        budgetVal.textContent = formatINR(budgetSlider.value);
      });
    }

    // Step 4: travel style
    document.querySelectorAll('.style-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.style-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        journeyState.style = card.dataset.style;
      });
    });

    // Step 5: experiences
    document.querySelectorAll('.exp-toggle input').forEach(input => {
      input.addEventListener('change', () => {
        journeyState.experiences = Array.from(document.querySelectorAll('.exp-toggle input:checked'))
          .map(i => i.closest('.exp-toggle').querySelector('span').textContent);
      });
    });
    journeyState.experiences = Array.from(document.querySelectorAll('.exp-toggle input:checked'))
      .map(i => i.closest('.exp-toggle').querySelector('span').textContent);

    // Step 6: plan summary
    function renderPlanSummary() {
      const summaryEl = document.getElementById('planSummary');
      if (!summaryEl) return;
      const d1 = new Date(journeyState.start);
      const d2 = new Date(journeyState.end);
      const nights = Math.max(1, Math.round((d2 - d1) / 86400000));
      const dateStr = `${d1.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${d2.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;

      summaryEl.innerHTML = `
        <div class="plan-row"><span>Destination</span><strong>${journeyState.destination}</strong></div>
        <div class="plan-row"><span>Travel Dates</span><strong>${dateStr} (${nights}n)</strong></div>
        <div class="plan-row"><span>Budget</span><strong>₹${formatINR(journeyState.budget)}</strong></div>
        <div class="plan-row"><span>Travel Style</span><strong>${journeyState.style}</strong></div>
        <div class="plan-row" style="grid-column:1/-1"><span>Experiences Added</span><strong>${journeyState.experiences.length ? journeyState.experiences.join(', ') : 'None selected'}</strong></div>
        <div class="plan-cta">
          <a href="${document.getElementById('inquiryForm') ? '#inquiryForm' : 'contact.html?plan=' + encodeURIComponent(journeyState.destination + '|' + journeyState.style)}" class="btn-primary" style="text-decoration:none">
            Send This Plan to a Concierge
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
      `;
      // sync the payment ticket to reflect the chosen journey
      syncTicketWithJourney();
    }

    // Sync ticket card with whatever journey was built
    function syncTicketWithJourney() {
      const dest = journeyState.destination;
      const ticketDest = document.getElementById('ticketDest');
      const ticketDestCity = document.getElementById('ticketDestCity');
      const ticketPackage = document.getElementById('ticketPackage');

      if (ticketDest) ticketDest.textContent = journeyState.destCode[dest] || 'XXX';
      if (ticketDestCity) ticketDestCity.textContent = journeyState.destCity[dest] || dest;
      if (ticketPackage) ticketPackage.textContent = `Luxury ${journeyState.style.split(' ')[0]} — ${dest}`;
    }

    /* ---------- PARSE URL SEARCH PARAMS FOR PRE-SELECTION ---------- */
    const params = new URLSearchParams(window.location.search);
    const preSelectDest = params.get('destination');
    const preSelectStyle = params.get('style');

    if (preSelectDest) {
      const destChip = document.querySelector(`.chip[data-dest="${preSelectDest}"]`);
      if (destChip) {
        destChip.click();
      }
    }
    if (preSelectStyle) {
      const styleCard = document.querySelector(`.style-card[data-style="${preSelectStyle}"]`);
      if (styleCard) {
        styleCard.click();
      } else {
        const styleCards = Array.from(document.querySelectorAll('.style-card'));
        const matched = styleCards.find(c => c.dataset.style.toLowerCase().includes(preSelectStyle.toLowerCase()));
        if (matched) matched.click();
      }
    }

    // initialize plan summary once on load (in case user jumps to step 6 via steps nav)
    renderPlanSummary();
  }

  /* ====================================================
     DESTINATION CAROUSEL CONTROLS
     ==================================================== */
  const destTrack = document.getElementById('destTrack');
  const destPrev = document.getElementById('destPrev');
  const destNext = document.getElementById('destNext');

  if (destTrack && destPrev && destNext) {
    destPrev.addEventListener('click', () => {
      destTrack.scrollBy({ left: -330, behavior: 'smooth' });
    });
    destNext.addEventListener('click', () => {
      destTrack.scrollBy({ left: 330, behavior: 'smooth' });
    });
  }

  /* ====================================================
     DESTINATIONS PAGE FILTERING & SEARCH
     ==================================================== */
  const destSearchInput = document.getElementById('destSearch');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const gridCards = document.querySelectorAll('.dest-grid-card');

  if (destSearchInput || tabButtons.length > 0) {
    let currentCategory = 'all';
    let searchQuery = '';

    function filterDestinations() {
      gridCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const category = card.dataset.category || '';
        const matchesSearch = title.includes(searchQuery);
        const matchesCategory = currentCategory === 'all' || category === currentCategory;

        if (matchesSearch && matchesCategory) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }

    if (destSearchInput) {
      destSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        filterDestinations();
      });
    }

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        filterDestinations();
      });
    });
  }

  /* ====================================================
     CONTACT FORM SUBMISSION
     ==================================================== */
  const inquiryForm = document.getElementById('inquiryForm');
  const formFeedback = document.getElementById('formFeedback');

  if (inquiryForm) {
    // Check if redirecting from plan
    const urlParams = new URLSearchParams(window.location.search);
    const planInfo = urlParams.get('plan');
    if (planInfo && planInfo !== 'ready') {
      const parts = decodeURIComponent(planInfo).split('|');
      const subjectInput = document.getElementById('cMessage');
      if (subjectInput && parts.length >= 2) {
        subjectInput.value = `I am interested in customizing a ${parts[1]} journey to ${parts[0]}. Please contact me!`;
      }
    }

    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('cName').value.trim();
      const email = document.getElementById('cEmail').value.trim();
      const phone = document.getElementById('cPhone').value.trim();

      if (!name || !email || !phone) {
        showFeedback('Please fill out all required fields.', 'error');
        return;
      }

      const submitBtn = inquiryForm.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending details... <svg class="pay-spinner" style="display:inline-block;position:relative;" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" stroke-width="3" stroke-linecap="round" stroke-dasharray="40" /></svg>';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
        inquiryForm.reset();

        const refCode = 'TGV-REQ-' + Math.floor(100000 + Math.random() * 899999);
        showFeedback(`<strong>Thank you ${name}!</strong> Your request has been successfully submitted to our luxury desk. Concierge Reference Code: <strong>${refCode}</strong>. An advisor will contact you within 24 hours.`, 'success');
      }, 1600);
    });

    function showFeedback(msg, type) {
      if (!formFeedback) return;
      formFeedback.innerHTML = msg;
      formFeedback.className = 'form-feedback ' + type;
      formFeedback.style.display = 'block';
      formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* ====================================================
     PAY NOW — DEMO PAYMENT FLOW
     ==================================================== */
  const payOverlay = document.getElementById('payOverlay');
  const payClose = document.getElementById('payClose');
  const payNavBtn = document.getElementById('payNavBtn');
  const footerPayLink = document.getElementById('footerPayLink');

  function openPayModal() {
    if (payOverlay) {
      payOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
  function closePayModal() {
    if (payOverlay) {
      payOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  
  if (payNavBtn) payNavBtn.addEventListener('click', openPayModal);
  if (footerPayLink) footerPayLink.addEventListener('click', (e) => { e.preventDefault(); openPayModal(); });
  if (payClose) payClose.addEventListener('click', closePayModal);
  if (payOverlay) {
    payOverlay.addEventListener('click', (e) => { if (e.target === payOverlay) closePayModal(); });
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePayModal();
      closeSuccessModal();
    }
  });

  /* ---------- Payment method tabs ---------- */
  const pmButtons = document.querySelectorAll('.pm-btn');
  const cardForm = document.getElementById('cardForm');
  const upiForm = document.getElementById('upiForm');
  const netForm = document.getElementById('netForm');
  
  pmButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      pmButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const method = btn.dataset.method;
      if (cardForm) cardForm.style.display = method === 'card' ? 'flex' : 'none';
      if (upiForm) upiForm.style.display = method === 'upi' ? 'flex' : 'none';
      if (netForm) netForm.style.display = method === 'netbanking' ? 'flex' : 'none';
    });
  });

  /* ---------- Live card preview ---------- */
  const cardNumber = document.getElementById('cardNumber');
  const cardName = document.getElementById('cardName');
  const cardExpiry = document.getElementById('cardExpiry');
  const cardCvv = document.getElementById('cardCvv');
  const lcNumber = document.getElementById('lcNumber');
  const lcName = document.getElementById('lcName');
  const lcExpiry = document.getElementById('lcExpiry');
  const lcNetwork = document.getElementById('lcNetwork');

  function detectNetwork(num) {
    if (/^4/.test(num)) return 'VISA';
    if (/^5[1-5]/.test(num)) return 'MASTERCARD';
    if (/^3[47]/.test(num)) return 'AMEX';
    if (/^6/.test(num)) return 'RUPAY';
    return 'CARD';
  }

  if (cardNumber) {
    cardNumber.addEventListener('input', () => {
      let digits = cardNumber.value.replace(/\D/g, '').slice(0, 16);
      let formatted = digits.replace(/(.{4})/g, '$1 ').trim();
      cardNumber.value = formatted;
      if (lcNetwork) lcNetwork.textContent = digits ? detectNetwork(digits) : 'VISA';
      if (lcNumber) {
        if (digits.length === 0) {
          lcNumber.textContent = '•••• •••• •••• ••••';
        } else {
          let groups = (digits.padEnd(16, '•').match(/.{1,4}/g) || []);
          groups = groups.map((g, i) => (i === 0 || i === groups.length - 1) ? g.padEnd(4, '•') : '••••');
          lcNumber.textContent = groups.join(' ');
        }
      }
    });
  }

  if (cardName) {
    cardName.addEventListener('input', () => {
      if (lcName) lcName.textContent = cardName.value.trim() ? cardName.value.toUpperCase() : 'YOUR NAME';
    });
  }

  if (cardExpiry) {
    cardExpiry.addEventListener('input', () => {
      let v = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
      cardExpiry.value = v;
      if (lcExpiry) lcExpiry.textContent = v || 'MM/YY';
    });
  }

  if (cardCvv) {
    cardCvv.addEventListener('input', () => {
      cardCvv.value = cardCvv.value.replace(/\D/g, '').slice(0, 3);
    });
  }

  /* ---------- Form validation + fake submit ---------- */
  function showFieldError(el, show) {
    if (el) el.classList.toggle('field-error', show);
  }

  function validateCardForm() {
    let valid = true;
    if (cardNumber) {
      const digits = cardNumber.value.replace(/\D/g, '');
      if (digits.length < 13) { showFieldError(cardNumber, true); valid = false; } else showFieldError(cardNumber, false);
    }
    if (cardName) {
      if (cardName.value.trim().length < 2) { showFieldError(cardName, true); valid = false; } else showFieldError(cardName, false);
    }
    if (cardExpiry) {
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry.value)) { showFieldError(cardExpiry, true); valid = false; } else showFieldError(cardExpiry, false);
    }
    if (cardCvv) {
      if (cardCvv.value.length < 3) { showFieldError(cardCvv, true); valid = false; } else showFieldError(cardCvv, false);
    }
    return valid;
  }

  const cardFormEl = document.getElementById('cardForm');
  const paySubmitBtn = document.getElementById('paySubmitBtn');
  if (cardFormEl && paySubmitBtn) {
    cardFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateCardForm()) return;
      runFakePayment(paySubmitBtn);
    });
  }

  const upiSubmitBtn = document.getElementById('upiSubmitBtn');
  if (upiSubmitBtn) {
    upiSubmitBtn.addEventListener('click', () => {
      const upiId = document.getElementById('upiId');
      if (upiId) {
        if (!/^[\w.\-]+@[\w]+$/.test(upiId.value.trim())) {
          showFieldError(upiId, true);
          return;
        }
        showFieldError(upiId, false);
      }
      runFakePayment(upiSubmitBtn);
    });
  }

  document.querySelectorAll('.bank-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bank-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  const netSubmitBtn = document.getElementById('netSubmitBtn');
  if (netSubmitBtn) {
    netSubmitBtn.addEventListener('click', () => {
      runFakePayment(netSubmitBtn);
    });
  }

  function runFakePayment(btn) {
    if (btn) {
      btn.classList.add('loading');
      btn.disabled = true;
      setTimeout(() => {
        btn.classList.remove('loading');
        btn.disabled = false;
        closePayModal();
        openSuccessModal();
      }, 1900);
    }
  }

  /* ---------- Success modal ---------- */
  const successOverlay = document.getElementById('successOverlay');
  const successClose = document.getElementById('successClose');
  const successRef = document.getElementById('successRef');

  function openSuccessModal() {
    if (successRef) successRef.textContent = 'TGV-' + Math.floor(100000 + Math.random() * 899999);
    if (successOverlay) {
      successOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
  function closeSuccessModal() {
    if (successOverlay) {
      successOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  if (successClose) successClose.addEventListener('click', closeSuccessModal);
  if (successOverlay) {
    successOverlay.addEventListener('click', (e) => { if (e.target === successOverlay) closeSuccessModal(); });
  }
});
