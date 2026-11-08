'use strict';
// Single source of truth for CLE Watches contact details.
// Change the number here and every WhatsApp button on the site updates.
const CLE_CONTACT = {
  whatsapp: '12168008548',
  phoneDisplay: '+1 (216) 800-8548',
  instagram: 'https://www.instagram.com/clewatches/',
  instagramHandle: '@clewatches'
};
const waIcon = '<svg class="wa-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" stroke="none" d="M12 2.2A9.8 9.8 0 0 0 3.6 17l-1.3 4.8 4.9-1.3A9.8 9.8 0 1 0 12 2.2Zm0 1.8a8 8 0 1 1-4.1 14.9l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 0 1 12 4Zm-3.3 4.1c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4l-.5-.3-1.8-.9c-.3-.1-.5-.1-.6.1l-.9 1.1c-.2.2-.3.2-.6.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-2c-.2-.5-.4-.5-.6-.5h-.6Z"/></svg>';
function waLink(text) {
  return 'https://wa.me/' + CLE_CONTACT.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');
}
function waProductMessage(p) {
  if (!p) return 'Hi CLE Watches, I’d like help finding a watch.';
  const ref = p.reference ? ' (Ref ' + p.reference + ')' : '';
  return 'Hi CLE Watches, I’m interested in the ' + p.title + ref + '.\n' + location.origin + '/?product=' + encodeURIComponent(p.id) + '\n\nIs it still available?';
}
