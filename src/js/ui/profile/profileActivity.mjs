import { generateSkeleton } from '../../utilities/skeletonLoader.mjs';
import { readProfileBids } from '../../api/profile/readBids.mjs';
import { readProfileWins } from '../../api/profile/readWins.mjs';
import { readListing } from '../../api/listing/read.mjs';

/**
 * Build a compact horizontal card for a listing (HTML string only).
 * The image is inset inside the card to leave a small white frame around it.
 *
 * @param {object} listing - Listing from the API.
 * @param {string} listing.id - Listing id.
 * @param {{url?: string, alt?: string}[]} [listing.media] - Listing media.
 * @param {string} [listing.title] - Listing title.
 * @param {string} [listing.endsAt] - Auction end timestamp.
 * @param {{bids?: number}} [listing._count] - Counts (e.g., bids).
 * @returns {string} HTML string for one card.
 */
export function cardHtml(listing, opts = {}) {
  const { bidCount } = opts;
  const mediaUrl = listing.media?.[0]?.url ?? '/images/placeholder.jpg';
  const alt = listing.media?.[0]?.alt ?? listing.title ?? 'Listing image';
  const title = listing.title ?? 'Untitled Listing';
  const endsAt = listing.endsAt
    ? new Date(listing.endsAt).toLocaleDateString()
    : '';

  const count =
    bidCount ??
    listing._count?.bids ??
    (Array.isArray(listing.bids) ? listing.bids.length : 0) ??
    0;

  return `
    <a href="/listing/?id=${listing.id}"
       class="h-card flex-none p-4 w-64 bg-white border border-gray-200 ring-1 ring-gray-100 shadow-sm rounded-sm overflow-hidden hover:shadow transition"
       aria-label="Go to Listing">
     <img src="${mediaUrl}" alt="${alt}"
   width="256" height="256" loading="lazy" decoding="async"
     class="aspect-square object-cover" />
      <div class="p-3">
        <h3 class="font-semibold leading-6 line-clamp-2 min-h-12">${title}</h3>
        <p class="text-sm text-gray-600 mt-1">Bids: ${count}</p>
        ${
          endsAt
            ? `<p class="text-sm text-gray-600 mt-0.5">Ends: ${endsAt}</p>`
            : ''
        }
      </div>
    </a>
  `;
}
/**
 * Attach Prev/Next behavior to a horizontal scroller.
 *
 * @param {HTMLElement|null} prevBtn - Button that scrolls left.
 * @param {HTMLElement|null} nextBtn - Button that scrolls right.
 * @param {HTMLElement|null} scrollerEl - The overflow-x container to scroll.
 * @param {number} [px=320] - Pixels to scroll per click.
 * @returns {void}
 */
function attachHScrollerControls(prevBtn, nextBtn, scrollerEl, px = 320) {
  if (!scrollerEl) return;
  prevBtn?.addEventListener('click', () =>
    scrollerEl.scrollBy({ left: -px, behavior: 'smooth' })
  );
  nextBtn?.addEventListener('click', () =>
    scrollerEl.scrollBy({ left: px, behavior: 'smooth' })
  );
}

/**
 * Show/hide arrows based on scroll position & content width.
 * Also re-check after images load and on resize so the initial state is correct.
 *
 * @param {HTMLElement} scroller - The overflow-x container.
 * @param {HTMLElement} prevBtn - Left arrow button.
 * @param {HTMLElement} nextBtn - Right arrow button.
 * @returns {void}
 */
function bindArrowVisibility(scroller, prevBtn, nextBtn) {
  if (!scroller || !prevBtn || !nextBtn) return;

  const update = () => {
    const max = scroller.scrollWidth - scroller.clientWidth;
    if (max <= 0) {
      // Nothing to scroll: hide both
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      return;
    }
    prevBtn.style.display = scroller.scrollLeft <= 0 ? 'none' : '';
    nextBtn.style.display = scroller.scrollLeft >= max - 1 ? 'none' : '';
  };

  scroller.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  // Re-run after layout tick and after images load
  requestAnimationFrame(update);
  setTimeout(update, 0);
  scroller.querySelectorAll('img').forEach((img) => {
    if (!img.complete) {
      img.addEventListener('load', update, { once: true });
      img.addEventListener('error', update, { once: true });
    }
  });
}

/**
 * Render the "My Bids" section as a horizontal scroller.
 *
 * Behavior:
 * - Shows a skeleton while loading.
 * - Calls `GET /auction/profiles/:name/bids?_listings=true`.
 * - If empty, renders a friendly message.
 * - Otherwise: a row of fixed-width cards with left/right overlay arrows.
 *
 * Side effects:
 * - Mutates `#profile-bids` and unhides `#section-my-bids`.
 *
 * @async
 * @param {string} userName - Profile name to load bids for.
 * @returns {Promise<void>}
 */
