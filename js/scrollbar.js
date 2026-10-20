const scrollElement = document.scrollingElement;
const track = document.createElement('div');
const thumb = document.createElement('div');

track.className = 'page-scrollbar';
track.setAttribute('role', 'scrollbar');
track.setAttribute('aria-label', 'Page scroll');
track.setAttribute('aria-orientation', 'vertical');
track.setAttribute('aria-valuemin', '0');
track.setAttribute('aria-valuemax', '100');
track.setAttribute('aria-valuenow', '0');
track.tabIndex = 0;
track.classList.add('is-hidden');

thumb.className = 'page-scrollbar-thumb';
track.appendChild(thumb);
document.body.appendChild(track);

let dragStartY = 0;
let dragStartScrollTop = 0;
let isDragging = false;

function getScrollMetrics() {
	const trackHeight = track.clientHeight;
	const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
	const thumbHeight = Math.min(
		trackHeight,
		Math.max(28, trackHeight * scrollElement.clientHeight / scrollElement.scrollHeight),
	);

	return {
		trackHeight,
		maxScroll,
		thumbHeight,
		availableTrackDistance: trackHeight - thumbHeight,
	};
}

function updateScrollbar() {
	const { trackHeight, maxScroll, thumbHeight, availableTrackDistance } = getScrollMetrics();

	if (maxScroll <= 0 || trackHeight <= 0) {
		const showWithoutOverflow = document.documentElement.hasAttribute('data-show-scrollbar');
		track.classList.toggle('is-hidden', !showWithoutOverflow);
		if (showWithoutOverflow) {
			thumb.style.height = `${trackHeight}px`;
			thumb.style.transform = 'translateY(0)';
			track.setAttribute('aria-valuenow', '0');
		}
		return;
	}

	track.classList.remove('is-hidden');
	thumb.style.height = `${thumbHeight}px`;
	thumb.style.transform = `translateY(${availableTrackDistance * scrollElement.scrollTop / maxScroll}px)`;
	track.setAttribute('aria-valuenow', `${Math.round(100 * scrollElement.scrollTop / maxScroll)}`);
}

function scrollToTrackPosition(clientY) {
	const { maxScroll, thumbHeight, availableTrackDistance } = getScrollMetrics();
	if (availableTrackDistance <= 0) return;

	const trackTop = track.getBoundingClientRect().top;
	const thumbTop = Math.min(
		availableTrackDistance,
		Math.max(0, clientY - trackTop - thumbHeight / 2),
	);

	scrollElement.scrollTop = thumbTop / availableTrackDistance * maxScroll;
	updateScrollbar();
}

track.addEventListener('pointerdown', (event) => {
	if (event.button !== 0) return;

	track.focus();
	isDragging = event.target === thumb;
	dragStartY = event.clientY;
	dragStartScrollTop = scrollElement.scrollTop;

	if (!isDragging) {
		scrollToTrackPosition(event.clientY);
		dragStartScrollTop = scrollElement.scrollTop;
	}

	track.classList.toggle('is-dragging', isDragging);
	track.setPointerCapture(event.pointerId);
	event.preventDefault();
});

track.addEventListener('pointermove', (event) => {
	if (!isDragging) return;

	const { maxScroll, availableTrackDistance } = getScrollMetrics();
	if (availableTrackDistance <= 0) return;

	scrollElement.scrollTop = dragStartScrollTop
		+ (event.clientY - dragStartY) * maxScroll / availableTrackDistance;
	updateScrollbar();
});

function stopDragging(event) {
	if (track.hasPointerCapture(event.pointerId)) {
		track.releasePointerCapture(event.pointerId);
	}
	isDragging = false;
	track.classList.remove('is-dragging');
}

track.addEventListener('pointerup', stopDragging);
track.addEventListener('pointercancel', stopDragging);

track.addEventListener('keydown', (event) => {
	const pageStep = scrollElement.clientHeight * 0.9;
	const keyScroll = {
		ArrowDown: 40,
		ArrowUp: -40,
		PageDown: pageStep,
		PageUp: -pageStep,
		Home: -Infinity,
		End: Infinity,
	};

	if (!(event.key in keyScroll)) return;

	event.preventDefault();
	const amount = keyScroll[event.key];
	scrollElement.scrollTop = amount === -Infinity
		? 0
		: amount === Infinity
			? scrollElement.scrollHeight
			: scrollElement.scrollTop + amount;
	updateScrollbar();
});

scrollElement.addEventListener('scroll', updateScrollbar, { passive: true });
window.addEventListener('scroll', updateScrollbar, { passive: true });
window.addEventListener('resize', updateScrollbar);
document.addEventListener('load', updateScrollbar, true);
new ResizeObserver(updateScrollbar).observe(document.documentElement);
updateScrollbar();
