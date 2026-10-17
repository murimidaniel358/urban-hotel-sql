(() => {
  // Edit these in one place
  const HOTEL = { wa: '254700000000', open: 8, close: 22, tz: 'Africa/Nairobi' };
  const RATES = { standard: 8500, deluxe: 12500, suite: 21000 };
  const NAMES = { standard: 'Standard City Room', deluxe: 'Deluxe Sea-View Room', suite: 'Executive Suite' };
  const $ = s => document.querySelector(s);
 
  document.querySelectorAll('.yr').forEach(e => e.textContent = new Date().getFullYear());
  const mb = $('.mbtn'), menu = $('#menu');
  mb.addEventListener('click', () => mb.setAttribute('aria-expanded', menu.classList.toggle('open')));
 
  // Booking desk hours (8:00 to 22:00, Kenya time)
  const nowHour = () => +new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: HOTEL.tz }).format(new Date()) % 24;
  const isOpen = () => nowHour() >= HOTEL.open && nowHour() < HOTEL.close;
  document.querySelectorAll('.status').forEach(s => {
    const o = isOpen();
    s.classList.add(o ? 'open' : 'closed');
    s.textContent = o ? 'Booking desk open until 10:00 PM' : 'Booking desk closed, reopens 8:00 AM';
  });
 
  // Copy buttons
  document.querySelectorAll('.cp').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy', 1800); } catch { b.textContent = 'Select and copy'; }
  }));
 
  // Homepage quick search hands dates to the booking page
  const q = $('#quick');
  if (q) q.addEventListener('submit', e => {
    e.preventDefault();
    location.href = 'booking.html?' + new URLSearchParams(new FormData(q));
  });
 
  // Booking form
  const f = $('#bookform');
  if (!f) return;
  const p = new URLSearchParams(location.search);
  ['room', 'in', 'out', 'guests'].forEach(k => { if (p.get(k) && f.elements[k]) f.elements[k].value = p.get(k); });
  const today = new Date().toISOString().slice(0, 10);
  f.elements.in.min = f.elements.out.min = today;
  const sum = $('#sum'), err = $('#err'), btn = $('#submit');
  const kes = n => 'KES ' + n.toLocaleString('en-KE');
  const calc = () => {
    const { room, in: a, out: b } = f.elements;
    const n = a.value && b.value ? Math.round((new Date(b.value) - new Date(a.value)) / 864e5) : 0;
    if (n > 0) { const t = n * RATES[room.value]; sum.innerHTML = `<span>${NAMES[room.value]} × ${n} night${n > 1 ? 's' : ''}</span><b>${kes(t)}</b><span>Pay the full amount, or a 30% deposit (${kes(Math.round(t * .3))}) to hold the room.</span>`; return t; }
    sum.innerHTML = '<span>Choose dates to see your total.</span>'; return 0;
  };
  f.addEventListener('input', calc); calc();
  btn.disabled = !isOpen();
  if (!isOpen()) btn.textContent = 'Booking desk opens at 8:00 AM';
 
  f.addEventListener('submit', e => {
    e.preventDefault(); err.textContent = '';
    if (!isOpen()) return err.textContent = 'Bookings are taken from 8:00 AM to 10:00 PM. Please come back then.';
    const total = calc();
    if (!total) return err.textContent = 'Check-out must be after check-in.';
    const d = Object.fromEntries(new FormData(f));
    const ref = 'UH-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const msg = `Hello Urban Hotel, payment proof for booking ${ref}. ${d.name}, ${NAMES[d.room]}, ${d.in} to ${d.out}, ${d.guests} guest(s). Amount: ${kes(total)}.`;
    $('#result').innerHTML = `<div class="done" role="status"><h3>Booking request received</h3>
      <p>Your reference is <b>${ref}</b>. Pay into the account shown, using <b>${ref}</b> as the payment reference, then send us the proof.</p>
      <a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/${HOTEL.wa}?text=${encodeURIComponent(msg)}">Send payment proof on WhatsApp</a></div>`;
    $('#result').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
 