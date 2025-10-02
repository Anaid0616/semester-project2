/**
 * Tiny reusable pagination controller.
 *
 * Usage:
 *   const pager = createPagination({
 *     prevEl: '#prev-page',
 *     nextEl: '#next-page',
 *     currentEl: '#current-page',
 *     onChange(page) { ...fetch(page)... }
 *   });
 *   pager.update({ page: 1, totalPages: 5 });
 *
 * You can pass HTMLElements instead of selectors if you want.
 */
export function createPagination({ prevEl, nextEl, currentEl, onChange }) {
  const prev =
    typeof prevEl === 'string' ? document.querySelector(prevEl) : prevEl;
  const next =
    typeof nextEl === 'string' ? document.querySelector(nextEl) : nextEl;
  const current =
    typeof currentEl === 'string'
      ? document.querySelector(currentEl)
      : currentEl;

  if (!prev || !next || !current) {
    throw new Error('Pagination elements not found.');
  }

  let state = { page: 1, totalPages: 1 };
  let bound = false;

  function render() {
    current.textContent = String(state.page);
    prev.disabled = state.page <= 1;
    next.disabled = state.page >= state.totalPages;

    // hide entire pagination if only one page
    const bar =
      current.closest('#profile-pager, #home-pager') || current.parentElement;
    if (bar) {
      bar.classList.add('min-h-[40px]');
      const hide = state.totalPages <= 1;
      bar.classList.toggle('invisible', hide);
      bar.classList.toggle('pointer-events-none', hide);
    }
  }

  function bind() {
    if (bound) return;
    prev.addEventListener('click', () => {
      if (state.page > 1) {
        state.page -= 1;
        render();
        onChange?.(state.page);
      }
    });
    next.addEventListener('click', () => {
      if (state.page < state.totalPages) {
        state.page += 1;
        render();
        onChange?.(state.page);
      }
    });
    bound = true;
  }

  bind();
  render();

  return {
    /** Update page and/or total pages and re-render. */
    update({ page = state.page, totalPages = state.totalPages } = {}) {
      state.page = Math.max(1, page);
      state.totalPages = Math.max(1, totalPages);
      render();
    },
    /** Get current page. */
    get page() {
      return state.page;
    },
  };
}
