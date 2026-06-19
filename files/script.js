// ============================================
// TGV WORLDWIDE HOLIDAYS — INTERACTIONS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- NAV SCROLL STATE ---------- */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });

  /* ---------- MOBILE NAV TOGGLE ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
  }));

  /* ---------- SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- WORLD MAP DOTS (generated) ---------- */
  const mapDotsGroup = document.querySelector('.map-dots');
  if (mapDotsGroup) {
    let dotsHTML = '';
    // simple scattered grid suggesting continents, light decorative dot map
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
     JOURNEY BUILDER
     ==================================================== */
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
    bPrev.disabled = currentStep === 1;
    bNext.textContent = '';
    if (currentStep === totalSteps) {
      bNext.innerHTML = 'Talk to a Concierge <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      renderPlanSummary();
    } else {
      bNext.innerHTML = 'Continue <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
  }

  steps.forEach(s => s.addEventListener('click', () => goToStep(+s.dataset.step)));
  bPrev.addEventListener('click', () => goToStep(currentStep - 1));
  bNext.addEventListener('click', () => {
    if (currentStep === totalSteps) {
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    goToStep(currentStep + 1);
  });

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
    const d1 = new Date(dateStart.value);
    const d2 = new Date(dateEnd.value);
    const nights = Math.max(1, Math.round((d2 - d1) / 86400000));
    journeyState.start = dateStart.value;
    journeyState.end = dateEnd.value;
    const month = d1.getMonth();
    const season = [10, 11, 0, 1].includes(month) ? 'Peak season' : [5, 6, 7].includes(month) ? 'Monsoon season' : 'Shoulder season';
    tripLength.textContent = `${nights} night${nights > 1 ? 's' : ''} · ${season}`;
  }
  dateStart.addEventListener('change', updateTripLength);
  dateEnd.addEventListener('change', updateTripLength);
  updateTripLength();

  // Step 3: budget slider
  const budgetSlider = document.getElementById('budgetSlider');
  const budgetVal = document.getElementById('budgetVal');
  function formatINR(n) {
    return Number(n).toLocaleString('en-IN');
  }
  budgetSlider.addEventListener('input', () => {
    journeyState.budget = +budgetSlider.value;
    budgetVal.textContent = formatINR(budgetSlider.value);
  });

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
        <a href="#contact" class="btn-primary" style="text-decoration:none">Send This Plan to a Concierge
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>
    `;
    // sync the payment ticket to reflect the chosen journey
    syncTicketWithJourney();
  }

  /* ====================================================
     DESTINATION CAROUSEL CONTROLS
     ==================================================== */
  const destTrack = document.getElementById('destTrack');
  document.getElementById('destPrev').addEventListener('click', () => {
    destTrack.scrollBy({ left: -330, behavior: 'smooth' });
  });
  document.getElementById('destNext').addEventListener('click', () => {
    destTrack.scrollBy({ left: 330, behavior: 'smooth' });
  });

  /* ====================================================
     PAY NOW — DEMO PAYMENT FLOW
     ==================================================== */
  const payOverlay = document.getElementById('payOverlay');
  const payClose = document.getElementById('payClose');
  const payNavBtn = document.getElementById('payNavBtn');
  const footerPayLink = document.getElementById('footerPayLink');

  function openPayModal() {
    payOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closePayModal() {
    payOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  payNavBtn.addEventListener('click', openPayModal);
  footerPayLink.addEventListener('click', (e) => { e.preventDefault(); openPayModal(); });
  payClose.addEventListener('click', closePayModal);
  payOverlay.addEventListener('click', (e) => { if (e.target === payOverlay) closePayModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePayModal(); closeSuccessModal(); } });

  // Sync ticket card with whatever journey was built
  function syncTicketWithJourney() {
    const dest = journeyState.destination;
    document.getElementById('ticketDest').textContent = journeyState.destCode[dest] || 'XXX';
    document.getElementById('ticketDestCity').textContent = journeyState.destCity[dest] || dest;
    document.getElementById('ticketPackage').textContent = `Luxury ${journeyState.style.split(' ')[0]} — ${dest}`;
  }

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
      cardForm.style.display = method === 'card' ? 'flex' : 'none';
      upiForm.style.display = method === 'upi' ? 'flex' : 'none';
      netForm.style.display = method === 'netbanking' ? 'flex' : 'none';
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

  cardNumber.addEventListener('input', () => {
    let digits = cardNumber.value.replace(/\D/g, '').slice(0, 16);
    let formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    cardNumber.value = formatted;
    lcNetwork.textContent = digits ? detectNetwork(digits) : 'VISA';
    if (digits.length === 0) {
      lcNumber.textContent = '•••• •••• •••• ••••';
    } else {
      let display = formatted.padEnd(19, '•');
      // mask middle digits, show first 4 and last 4 once complete enough
      let groups = (digits.padEnd(16, '•').match(/.{1,4}/g) || []);
      groups = groups.map((g, i) => (i === 0 || i === groups.length - 1) ? g.padEnd(4, '•') : '••••');
      lcNumber.textContent = groups.join(' ');
    }
  });

  cardName.addEventListener('input', () => {
    lcName.textContent = cardName.value.trim() ? cardName.value.toUpperCase() : 'YOUR NAME';
  });

  cardExpiry.addEventListener('input', () => {
    let v = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    cardExpiry.value = v;
    lcExpiry.textContent = v || 'MM/YY';
  });

  cardCvv.addEventListener('input', () => {
    cardCvv.value = cardCvv.value.replace(/\D/g, '').slice(0, 3);
  });

  /* ---------- Form validation + fake submit ---------- */
  function showFieldError(el, show) {
    el.classList.toggle('field-error', show);
  }

  function validateCardForm() {
    let valid = true;
    const digits = cardNumber.value.replace(/\D/g, '');
    if (digits.length < 13) { showFieldError(cardNumber, true); valid = false; } else showFieldError(cardNumber, false);
    if (cardName.value.trim().length < 2) { showFieldError(cardName, true); valid = false; } else showFieldError(cardName, false);
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry.value)) { showFieldError(cardExpiry, true); valid = false; } else showFieldError(cardExpiry, false);
    if (cardCvv.value.length < 3) { showFieldError(cardCvv, true); valid = false; } else showFieldError(cardCvv, false);
    return valid;
  }

  const cardFormEl = document.getElementById('cardForm');
  const paySubmitBtn = document.getElementById('paySubmitBtn');
  cardFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateCardForm()) return;
    runFakePayment(paySubmitBtn);
  });

  document.getElementById('upiSubmitBtn').addEventListener('click', () => {
    const upiId = document.getElementById('upiId');
    if (!/^[\w.\-]+@[\w]+$/.test(upiId.value.trim())) {
      showFieldError(upiId, true);
      return;
    }
    showFieldError(upiId, false);
    runFakePayment(document.getElementById('upiSubmitBtn'));
  });

  document.querySelectorAll('.bank-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bank-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  document.getElementById('netSubmitBtn').addEventListener('click', () => {
    runFakePayment(document.getElementById('netSubmitBtn'));
  });

  function runFakePayment(btn) {
    btn.classList.add('loading');
    btn.disabled = true;
    setTimeout(() => {
      btn.classList.remove('loading');
      btn.disabled = false;
      closePayModal();
      openSuccessModal();
    }, 1900);
  }

  /* ---------- Success modal ---------- */
  const successOverlay = document.getElementById('successOverlay');
  const successClose = document.getElementById('successClose');
  const successRef = document.getElementById('successRef');

  function openSuccessModal() {
    successRef.textContent = 'TGV-' + Math.floor(100000 + Math.random() * 899999);
    successOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeSuccessModal() {
    successOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  successClose.addEventListener('click', closeSuccessModal);
  successOverlay.addEventListener('click', (e) => { if (e.target === successOverlay) closeSuccessModal(); });

  // initialize plan summary once on load (in case user jumps to step 6 via steps nav)
  renderPlanSummary();
});
