/* =============================================================================
   INVITATION CONFIG — the single source of truth for every event fact.
   Edit values here; the page, countdown, calendar file and map all read from it.
   ============================================================================= */
window.INVITATION = {
  couple: {
    short: 'Arun & Priya',
    groom: 'S. Arun Kumar',
    bride: 'A. Priyadharshini',
    // Names used in the shared WhatsApp message
    shareNames: 'Arun Daniel & Priyadharshini'
  },

  event: {
    title: 'Wedding Reception',
    // ISO 8601 with the India offset so the countdown is correct in every timezone
    start: '2026-11-11T18:00:00+05:30',
    end: '2026-11-11T21:00:00+05:30',
    dateLabel: 'Wednesday, 11 November 2026',
    timeLabel: '6:00 PM onwards'
  },

  // Public address of the published site, used by the Share button
  shareUrl: 'https://arun-priya.github.io/Reception/',

  venue: {
    name: 'Flora Park Inn',
    city: 'Coimbatore',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Flora+Park+Inn+Coimbatore',
    embedUrl: 'https://www.google.com/maps?q=Flora+Park+Inn,+Coimbatore&output=embed'
  },

  verse: {
    text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. ' +
          'It always protects, always trusts, always hopes, always perseveres.',
    reference: '1 Corinthians 13:4–7'
  },

  // Background music: put an audio file next to index.html and name it here, e.g. 'music.mp3'.
  // Leave empty to hide the music button.
  music: '',

  calendar: {
    description: 'With hearts filled with gratitude and praise to God, join us as we celebrate our Wedding Reception.',
    fileName: 'Wedding-Reception-Arun-Priyadharshini.ics'
  }
};
