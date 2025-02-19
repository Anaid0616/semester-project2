export function generateSkeleton(type) {
  if (type === 'profile') {
    return `
          <div class="animate-pulse flex items-start gap-6">
            <!-- Avatar Skeleton -->
            <div class="w-48 h-48 bg-gray-300 rounded-sm"></div>
    
            <!-- Profile Details Skeleton -->
            <div class="flex flex-col gap-3">
              <div class="w-32 h-6 bg-gray-300 rounded"></div>
              <div class="w-48 h-4 bg-gray-300 rounded"></div>
              <div class="w-24 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        `;
  }

  if (type === 'listings') {
    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          ${Array.from({ length: 12 })
            .map(
              () => `
                <div class="w-full bg-white shadow rounded-sm overflow-hidden p-4 flex flex-col justify-between">
                  
                  <!-- Seller Avatar & Name Skeleton -->
                  <div class="flex items-center space-x-3 mb-3">
                    <div class="w-6 h-6 bg-gray-300 rounded-full border border-gray-300"></div>
                    <div class="h-4 w-20 bg-gray-300 rounded"></div>
                  </div>
  
                  <!-- Image Skeleton -->
                  <div class="w-full h-52 bg-gray-300 rounded-md"></div>
  
                  <!-- Listing Details Skeleton -->
                  <div class="p-2 w-full">
                    <div class="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div class="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
  
                  <!-- Bid Count & Ends At Skeleton -->
                  <div class="p-2 w-full">
                    <div class="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div class="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
  
                  <!-- Bid Button Skeleton -->
                  <div class="w-full h-10 bg-gray-300 rounded mt-3"></div>
  
                </div>
              `
            )
            .join('')}
        </div>
      `;
  }

  return '';
}
