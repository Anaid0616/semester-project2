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
  // Destructure safely including endsAt
  const { bids = [], _count, seller, endsAt = '' } = listing;

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

  // Safely check if the auction is expired
  const isExpired = endsAt ? new Date(endsAt) < new Date() : false;

  const editDeleteButtonsHtml =
    user?.name === seller?.name
      ? `
    <div id="listing-buttons" class="mt-4 flex gap-4">
      <a href="/listing/edit/?id=${listingId}" aria-label="Go to Edit">
        <button class="px-4 py-2 bg-[#C5A880] text-black hover:bg-[#9E7B63] rounded-sm font-semibold">Edit</button>
      </a>
      <button id="delete-listing-button" class="px-4 py-2 bg-[#C5A880] text-black hover:bg-[#9E7B63] rounded-sm font-semibold">Delete</button>
    </div>`
      : '';

  // Determine what to show in the bid form
  let bidFormHtml = '';

  if (!user) {
    // Not logged in
    bidFormHtml = `
      <div class="p-4 my-4 bg-[#C5A880] text-black rounded-md">
        You need to be logged in to place a bid.
        <a href="/login/" class="text-black underline ml-2" aria-label="Go to Login">Log in</a>
        or
        <a href="/register/" class="text-black underline ml-2" aria-label="Go to Register">Register</a>
      </div>`;
  } else if (isExpired) {
    // Auction expired
    bidFormHtml = `
      <div class="p-4 my-4 bg-red-100 text-red-700 rounded-md">
        This auction has ended. Bidding is not available.
      </div>`;
  } else if (user?.name === seller?.name) {
    // User is the seller
    bidFormHtml = editDeleteButtonsHtml;
  } else {
    // Active auction and user is logged in
    bidFormHtml = `
      <form id="bid-form" class="mt-4">
        <label for="bid-amount" class="block text-sm font-medium text-gray-700">
        Enter Bid Amount:
    </label>
          <input type="number" id="bid-amount" placeholder="Enter your bid amount" 
              class="w-full p-2 border rounded-md mb-2" min="1" step="1" required />
          <button type="submit" class="w-full py-3 bg-[#C5A880] text-black hover:bg-[#A88B6D] transition font-semibold rounded-sm">
              Place Bid
          </button>
      </form>`;
  }

  return `
    <div>
        <div>
           ${
             endsAt
               ? `<p class="text-md my-2 text-gray-600">Ends At: ${new Date(
                   endsAt
                 ).toLocaleString()}</p>`
               : '<p class="text-md text-gray-600">End date not available</p>'
           }
            <p class="text-l my-2 font-semibold text-gray-700">Bids: ${bidCount}</p>
            <p class="text-lg my-2 font-semibold text-gray-800">Highest Bid: $${highestBid} by ${highestBidder}</p>
         
        </div>
        
        ${bidFormHtml}

        <div class="space-y-2 mt-4">
            <h2 class="text-xl font-semibold">Bids:</h2>
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

    // Get the current highest bid from the DOM
    const highestBidElement = document.querySelector(
      '.text-lg.font-semibold.text-gray-800'
    );
    const highestBid = parseFloat(
      highestBidElement?.textContent.replace(/[^0-9.]/g, '') || '0'
    );

    if (isNaN(bidAmount) || bidAmount <= 0) {
      showAlert('error', 'Please enter a valid positive bid amount.');
      return;
    }

    if (bidAmount <= highestBid) {
      showAlert(
        'error',
        `Your bid must be higher than the current highest bid of $${highestBid}.`
      );
      return;
    }

    try {
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