export async function renderMyBidsSection(userName) {
  const host = document.getElementById('profile-bids');
  const section = document.getElementById('section-my-bids');
  if (!host || !section) return;

  host.innerHTML = generateSkeleton('profileHScroller');

  try {
    // 1) Which listings did the user bid on?
    const res = await readProfileBids(userName, true);
    const bids = res?.data ?? [];

    if (!bids.length) {
      host.innerHTML =
        '<p class="text-gray-600">You have not placed any bids yet.</p>';
      section.hidden = false;
      return;
    }

    // 2) Dedupe listing IDs (some users bid multiple times on the same listing)
    const ids = Array.from(
      new Set(bids.map((b) => b?.listing?.id || b?.listingId).filter(Boolean))
    );

    // 3) Fetch detail for each listing to get _count.bids
    const details = await Promise.all(
      ids.map(async (id) => {
        try {
          const detail = await readListing(id); // returns { data, meta }
          return detail?.data;
        } catch {
          return null;
        }
      })
    );

    // 4) Build cards (skip any nulls)
    const cards = details
      .filter(Boolean)
      .map((l) => {
        const bidCount =
          l._count?.bids ?? (Array.isArray(l.bids) ? l.bids.length : 0);
        return cardHtml(l, { bidCount });
      })
      .join('');

    // 5) Horizontal scroller + arrows
    host.innerHTML = `
      <div class="relative">
        <div id="bids-scroller"
             class="h-scroller no-scrollbar flex overflow-x-auto gap-4 snap-x snap-mandatory scroll-smooth pb-2">
          ${cards}
        </div>

        <button id="bids-prev" type="button"
          class="absolute left-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-10 w-8 rounded-full
                 bg-[#C5A880] bg-opacity-80 shadow-md hover:bg-opacity-100 transition"
          aria-label="Scroll left">‹</button>

        <button id="bids-next" type="button"
          class="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-10 w-8 rounded-full
                 bg-[#C5A880] bg-opacity-80 shadow-md hover:bg-opacity-100 transition"
          aria-label="Scroll right">›</button>
      </div>
    `;

    const scroller = host.querySelector('#bids-scroller');
    const prevBtn = host.querySelector('#bids-prev');
    const nextBtn = host.querySelector('#bids-next');

    attachHScrollerControls(prevBtn, nextBtn, scroller);
    bindArrowVisibility(scroller, prevBtn, nextBtn);

    section.hidden = false;
  } catch (err) {
    console.error('Failed to load profile bids:', err);
    host.innerHTML = '<p class="text-red-600">Could not load your bids.</p>';
    section.hidden = false;
  }
}
/**
 * Render the "My Wins" section as a horizontal scroller.
 *
 * Behavior:
 * - Shows a skeleton while loading.
 * - Calls `GET /auction/profiles/:name/wins`.
 * - If empty, renders a friendly message.
 * - Otherwise: a row of fixed-width cards with left/right overlay arrows.
 *
 * Side effects:
 * - Mutates `#profile-wins` and unhides `#section-my-wins`.
 *
 * @async
 * @param {string} userName - Profile name to load wins for.
 * @returns {Promise<void>}
 */
export async function renderMyWinsSection(userName) {
  const host = document.getElementById('profile-wins');
  const section = document.getElementById('section-my-wins');
  if (!host || !section) return;

  host.innerHTML = generateSkeleton('listings');

  try {
    const res = await readProfileWins(userName);
    const wins = res?.data ?? [];

    if (!wins.length) {
      host.innerHTML = '<p class="text-gray-600">No wins yet.</p>';
      section.hidden = false;
      return;
    }

    const cards = wins.map(cardHtml).join('');

    host.innerHTML = `
      <div class="relative">
        <div id="wins-scroller"
             class="h-scroller no-scrollbar flex overflow-x-auto gap-4 snap-x snap-mandatory scroll-smooth pb-2">
          ${cards}
        </div>

        <button id="wins-prev" type="button"
          class="absolute left-1 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center h-10 w-8 rounded-full
                 bg-[#C5A880] bg-opacity-80 shadow-md hover:bg-opacity-100 transition"
          aria-label="Scroll left">‹</button>

        <button id="wins-next" type="button"
          class="absolute right-1 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center h-10 w-8 rounded-full
             bg-[#C5A880] bg-opacity-80 shadow-md hover:bg-opacity-100 transition"
          aria-label="Scroll right">›</button>
      </div>
    `;

    const scroller = host.querySelector('#wins-scroller');
    const prevBtn = host.querySelector('#wins-prev');
    const nextBtn = host.querySelector('#wins-next');

    attachHScrollerControls(prevBtn, nextBtn, scroller);
    bindArrowVisibility(scroller, prevBtn, nextBtn);

    section.hidden = false;
  } catch (err) {
    console.error('Failed to load wins:', err);
    host.innerHTML = '<p class="text-red-600">Could not load your wins.</p>';
    section.hidden = false;
  }
}
