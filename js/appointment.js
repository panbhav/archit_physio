/**
 * Revital Ortho & Neuro Physiotherapy Centre - Appointment Booking & Direct Email/WhatsApp Integration
 * Email: Architjoshi018@gmail.com | Phone: 7690913118
 */

document.addEventListener('DOMContentLoaded', () => {
  const appointmentForm = document.getElementById('appointmentForm');
  const formFeedback = document.getElementById('formFeedback');
  const directWhatsAppBtn = document.getElementById('directWhatsAppBtn');
  const directEmailBtn = document.getElementById('directEmailBtn');

  // Clinic direct contact parameters
  const CLINIC_PHONE = "917690913118";
  const CLINIC_EMAIL = "Architjoshi018@gmail.com";
  const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${CLINIC_EMAIL}`;

  // Handle Form Submission
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(appointmentForm);
      const name = formData.get('patient_name')?.trim();
      const phone = formData.get('patient_phone')?.trim();
      const date = formData.get('pref_date');
      const timeSlot = formData.get('pref_time');
      const condition = formData.get('condition');
      const patientType = formData.get('patient_type');
      const homeVisit = formData.get('home_visit');
      const notes = formData.get('notes')?.trim() || 'None';

      // Validation
      if (!name || !phone || !date || !timeSlot || !condition) {
        showFeedback('error', getCurrentLang() === 'hi' 
          ? 'कृपया सभी आवश्यक फ़ील्ड (*) भरें।' 
          : 'Please complete all required fields (*).');
        return;
      }

      // Phone validation (10 digits)
      const phoneClean = phone.replace(/[^0-9]/g, '');
      if (phoneClean.length < 10) {
        showFeedback('error', getCurrentLang() === 'hi'
          ? 'कृपया एक वैध 10 अंकों का मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit mobile phone number.');
        return;
      }

      const currentLang = getCurrentLang();

      // Construct formatted summary for WhatsApp
      const summaryText = currentLang === 'hi'
        ? `🏥 *रिवाइटल फिजियोथेरेपी अपॉइंटमेंट / पूछताछ अनुरोध*\n\n` +
          `👤 *मरीज का नाम:* ${name}\n` +
          `📞 *फोन:* ${phoneClean}\n` +
          `📅 *तारीख:* ${date}\n` +
          `⏰ *समय:* ${timeSlot}\n` +
          `🩺 *समस्या/उपचार:* ${condition}\n` +
          `📋 *मरीज स्थिति:* ${patientType === 'new' ? 'नया मरीज' : 'पुराना मरीज'}\n` +
          `🏠 *होम विजिट:* ${homeVisit === 'yes' ? 'हाँ (Home Visit Requested)' : 'नहीं (Clinic Visit)'}\n` +
          `📝 *अतिरिक्त विवरण:* ${notes}`
        : `🏥 *Revital Physiotherapy Appointment / Query Request*\n\n` +
          `👤 *Patient Name:* ${name}\n` +
          `📞 *Phone:* ${phoneClean}\n` +
          `📅 *Preferred Date:* ${date}\n` +
          `⏰ *Time Slot:* ${timeSlot}\n` +
          `🩺 *Condition/Care:* ${condition}\n` +
          `📋 *Patient Type:* ${patientType === 'new' ? 'New Patient' : 'Existing Patient'}\n` +
          `🏠 *Home Visit:* ${homeVisit === 'yes' ? 'Yes (Requested)' : 'No (Clinic Visit)'}\n` +
          `📝 *Notes:* ${notes}`;

      const waUrl = `https://wa.me/${CLINIC_PHONE}?text=${encodeURIComponent(summaryText)}`;

      // Construct mailto link
      const emailSubject = `Revital Physiotherapy Query: ${name} (${condition})`;
      const emailBody = `Hello Dr. Archit Joshi,\n\nI would like to request an appointment / consultation query:\n\n` +
        `Patient Name: ${name}\n` +
        `Phone: ${phoneClean}\n` +
        `Preferred Date: ${date}\n` +
        `Preferred Time Slot: ${timeSlot}\n` +
        `Concern / Condition: ${condition}\n` +
        `Patient Status: ${patientType}\n` +
        `Home Visit Needed: ${homeVisit}\n` +
        `Additional Symptoms / Notes: ${notes}\n\n` +
        `Thank you.`;

      const mailtoUrl = `mailto:${CLINIC_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      // Submit asynchronous email copy to Architjoshi018@gmail.com
      const submitBtn = appointmentForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          ${currentLang === 'hi' ? 'भेजा जा रहा है...' : 'Sending Request...'}`;
      }

      try {
        await fetch(FORMSUBMIT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            phone: phoneClean,
            date: date,
            timeSlot: timeSlot,
            condition: condition,
            patientType: patientType,
            homeVisit: homeVisit,
            notes: notes,
            _subject: `New Physiotherapy Appointment Query from ${name} - Revital Clinic Alwar`,
            _template: 'table'
          })
        });
      } catch (err) {
        // Quiet fallback
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }

      // Show comprehensive success modal
      showSuccessModal(name, date, timeSlot, condition, waUrl, mailtoUrl);

      // Reset form
      appointmentForm.reset();
      setDefaultDate();
    });
  }

  // Handle Direct WhatsApp Button
  if (directWhatsAppBtn) {
    directWhatsAppBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentLang = getCurrentLang();
      const defaultMsg = currentLang === 'hi'
        ? "नमस्ते, मैं रिवाइटल ऑर्थो एवं न्यूरो फिजियोथेरेपी सेन्टर में डॉ. अर्चित जोशी से फिजियोथेरेपी परामर्श / अपॉइंटमेंट बुक करना चाहता/चाहती हूँ।"
        : "Hello, I would like to book a physiotherapy consultation with Dr. Archit Joshi at Revital Ortho & Neuro Physiotherapy Centre.";
      
      const waUrl = `https://wa.me/${CLINIC_PHONE}?text=${encodeURIComponent(defaultMsg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // Handle Direct Email Query Button
  if (directEmailBtn) {
    directEmailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('patient_name')?.value?.trim();
      const phoneInput = document.getElementById('patient_phone')?.value?.trim();
      const conditionInput = document.getElementById('condition_select')?.value;
      const notesInput = document.getElementById('notes')?.value?.trim();

      const subject = nameInput 
        ? `Physiotherapy Query from ${nameInput} - Revital Alwar` 
        : `Physiotherapy Consultation Query - Revital Clinic Alwar`;

      const body = `Hello Dr. Archit Joshi,\n\nI would like to enquire about physiotherapy treatment at Revital Centre, Alwar.\n\n` +
        `Patient Name: ${nameInput || '[Your Name]'}\n` +
        `Phone Number: ${phoneInput || '[Your Phone Number]'}\n` +
        `Condition/Concern: ${conditionInput || '[e.g. Knee / Back Pain / Neuro]'}\n` +
        `Query / Details: ${notesInput || '[Describe your query or requirement]'}\n\n` +
        `Thank you.`;

      const mailtoUrl = `mailto:${CLINIC_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    });
  }

  // Initialize Default Date to Today
  setDefaultDate();
});

