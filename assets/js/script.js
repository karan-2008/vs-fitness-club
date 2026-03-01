document.addEventListener('DOMContentLoaded', () => {

  // 1. NAVBAR SCROLL
  const navbar = document.querySelector('.navbar');
  const announcementBar = document.querySelector('.announcement-bar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
      if (announcementBar && !announcementBar.classList.contains('hidden')) {
        navbar.style.top = '0';
      }
    } else {
      navbar.classList.remove('scrolled');
      if (announcementBar && !announcementBar.classList.contains('hidden')) {
        navbar.style.top = announcementBar.offsetHeight + 'px';
      } else {
        navbar.style.top = '0';
      }
    }
  });

  // 2. MOBILE MENU
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-nav-overlay');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      if (mobileMenu.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  }

  document.querySelectorAll('.mobile-nav-overlay a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      if (hamburger) {
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  });

  // 3. ANNOUNCEMENT BAR DISMISS
  const closeBtn = document.querySelector('.announcement-close');
  if (closeBtn && announcementBar) {
    if (localStorage.getItem('announcementDismissed') === 'true') {
      announcementBar.style.display = 'none';
      announcementBar.classList.add('hidden');
      navbar.style.top = '0';
    } else {
      navbar.style.top = announcementBar.offsetHeight + 'px';
    }

    closeBtn.addEventListener('click', () => {
      announcementBar.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        announcementBar.style.display = 'none';
        announcementBar.classList.add('hidden');
        navbar.style.top = '0';
      }, 300);
      localStorage.setItem('announcementDismissed', 'true');
    });
  }

  // 4. SCROLL ANIMATIONS
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
  revealElements.forEach(el => revealObserver.observe(el));

  // 5. COUNTER ANIMATION
  const stats = document.querySelectorAll('.stat-num');
  let hasCounted = false;
  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !hasCounted) {
      hasCounted = true;
      stats.forEach(stat => {
        const targetStr = stat.getAttribute('data-target');
        const isFloat = targetStr.includes('.');
        const target = parseFloat(targetStr);
        const suffix = stat.getAttribute('data-suffix') || '';
        const duration = 2000;
        const step = 20;
        const totalSteps = duration / step;
        const increment = target / totalSteps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            stat.innerText = target + suffix;
            clearInterval(timer);
          } else {
            stat.innerText = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
          }
        }, step);
      });
    }
  });
  const statsContainer = document.querySelector('.hero-stats');
  if (statsContainer) statsObserver.observe(statsContainer);

  // 6. DYNAMIC DATA LOADING
  async function loadData() {
    try {
      const annRes = await fetch('_data/announcement.json');
      if (annRes.ok) {
        const annData = await annRes.json();
        if (annData.active && announcementBar) {
          announcementBar.querySelector('span').innerText = annData.text;
          announcementBar.style.backgroundColor = annData.color;
        }
      }
      const contactRes = await fetch('_data/contact.json');
      if (contactRes.ok) {
        const contactData = await contactRes.json();
        document.querySelectorAll('.app-phone').forEach(el => el.innerText = contactData.phone);
        document.querySelectorAll('.app-phone-link').forEach(el => el.href = 'tel:' + contactData.phone.replace(/\D/g, ''));
        document.querySelectorAll('.app-email').forEach(el => el.innerText = contactData.email);
        document.querySelectorAll('.app-email-link').forEach(el => el.href = 'mailto:' + contactData.email);
        document.querySelectorAll('.app-address').forEach(el => el.innerText = contactData.address);
        document.querySelectorAll('.app-instagram').forEach(el => el.innerText = contactData.instagram);
      }
    } catch (err) { console.log('Data load error:', err); }
  }
  loadData();

  // 7. CONTACT FORM VALIDATION
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      const name = document.getElementById('name');
      const phone = document.getElementById('phone');
      const email = document.getElementById('email');

      [name, phone, email].forEach(field => {
        if (field && field.value.trim() === '') {
          field.classList.add('error');
          if (field.nextElementSibling) field.nextElementSibling.style.display = 'block';
          isValid = false;
        } else if (field) {
          field.classList.remove('error');
          if (field.nextElementSibling) field.nextElementSibling.style.display = 'none';
        }
      });

      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
          email.classList.add('error');
          if (email.nextElementSibling) email.nextElementSibling.style.display = 'block';
          isValid = false;
        }
      }

      if (isValid) {
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'SENDING...';
        btn.style.opacity = '0.7';
        btn.disabled = true;

        const formData = new FormData();
        formData.append('Name', name.value);
        formData.append('Phone', phone.value);
        formData.append('Email', email.value);
        formData.append('Interest', document.getElementById('interest').value);
        formData.append('Message', document.getElementById('message').value);
        formData.append('Date', new Date().toLocaleString());

        // Replace with your Google Apps Script Web App URL
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_wW1zharYczDJ7kfqm3Tkhn-TOCqD1Y0t9_KvtpDfrj8kA81lko29ludB-TCtBnc/exec';

        fetch(SCRIPT_URL, { method: 'POST', body: formData })
          .then(response => {
            contactForm.reset();
            contactForm.style.display = 'none';
            document.getElementById('formSuccess').style.display = 'block';
          })
          .catch(error => {
            console.error('Error!', error.message);
            btn.innerHTML = originalText;
            btn.style.opacity = '1';
            btn.disabled = false;
            alert('Something went wrong. Please try again or contact us directly via WhatsApp.');
          });
      }
    });
  }

  // 8. CHATBOT
  const chatbotBtn = document.querySelector('.chatbot-btn');
  const chatbotWindow = document.querySelector('.chatbot-window');
  const chatbotClose = document.querySelector('.chatbot-close');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const chatBody = document.querySelector('.chatbot-body');

  if (chatbotBtn && chatbotWindow) {
    chatbotBtn.addEventListener('click', (e) => {
      e.preventDefault();
      chatbotWindow.classList.toggle('active');
      if (chatbotWindow.classList.contains('active') && chatBody.children.length === 0) {
        showBotMsg("Hey there! 💪 Welcome to VS Fitness Club. How can I help you today?", true);
      }
    });
    if (chatbotClose) chatbotClose.addEventListener('click', () => chatbotWindow.classList.remove('active'));
  }

  function showBotMsg(text, showQuick) {
    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'chat-msg bot typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const msg = document.createElement('div');
      msg.className = 'chat-msg bot';
      msg.innerHTML = text;
      chatBody.appendChild(msg);

      if (showQuick) {
        const qr = document.createElement('div');
        qr.className = 'quick-replies';
        ['💰 Membership', '⏰ Timings', '📍 Location', '🏋️ Facilities', '📞 Contact'].forEach(t => {
          const btn = document.createElement('button');
          btn.className = 'quick-reply';
          btn.textContent = t;
          btn.addEventListener('click', () => {
            addUserMsg(t);
            qr.remove();
            handleBot(t);
          });
          qr.appendChild(btn);
        });
        chatBody.appendChild(qr);
      }
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 800);
  }

  function addUserMsg(text) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg user';
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Knowledge base for the chatbot
  const KB = {
    membership: {
      keywords: ['member', 'price', 'cost', 'plan', 'fee', 'join', 'offer', 'discount', '50', 'rate', 'monthly', 'annual', 'quarterly', '💰'],
      response: "🔥 <b>SPECIAL OFFER: 50% OFF!</b><br><br>Our plans:<br>• <b>Monthly VIP:</b> ₹2,500/mo<br>• <b>Quarterly Pro:</b> ₹6,000/3mo<br>• <b>Annual Elite:</b> ₹18,000/yr<br><br>All plans include full equipment access, steam room & ice bath!<br><br>📞 Call <a href='tel:9156615912' style='color:var(--gold)'>9156615912</a> to claim your 50% off!"
    },
    timings: {
      keywords: ['time', 'timing', 'hour', 'open', 'close', 'schedule', 'when', '⏰'],
      response: "⏰ <b>Opening Hours:</b><br><br>🗓 <b>Mon - Sat:</b> 5:00 AM – 11:00 PM<br>🗓 <b>Sunday:</b> 6:00 AM – 10:00 PM<br><br>We're open every single day! 💪"
    },
    location: {
      keywords: ['where', 'location', 'address', 'map', 'direction', 'reach', 'find', 'visit', '📍', 'giripeth', 'dharampeth'],
      response: "📍 <b>Our Location:</b><br><br>VS Building, Giripeth, Dharampeth, Nagpur<br><br><a href='https://maps.google.com/?q=VS+Building,+Giripeth,+Dharampeth,+Nagpur' target='_blank' style='color:var(--gold)'>📌 Open in Google Maps</a><br><br>Easy to find — right in the heart of Dharampeth!"
    },
    facilities: {
      keywords: ['facility', 'facilities', 'equipment', 'gym', 'what', 'offer', 'service', 'steam', 'ice', 'bath', 'cafe', 'rooftop', 'ac', 'train', 'weight', 'cardio', '🏋️'],
      response: "🏋️ <b>World-Class Facilities:</b><br><br>• Premium Strength Training Equipment<br>• Advanced Cardio Zone<br>• Group Fitness Classes<br>• Powerlifting Coaching<br>• Steam Room & Ice Bath ❄️<br>• Rooftop Café ☕<br>• Fully Air-Conditioned<br>• Free WiFi & Parking<br><br>We're not just a gym — we're a complete wellness destination!"
    },
    contact: {
      keywords: ['contact', 'call', 'phone', 'number', 'whatsapp', 'email', 'talk', 'reach', '📞'],
      response: "📞 <b>Get In Touch:</b><br><br>📱 Phone: <a href='tel:9156615912' style='color:var(--gold)'>9156615912</a><br>📧 Email: <a href='mailto:vsfitnessclub1@gmail.com' style='color:var(--gold)'>vsfitnessclub1@gmail.com</a><br>📸 Instagram: <a href='https://instagram.com/vsfitnessclub_' target='_blank' style='color:var(--gold)'>@vsfitnessclub_</a><br>💬 WhatsApp: <a href='https://wa.me/919156615912' target='_blank' style='color:var(--gold)'>Chat Now</a>"
    },
    trainer: {
      keywords: ['trainer', 'coach', 'personal', 'expert', 'certified', 'guidance'],
      response: "👨‍🏫 <b>Expert Trainers:</b><br><br>We have 10+ certified & experienced trainers specializing in:<br>• Powerlifting & Strength<br>• Weight Loss & HIIT<br>• Bodybuilding & Custom Diets<br><br>Every member gets personalized guidance! 💪"
    },
    greeting: {
      keywords: ['hi', 'hello', 'hey', 'sup', 'good', 'morning', 'evening', 'afternoon', 'namaste', 'hii'],
      response: "Hey! 👋 Welcome to VS Fitness Club — Nagpur's premium gym! How can I help you today?"
    },
    thanks: {
      keywords: ['thank', 'thanks', 'ok', 'okay', 'got it', 'bye', 'cool', 'great', 'perfect', 'nice'],
      response: "You're welcome! 😊 Feel free to ask anything else.<br><br>See you at the gym! 💪🔥<br><b>#StrongerEveryDay</b>"
    }
  };

  function handleBot(input) {
    const lower = input.toLowerCase();
    let matched = null;

    for (const key of Object.keys(KB)) {
      const entry = KB[key];
      for (const kw of entry.keywords) {
        if (lower.includes(kw)) {
          matched = entry.response;
          break;
        }
      }
      if (matched) break;
    }

    if (!matched) {
      matched = "I'd love to help! You can ask me about:<br>• 💰 Membership plans & offers<br>• ⏰ Gym timings<br>• 📍 Location & directions<br>• 🏋️ Our facilities<br>• 📞 Contact info<br><br>Or call us at <a href='tel:9156615912' style='color:var(--gold)'>9156615912</a>!";
    }

    showBotMsg(matched, false);
  }

  if (chatSend) {
    chatSend.addEventListener('click', () => sendChat());
  }
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChat(); });
  }

  function sendChat() {
    const val = chatInput.value.trim();
    if (!val) return;
    addUserMsg(val);
    chatInput.value = '';
    handleBot(val);
  }

});
