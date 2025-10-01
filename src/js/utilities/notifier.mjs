// src/js/utilities/notifier.mjs
import { readListing } from '../api/listing/read.mjs';
import { showAlert } from '../utilities/alert.mjs';

const WATCH_KEY = 'watchedListings:v1';

/** @typedef {{lastHighest: number, lastHighestBidder?: string, endsAt: string}} WatchedState */

const watched = new Map(); // listingId -> WatchedState
let userName = null;
let timerId = null;

/** Load persisted watchlist from localStorage. */
function loadPersisted() {
  try {
    const raw = localStorage.getItem(WATCH_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw);
    Object.entries(obj).forEach(([listingId, state]) =>
      watched.set(listingId, state)
    );
  } catch {}
}

/** Persist watchlist to localStorage. */
function persist() {
  const obj = {};
  watched.forEach((v, k) => (obj[k] = v));
  localStorage.setItem(WATCH_KEY, JSON.stringify(obj));
}

/**
 * Start polling all watched listings.
 * @param {string} currentUserName
 * @param {number} [intervalMs=30000]
 */
export function initNotifier(currentUserName, intervalMs = 30000) {
  userName = currentUserName || null;
  loadPersisted();

  if (timerId) clearInterval(timerId);
  timerId = setInterval(pollAll, intervalMs);

  // also poll when tab becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && timerId) {
      clearInterval(timerId);
      timerId = null;
    } else if (document.visibilityState === 'visible' && !timerId) {
      timerId = setInterval(pollAll, intervalMs);
      pollAll(); // directly
    }
  });
}

/**
 * Start watching a listing.
 * Side effects: persist to localStorage.
 *
 * @param {string} listingId
 * @param {{highest:number, highestBidder?: string, endsAt:string}} snapshot
 */
export function watchListing(listingId, snapshot) {
  watched.set(listingId, {
    lastHighest: snapshot.highest ?? 0,
    lastHighestBidder: snapshot.highestBidder,
    endsAt: snapshot.endsAt,
  });
  persist();
}

/** Stop watch */
export function unwatchListing(listingId) {
  watched.delete(listingId);
  persist();
}

async function pollAll() {
  if (watched.size === 0) return;

  for (const [listingId, prev] of watched.entries()) {
    try {
      const resp = await readListing(listingId);
      const listing = resp?.data;
      if (!listing) continue;

      const endsAt = listing.endsAt;
      const bids = listing.bids ?? [];
      const highest = bids.length ? Math.max(...bids.map((b) => b.amount)) : 0;
      const highestBid = bids.find((b) => b.amount === highest);
      const highestBidder = highestBid?.bidderName ?? highestBid?.bidder?.name;

      // 1) Outbid:
      const youWereHighest = prev.lastHighestBidder === userName;
      const someoneElseNowHighest = highestBidder && highestBidder !== userName;
      const priceIncreased = highest > (prev.lastHighest ?? 0);
      if (youWereHighest && someoneElseNowHighest && priceIncreased) {
        showAlert('error', 'You have been outbid on a watched listing.');
      }

      // 2) Winning:
      const now = Date.now();
      const ended = new Date(endsAt).getTime() <= now;
      if (ended && highest > 0 && highestBidder === userName) {
        showAlert('success', 'You won a watched auction! 🎉');
        // valfritt: unwatch efter vinst
        // unwatchListing(listingId);
      }

      // 3) Ending soon
      const soonMs = 60 * 60 * 1000;
      const timeLeft = new Date(endsAt).getTime() - now;
      const wasSoonBefore = new Date(prev.endsAt).getTime() - now <= soonMs;
      if (timeLeft > 0 && timeLeft <= soonMs && !wasSoonBefore) {
        showAlert('success', 'An auction you watch is ending within an hour!');
      }

      // update state
      watched.set(listingId, {
        lastHighest: highest,
        lastHighestBidder: highestBidder,
        endsAt,
      });
      persist();
    } catch (e) {
      // ignore
    }
  }
}
