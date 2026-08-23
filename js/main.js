/**
 * Revital Ortho & Neuro Physiotherapy Centre - Main Interactive Controller
 * Handles Language Switcher (EN/HI), Navigation, Gallery Filter & Lightbox, FAQs, Condition Modals, Animations
 */

(function () {
  'use strict';

  // State
  let currentLanguage = localStorage.getItem('revital_lang') || 'en';

  // DOM Elements Cache
  let langToggleBtns = [];
  let mobileMenuBtn, mobileMenuDrawer, mobileMenuBackdrop, closeMobileMenuBtn;
  let navLinks = [];
  let faqItems = [];
  let galleryFilterBtns = [];
  let galleryItems = [];
  let lightboxModal, lightboxImg, lightboxCaption, lightboxCloseBtn;

  // Initialize once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initElements();
    applyLanguage(currentLanguage);
    initNavigation();
    initFAQAccordion();
    initEquipment();
    initAmbientMusic();
    initGallery();
    initScrollAnimations();
    initModals();
    initBackToTop();
  });

  // 1. Initialize DOM Elements
  function initElements() {
    langToggleBtns = document.querySelectorAll('.lang-toggle-btn');
    mobileMenuBtn = document.getElementById('mobileMenuBtn');
    mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
    mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
    closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
    navLinks = document.querySelectorAll('.nav-link-item');
    faqItems = document.querySelectorAll('.faq-accordion-item');
    galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
    galleryItems = document.querySelectorAll('.gallery-item');
    lightboxModal = document.getElementById('lightboxModal');
    lightboxImg = document.getElementById('lightboxImg');
    lightboxCaption = document.getElementById('lightboxCaption');
    lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

    // Attach Language Switcher Events
    langToggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedLang = btn.getAttribute('data-lang');
        if (selectedLang && selectedLang !== currentLanguage) {
          currentLanguage = selectedLang;
          localStorage.setItem('revital_lang', currentLanguage);
          applyLanguage(currentLanguage);
        }
      });
    });
  }

  // 2. Language Switching Engine
  function applyLanguage(lang) {
    if (!window.translations || !window.translations[lang]) return;
    const dict = window.translations[lang];

    document.documentElement.lang = lang;
    if (lang === 'hi') {
      document.body.classList.add('font-hindi');
    } else {
      document.body.classList.remove('font-hindi');
    }

    // Update all text nodes with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        // preserve HTML if present or use textContent with newline handling
        if (dict[key].includes('\n')) {
          el.innerHTML = dict[key].replace(/\n/g, '<br/>');
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // Update Placeholders with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) {
        el.placeholder = dict[key];
      }
    });

    // Update Active Language Switcher Styles
    langToggleBtns.forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('bg-primary-600', 'text-white', 'shadow-sm');
        btn.classList.remove('text-slate-600', 'hover:text-primary-700');
      } else {
        btn.classList.remove('bg-primary-600', 'text-white', 'shadow-sm');
        btn.classList.add('text-slate-600', 'hover:text-primary-700');
      }
    });

    // Dispatch event for other components if needed
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  // Expose global helper for other scripts
  window.getCurrentLang = function () {
    return currentLanguage;
  };

  // 3. Navigation & Header
  function initNavigation() {
    const mainHeader = document.getElementById('mainHeader');

    // Sticky shadow on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        mainHeader?.classList.add('bg-white/95', 'backdrop-blur-md', 'shadow-md', 'py-3');
        mainHeader?.classList.remove('bg-white', 'py-4');
      } else {
        mainHeader?.classList.remove('bg-white/95', 'backdrop-blur-md', 'shadow-md', 'py-3');
        mainHeader?.classList.add('bg-white', 'py-4');
      }
    });

    // Mobile Menu Toggle
    function toggleMobileMenu(open) {
      if (!mobileMenuDrawer || !mobileMenuBackdrop) return;
      if (open) {
        mobileMenuBackdrop.classList.remove('hidden');
        setTimeout(() => {
          mobileMenuBackdrop.classList.remove('opacity-0');
          mobileMenuDrawer.classList.remove('translate-x-full');
        }, 10);
        document.body.classList.add('overflow-hidden');
      } else {
        mobileMenuBackdrop.classList.add('opacity-0');
        mobileMenuDrawer.classList.add('translate-x-full');
        setTimeout(() => {
          mobileMenuBackdrop.classList.add('hidden');
          document.body.classList.remove('overflow-hidden');
        }, 300);
      }
    }

    mobileMenuBtn?.addEventListener('click', () => toggleMobileMenu(true));
    closeMobileMenuBtn?.addEventListener('click', () => toggleMobileMenu(false));
    mobileMenuBackdrop?.addEventListener('click', () => toggleMobileMenu(false));

    // Close menu when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleMobileMenu(false);
      });
    });
  }

  // 4. FAQ Accordion
  function initFAQAccordion() {
    faqItems.forEach(item => {
      const button = item.querySelector('.faq-btn');
      const content = item.querySelector('.faq-content');
      const icon = item.querySelector('.faq-icon');

      button?.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');

        // Close all other FAQs for accordion feel
        faqItems.forEach(otherItem => {
          const otherContent = otherItem.querySelector('.faq-content');
          const otherIcon = otherItem.querySelector('.faq-icon');
          otherContent?.classList.add('hidden');
          otherIcon?.classList.remove('rotate-180');
          otherItem.classList.remove('bg-primary-50/50', 'border-primary-200');
        });

        if (!isOpen) {
          content.classList.remove('hidden');
          icon?.classList.add('rotate-180');
          item.classList.add('bg-primary-50/50', 'border-primary-200');
        }
      });
    });
  }

  // 5. Gallery Filter & Lightbox
  function initGallery() {
    // Gallery Category Filtering
    galleryFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        // Update active tab styles
        galleryFilterBtns.forEach(b => {
          b.classList.remove('bg-primary-600', 'text-white', 'shadow-md');
          b.classList.add('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');
        });
        btn.classList.add('bg-primary-600', 'text-white', 'shadow-md');
        btn.classList.remove('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');

        // Filter Items
        galleryItems.forEach(item => {
          const itemCat = item.getAttribute('data-category');
          if (filter === 'all' || itemCat === filter) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });

    // Lightbox Trigger (Supports Images & Videos)
    const lightboxVideo = document.getElementById('lightboxVideo');

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const video = item.querySelector('video');
        const videoSrc = item.getAttribute('data-video-src') || video?.querySelector('source')?.src || video?.src;
        const caption = item.getAttribute('data-caption') || img?.alt || 'Revital Physiotherapy Media';

        if (lightboxModal && lightboxCaption) {
          lightboxCaption.textContent = caption;

          if (videoSrc) {
            // Video mode
            if (lightboxImg) lightboxImg.classList.add('hidden');
            if (lightboxVideo) {
              lightboxVideo.classList.remove('hidden');
              lightboxVideo.src = videoSrc;
              lightboxVideo.play().catch(() => {});
            }
          } else {
            // Image mode
            if (lightboxVideo) {
              lightboxVideo.pause();
              lightboxVideo.classList.add('hidden');
            }
            if (lightboxImg) {
              lightboxImg.classList.remove('hidden');
              lightboxImg.src = img?.src || '';
            }
          }

          lightboxModal.classList.remove('hidden');
          lightboxModal.classList.add('flex');
          document.body.classList.add('overflow-hidden');
        }
      });
    });

    // Close Lightbox
    function closeLightbox() {
      if (lightboxModal) {
        if (lightboxVideo) {
          lightboxVideo.pause();
          lightboxVideo.src = '';
        }
        lightboxModal.classList.add('hidden');
        lightboxModal.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
      }
    }

    lightboxCloseBtn?.addEventListener('click', closeLightbox);
    lightboxModal?.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });

    // Esc key close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
        window.closeAppointmentModal?.();
        window.closeConditionModal?.();
      }
    });
  }

  // 5b. Equipment Filtering & Dedicated Lightbox
  function initEquipment() {
    const equipFilterBtns = document.querySelectorAll('.equip-filter-btn');
    const equipItems = document.querySelectorAll('.equip-item');

    equipFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-equip-filter');

        equipFilterBtns.forEach(b => {
          b.classList.remove('bg-primary-600', 'text-white', 'shadow-sm');
          b.classList.add('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');
        });
        btn.classList.add('bg-primary-600', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');

        equipItems.forEach(item => {
          const itemCat = item.getAttribute('data-category');
          if (filter === 'all' || itemCat === filter) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });

    window.openEquipmentLightbox = function (imgSrc, title, desc) {
      if (lightboxModal && lightboxCaption) {
        lightboxCaption.innerHTML = `<strong class="text-white text-base">${title}</strong><br/><span class="text-xs text-slate-300">${desc}</span>`;
        const lightboxVideo = document.getElementById('lightboxVideo');
        if (lightboxVideo) {
          lightboxVideo.pause();
          lightboxVideo.classList.add('hidden');
        }
        if (lightboxImg) {
          lightboxImg.classList.remove('hidden');
          lightboxImg.src = imgSrc;
        }
        lightboxModal.classList.remove('hidden');
        lightboxModal.classList.add('flex');
        document.body.classList.add('overflow-hidden');
      }
    };
  }

  // 5c. Ambient Healing Music Controller
  function initAmbientMusic() {
    const audio = document.getElementById('ambientAudio');
    const toggleBtn = document.getElementById('ambientMusicToggleBtn');
    const playIcon = document.getElementById('musicPlayIcon');
    const pauseIcon = document.getElementById('musicPauseIcon');
    const toggleText = document.getElementById('musicToggleText');
    const muteBtn = document.getElementById('ambientMuteBtn');
    if (!audio || !toggleBtn) return;

    audio.volume = 0.45; // gentle relaxing background volume

    function updateBtnState(playing) {
      if (playing) {
        playIcon?.classList.add('hidden');
        pauseIcon?.classList.remove('hidden');
        if (toggleText) toggleText.textContent = currentLanguage === 'hi' ? 'संगीत बंद करें' : 'Pause Music';
        toggleBtn.classList.remove('bg-primary-600', 'hover:bg-primary-700');
        toggleBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
      } else {
        playIcon?.classList.remove('hidden');
        pauseIcon?.classList.add('hidden');
        if (toggleText) toggleText.textContent = currentLanguage === 'hi' ? 'संगीत चालू करें' : 'Play Calming Music';
        toggleBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
        toggleBtn.classList.add('bg-primary-600', 'hover:bg-primary-700');
      }
    }

    toggleBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().then(() => {
          updateBtnState(true);
        }).catch(() => {
          // Autoplay protection fallback
        });
      } else {
        audio.pause();
        updateBtnState(false);
      }
    });

    muteBtn?.addEventListener('click', () => {
      audio.muted = !audio.muted;
      muteBtn.classList.toggle('bg-amber-200', audio.muted);
    });

    // Auto-duck ambient music volume when any video on the page starts playing
    document.querySelectorAll('video').forEach(vid => {
      vid.addEventListener('play', () => {
        if (!audio.paused) {
          audio.volume = 0.12; // soft ducking
        }
      });
      vid.addEventListener('pause', () => {
        if (!audio.paused) {
          audio.volume = 0.45; // restore
        }
      });
      vid.addEventListener('ended', () => {
        if (!audio.paused) {
          audio.volume = 0.45; // restore
        }
      });
    });
  }

  // 6. Condition Detail Modal
  const conditionDetailsData = {
    knee: {
      title_en: "Knee Pain & Mobility Support",
      title_hi: "घुटने का दर्द एवं गतिशीलता सुधार",
      overview_en: "Knee pain can stem from osteoarthritis, meniscus wear, ligament sprains, or muscle weakness around the quadriceps and hamstrings. At Revital, we perform a structured biomechanical evaluation to detect movement restrictions and imbalances.",
      overview_hi: "घुटने का दर्द आर्थराइटिस, कार्टिलेज घिसाव, लिगामेंट खिंचाव या जांघ की मांसपेशियों की कमजोरी से हो सकता है। रिवाइटल में हम जोड़ की गतिशीलता और शक्ति का गहन परीक्षण करते हैं।",
      points_en: [
        "Gentle joint mobilization to reduce stiffness and improve synovial lubrication",
        "Targeted quadriceps, hamstring, and calf strengthening exercises",
        "Gait retraining and weight distribution correction for comfortable walking",
        "Guidance on daily activities, stair climbing, and joint preservation"
      ],
      points_hi: [
        "जोड़ों की जकड़न दूर करने हेतु सौम्य मोबिलाइजेशन तकनीकें",
        "क्वाड्रिसेप्स और हैमस्ट्रिंग मांसपेशियों की मजबूती के लिए विशेष व्यायाम",
        "बिना लचक या दर्द के चलने के लिए चाल सुधार (Gait Retraining)",
        "सीढ़ियां चढ़ने-उतरने और दैनिक गतिविधियों में जोड़ को सुरक्षित रखने के निर्देश"
      ]
    },
    back: {
      title_en: "Back Pain & Spine Rehabilitation",
      title_hi: "कमर दर्द एवं रीढ़ की हड्डी पुनर्वास",
      overview_en: "Lower back pain often arises from prolonged sitting, poor ergonomics, muscle spasm, or disc issues. Our approach focuses on spinal decompression, core activation, and progressive movement restoration.",
      overview_hi: "कमर दर्द लंबे समय तक बैठने, गलत पोस्चर, मांसपेशियों की अकड़न या डिस्क पर दबाव के कारण होता है। हमारा ध्यान रीढ़ को सहारा देने वाली मांसपेशियों को मजबूत करने पर है।",
      points_en: [
        "Targeted core and lumbar stabilization routines",
        "Gentle spinal mobility and hamstring lengthening stretches",
        "Ergonomic assessment and postural alignment advice",
        "Gradual return to daily functional lifting and bending"
      ],
      points_hi: [
        "कमर और पेट की आंतरिक मांसपेशियों (Core) को मजबूत करने वाले व्यायाम",
        "रीढ़ की लचीलापन और जकड़न दूर करने के लिए स्ट्रेचिंग",
        "बैठने और काम करने के सही पोस्चर की विस्तृत सलाह",
        "झुकने और वजन उठाने की सही तकनीक का प्रशिक्षण"
      ]
    },
    neck: {
      title_en: "Neck Pain & Cervical Care",
      title_hi: "गर्दन का दर्द एवं सर्वाइकल केयर",
      overview_en: "Cervical pain and upper back tension frequently affect desk workers, students, and mobile phone users. We address muscle tightness, cervical spine mobility, and upper quadrant posture.",
      overview_hi: "गर्दन और कंधों का दर्द अक्सर मोबाइल/कंप्यूटर के अधिक उपयोग, तनाव या गलत तकिया लगाने से होता है। हम सर्वाइकल जकड़न को दूर कर मांसपेशियों को संतुलित करते हैं।",
      points_en: [
        "Deep neck flexor strengthening and shoulder blade stabilization",
        "Upper trapezius and levator scapulae tension release",
        "Cervical range-of-motion restoration exercises",
        "Ergonomic screen height and pillow support recommendations"
      ],
      points_hi: [
        "गर्दन की गहरी मांसपेशियों और कंधे के ब्लेड की मजबूती",
        "कंधे व गर्दन के ऊपरी हिस्से के भारीपन और तनाव में राहत",
        "गर्दन को दाएँ-बाएँ और ऊपर-नीचे घुमाने की क्षमता में सुधार",
        "सही तकिया, स्क्रीन ऊंचाई और काम के दौरान ब्रेक लेने के सुझाव"
      ]
    },
    shoulder: {
      title_en: "Shoulder Pain & Frozen Shoulder",
      title_hi: "कंधे का दर्द एवं फ्रोजन शोल्डर",
      overview_en: "Shoulder stiffness or rotator cuff discomfort restricts lifting arms overhead, dressing, or sleeping comfortably. We provide structured step-by-step restoration of range and rotator cuff strength.",
      overview_hi: "फ्रोजन शोल्डर या रोटेटर कफ की समस्या से हाथ ऊपर उठाना, कपड़े पहनना या करवट सोना मुश्किल हो जाता है। हम क्रमबद्ध तरीके से कंधे की गतिशीलता लौटाते हैं।",
      points_en: [
        "Capsular stretching and gentle passive mobilization",
        "Rotator cuff and scapular muscle re-education",
        "Pain-free range-of-motion progression using functional pulleys and wand exercises",
        "Home exercise guidance for consistent long-term results"
      ],
      points_hi: [
        "कंधे के कैप्सूल की सौम्य स्ट्रेचिंग एवं मोबिलाइजेशन",
        "रोटेटर कफ मांसपेशियों की ताकत बढ़ाने वाले अभ्यास",
        "बिना दर्द हाथ को ऊपर और पीछे ले जाने का प्रशिक्षण",
        "रोजमर्रा के काम बिना सहारे करने के लिए घरेलू अभ्यास"
      ]
    },
    neuro: {
      title_en: "Neuro Physiotherapy & Stroke / Paralysis",
      title_hi: "न्यूरो फिजियोथेरेपी एवं स्ट्रोक / पैरालिसिस",
      overview_en: "Directed by Dr. Archit Joshi (MPT Neuro), our neurological rehabilitation focuses on brain plasticity, motor relearning, and helping patients regain maximum possible functional movement following stroke or neurological events.",
      overview_hi: "डॉ. अर्चित जोशी (MPT Neuro) के विशेषज्ञ मार्गदर्शन में, हम स्ट्रोक, लकवा या नसों की कमजोरी के बाद मस्तिष्क और मांसपेशियों के समन्वय को पुनः स्थापित करने के लिए कार्य करते हैं।",
      points_en: [
        "Neuro-developmental therapy (NDT) and task-oriented motor retraining",
        "Balance, postural control, and fall prevention training",
        "Gait retraining and assistive walking progression",
        "Upper limb fine motor and functional daily task practice"
      ],
      points_hi: [
        "मांसपेशियों को पुनः सक्रिय करने हेतु टास्क-ओरिएंटेड रिहैबिलिटेशन",
        "खड़े होने और चलने के दौरान संतुलन व पोस्चरल नियंत्रण का अभ्यास",
        "सुरक्षित रूप से चलने के लिए क्रमबद्ध चाल सुधार (Gait Retraining)",
        "हाथ की पकड़ और दैनिक कार्यों को करने का निरंतर अभ्यास"
      ]
    },
    sciatica: {
      title_en: "Sciatica & Radiating Nerve Pain",
      title_hi: "सायटिका एवं नसों का दर्द",
      overview_en: "Sciatica occurs when the sciatic nerve is irritated or compressed, causing shooting pain, tingling, or numbness down the leg. Physiotherapy relieves nerve tension and restores pain-free walking.",
      overview_hi: "जब रीढ़ की हड्डी से निकलने वाली साइटिक नर्व पर दबाव पड़ता है, तो कमर से पैर के अंगूठे तक तेज दर्द व झनझनाहट होती है। फिजियोथेरेपी से नसों का खिंचाव कम होता है।",
      points_en: [
        "Neural mobilization and gentle nerve flossing exercises",
        "Spine decompression and core muscle strengthening",
        "Pelvic alignment and piriformis muscle release",
        "Safe sitting and standing postures to avoid flare-ups"
      ],
      points_hi: [
        "नसों के दबाव को मुक्त करने हेतु न्यूरल मोबिलाइजेशन (Nerve Flossing)",
        "कमर की हड्डियों के बीच तनाव कम करने वाले विशेष व्यायाम",
        "पिरिफोर्मिस मांसपेशी की जकड़न दूर करना",
        "लंबे समय तक बैठने और उठने के सही नियमों का पालन"
      ]
    }
  };

  function initModals() {
    window.openConditionModal = function (conditionKey) {
      const data = conditionDetailsData[conditionKey];
      if (!data) return;

      const modal = document.getElementById('conditionModal');
      const isHi = getCurrentLang() === 'hi';

      const titleEl = document.getElementById('conditionModalTitle');
      const contentEl = document.getElementById('conditionModalContent');

      if (titleEl) {
        titleEl.textContent = isHi ? data.title_hi : data.title_en;
      }

      if (contentEl) {
        const overview = isHi ? data.overview_hi : data.overview_en;
        const points = isHi ? data.points_hi : data.points_en;

        let pointsHtml = points.map(pt => `
          <li class="flex items-start gap-2.5">
            <svg class="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-slate-700 text-sm leading-relaxed">${pt}</span>
          </li>
        `).join('');

        contentEl.innerHTML = `
          <p class="text-slate-600 text-sm leading-relaxed mb-4">${overview}</p>
          <h4 class="text-xs font-bold uppercase tracking-wider text-primary-700 mb-3">
            ${isHi ? 'पुनर्वास दृष्टिकोण एवं प्रमुख लाभ' : 'Rehabilitation Approach & Key Benefits'}
          </h4>
          <ul class="space-y-2.5 mb-6">${pointsHtml}</ul>
          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mb-6">
            <strong>${isHi ? 'चिकित्सीय नोट:' : 'Clinical Note:'}</strong> ${isHi ? 'प्रत्येक मरीज का शरीर अलग होता है। थेरेपी शुरू करने से पहले विस्तृत जांच की जाती है।' : 'Every condition is unique. Dr. Archit Joshi conducts an individual assessment before initiating exercises.'}
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <button onclick="bookForCondition('${conditionKey}')" class="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-3 rounded-xl shadow-md transition-all text-sm text-center">
              ${isHi ? 'इस समस्या के लिए अपॉइंटमेंट लें' : 'Book Consultation for this Condition'}
            </button>
            <button onclick="closeConditionModal()" class="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm transition-all">
              ${isHi ? 'बंद करें' : 'Close'}
            </button>
          </div>
        `;
      }

      modal?.classList.remove('hidden');
      modal?.classList.add('flex');
      document.body.classList.add('overflow-hidden');
    };

    window.closeConditionModal = function () {
      const modal = document.getElementById('conditionModal');
      modal?.classList.add('hidden');
      modal?.classList.remove('flex');
      document.body.classList.remove('overflow-hidden');
    };

    window.bookForCondition = function (conditionKey) {
      window.closeConditionModal();
      window.selectConditionInForm?.(conditionKey);
    };
  }

  // 7. Scroll Animations via IntersectionObserver
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animatedElements.forEach(el => observer.observe(el));
  }

  // 8. Back to Top Button
  function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
        backToTopBtn.classList.add('opacity-100', 'translate-y-0');
      } else {
        backToTopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        backToTopBtn.classList.remove('opacity-100', 'translate-y-0');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
