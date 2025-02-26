import { showAlert } from './alert.mjs';
import { placeBid } from '../api/listing/placeBid';

/**
 * Renders the bidding section including the bid form and bid list.
 */
export function renderBidSection(
  listing,
  listingId,
  fetchAndRenderListing,
  user
) {
  const { bids = [], _count, seller } = listing;

  const bidCount = _count?.bids ?? 0;
  const highestBid = bids.length
    ? Math.max(...bids.map((bid) => bid.amount))
    : 0;
  const highestBidder =
    bids.find((bid) => bid.amount === highestBid)?.bidder?.name || 'None';

  const bidsListHtml = bids.length
    ? bids
        .map(
          (bid) =>
            `<li class="flex justify-between"><span>${bid.bidder?.name}</span><span>$${bid.amount}</span></li>`
        )
        .join('')
    : '<p>No bids available.</p>';

  const bidFormHtml =
    user?.name !== seller?.name
      ? `
        <form id="bid-form" class="mt-4">
            <input type="number" id="bid-amount" placeholder="Enter your bid amount" 
                class="w-full p-2 border rounded-md mb-2" min="1" step="1" required />
            <button type="submit" class="w-full py-3 bg-[#C5A880] text-black hover:bg-[#A88B6D] transition font-semibold rounded-sm">
                Place Bid
            </button>
        </form>`
      : '';

  return `
    <div>
        <div>
            <p class="text-l font-semibold text-gray-700">Bids: ${bidCount}</p>
            <p class="text-lg font-semibold text-gray-800">Highest Bid: $${highestBid} by ${highestBidder}</p>
        </div>
        
        ${bidFormHtml}

        <div class="space-y-2 mt-4">
            <h4 class="text-xl font-semibold">Bids:</h4>
            <ul class="border p-4 rounded-md bg-white shadow-sm">
                ${bidsListHtml}
            </ul>
        </div>
    </div>
  `;
}

/**
 * Sets up event listeners for bid form submission.
 */
export function setupBidEventListeners(listingId, fetchAndRenderListing) {
  const formElement = document.getElementById('bid-form');

  if (!formElement) {
    console.info(
      'No bid form found. Likely viewing own listing. No event attached.'
    );
    return;
  }

  formElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bidAmount = parseFloat(document.getElementById('bid-amount').value);

    if (isNaN(bidAmount) || bidAmount <= 0) {
      showAlert('error', 'Please enter a valid positive bid amount.');
      return;
    }

    try {
      console.log('Placing bid with ID:', listingId);
      await placeBid(listingId, bidAmount);
      showAlert('success', 'Bid placed successfully!');

      // Call the function from listing.mjs to refresh the data
      await fetchAndRenderListing();
    } catch (error) {
      console.error('Failed to place bid:', error);
      showAlert('error', 'Failed to place bid. Please try again.');
    }
  });
}