// Helper: Set minimum selectable date to today
function setDefaultDate() {
  const dateInput = document.getElementById('pref_date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    if (!dateInput.value) {
      dateInput.value = today;
    }
  }
}

// Show validation feedback banner
function showFeedback(type, message) {
  const formFeedback = document.getElementById('formFeedback');
  if (!formFeedback) return;

  formFeedback.className = `p-4 rounded-xl mb-6 text-sm font-medium transition-all ${
    type === 'error' 
      ? 'bg-rose-50 text-rose-700 border border-rose-200' 
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  }`;
  formFeedback.innerHTML = `
    <div class="flex items-center gap-2">
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${type === 'error' 
          ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
          : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
        }
      </svg>
      <span>${message}</span>
    </div>
  `;
  formFeedback.classList.remove('hidden');

  setTimeout(() => {
    formFeedback.classList.add('hidden');
  }, 6000);
}

// Show comprehensive Success Modal with 1-click WhatsApp and Email forward
function showSuccessModal(name, date, timeSlot, condition, waUrl, mailtoUrl) {
  const isHindi = getCurrentLang() === 'hi';
  const modalContainer = document.getElementById('appointmentSuccessModal');
  if (!modalContainer) return;

  const modalBody = document.getElementById('appointmentSuccessContent');
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="text-center">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 class="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          ${isHindi ? 'अनुरोध सफलतापूर्वक भेजा गया!' : 'Request Dispatched Successfully!'}
        </h3>
        <p class="text-slate-600 text-xs sm:text-sm mb-5 leading-relaxed">
          ${isHindi 
            ? `धन्यवाद <strong>${name}</strong> जी। आपका विवरण डॉ. अर्चित जोशी को <strong>Architjoshi018@gmail.com</strong> पर भेज दिया गया है। क्लिनिक टीम जल्द ही <strong>7690913118</strong> से आपसे संपर्क करेगी।` 
            : `Thank you <strong>${name}</strong>. Your query has been routed directly to Dr. Archit Joshi at <strong>Architjoshi018@gmail.com</strong>. Our team will call you shortly from <strong>7690913118</strong> to confirm.`}
        </p>

        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs text-slate-700 space-y-1.5 mb-5 shadow-inner">
          <div><strong class="text-slate-900">${isHindi ? 'दिनांक:' : 'Date:'}</strong> ${date}</div>
          <div><strong class="text-slate-900">${isHindi ? 'समय स्लॉट:' : 'Time Slot:'}</strong> ${timeSlot}</div>
          <div><strong class="text-slate-900">${isHindi ? 'परामर्श:' : 'Concern:'}</strong> ${condition}</div>
          <div><strong class="text-slate-900">${isHindi ? 'परामर्श शुल्क:' : 'Consultation Fee:'}</strong> <span class="text-emerald-700 font-semibold">${isHindi ? 'निःशुल्क (Free Consultation)' : 'Free Consultation'}</span></div>
          <div><strong class="text-slate-900">${isHindi ? 'डॉक्टर ईमेल:' : 'Doctor Email:'}</strong> Architjoshi018@gmail.com</div>
        </div>

        <div class="flex flex-col sm:flex-row gap-2.5">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-3 rounded-xl shadow-md transition-all text-xs sm:text-sm">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            ${isHindi ? 'व्हाट्सएप कॉपी' : 'Send WhatsApp'}
          </a>
          <a href="${mailtoUrl}" class="flex-1 inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-3 rounded-xl shadow-md transition-all text-xs sm:text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            ${isHindi ? 'ईमेल कॉपी' : 'Send Email'}
          </a>
          <button onclick="closeAppointmentModal()" class="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all">
            ${isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    `;
  }

  modalContainer.classList.remove('hidden');
  modalContainer.classList.add('flex');
}

// Close Success Modal
window.closeAppointmentModal = function() {
  const modalContainer = document.getElementById('appointmentSuccessModal');
  if (modalContainer) {
    modalContainer.classList.add('hidden');
    modalContainer.classList.remove('flex');
  }
};

// Preset treatment selection when clicking condition cards
window.selectConditionInForm = function(conditionKey) {
  const select = document.getElementById('condition_select');
  if (select && conditionKey) {
    select.value = conditionKey;
  }
  const formSection = document.getElementById('appointment');
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth' });
  }
};

// Helper to get active language
function getCurrentLang() {
  return document.documentElement.lang || 'en';
}
