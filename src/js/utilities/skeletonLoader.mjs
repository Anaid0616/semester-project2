/**
 * @typedef {'profile'|'profileInfo'|'profileListings'|'listings'|'profileHScroller'} SkeletonType
 */

/**
 * Generate a Tailwind-based skeleton markup string for a given variant.
 *
 * Behavior:
 * - Returns an HTML string ready to insert via `element.innerHTML`.
 * - Each variant mirrors the final layout to minimize CLS.
 * - Unknown `type` returns an empty string.
 *
 * Side effects: none (pure function).
 *
 * @param {SkeletonType|string} type - Which skeleton variant to render.
 * @returns {string} HTML string to be rendered while loading.
 */
export function generateSkeleton(type) {
  // --- Generic profile header ---
  if (type === 'profile') {
    return `
      <div class="animate-pulse flex items-start gap-6">
        <div class="w-48 h-48 bg-gray-300 rounded-sm"></div>
        <div class="flex flex-col gap-3">
          <div class="w-32 h-6 bg-gray-300 rounded"></div>
          <div class="w-48 h-4 bg-gray-300 rounded"></div>
          <div class="w-24 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    `;
  }

  // --- Profile header (avatar + text)  ---
  if (type === 'profileInfo') {
    return `
      <div class="flex items-start gap-6">
        <div class="w-36 h-36 sm:w-40 sm:h-40 rounded-sm bg-gray-300 animate-pulse"></div>
        <div class="flex-1">
          <div class="h-8 w-48 bg-gray-300 rounded animate-pulse mb-2"></div>
          <div class="h-5 w-56 bg-gray-300 rounded animate-pulse mb-2"></div>
          <div class="h-7 w-40 bg-gray-300 rounded-full animate-pulse mb-2"></div>
          <div class="h-8 w-28 bg-gray-300 rounded-sm animate-pulse mt-4"></div>
        </div>
      </div>
    `;
  }

  // --- Profile grid cards ---
  if (type === 'profileListings') {
    return `
      ${Array.from({ length: 12 })
        .map(
          () => `
        <div class="bg-white shadow rounded-sm overflow-hidden p-4 flex flex-col justify-between animate-pulse">
          <div class="w-full aspect-square bg-gray-300 rounded-sm"></div>
          <div class="p-2 w-full">
            <div class="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-300 rounded w-full"></div>
              <div class="h-4 bg-gray-300 rounded w-5/6"></div>
              <div class="h-4 bg-gray-300 rounded w-4/6"></div>
            </div>
            <div class="mt-4 space-y-2">
              <div class="h-4 bg-gray-300 rounded w-1/3"></div>
              <div class="h-4 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      `
        )
        .join('')}
    `;
  }

  // Profile: horizontal scroller (for My Bids/Wins)
  if (type === 'profileHScroller') {
    return `
      <div class="relative">
        <div class="flex overflow-x-hidden gap-4 pb-2">
          ${Array.from({ length: 4 })
            .map(
              () => `
            <div class="flex-none w-64 bg-white border border-gray-200 ring-1 ring-gray-100 shadow-sm rounded-sm overflow-hidden">
              <div class="aspect-square bg-gray-300 animate-pulse"></div>
              <div class="p-3 space-y-2">
                <div class="h-5 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                <div class="h-4 w-1/2 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  // --- Home listings ---
  if (type === 'listings') {
    return `
      ${Array.from({ length: 12 })
        .map(
          () => `
        <div class="bg-white shadow rounded-sm overflow-hidden p-4 flex flex-col justify-between animate-pulse">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-6 h-6 bg-gray-300 rounded-full border border-gray-300"></div>
            <div class="h-4 w-20 bg-gray-300 rounded"></div>
          </div>
          <div class="w-full h-52 bg-gray-300 rounded-md"></div>
          <div class="p-2 w-full">
            <div class="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div class="p-2 w-full">
            <div class="h-4 bg-gray-300 rounded w-1/3"></div>
            <div class="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
          <div class="w-full h-10 bg-gray-300 rounded mt-3"></div>
        </div>
      `
        )
        .join('')}
    `;
  }

  return '';
}
