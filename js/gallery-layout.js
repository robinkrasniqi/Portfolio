function layoutGallery(gallery) {
	const items = Array.from(gallery.querySelectorAll('.gallery-item'));
	if (items.length === 0) return;

	const styles = getComputedStyle(gallery);
	const padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
	const availableWidth = gallery.clientWidth - padding;
	const sizeProbe = document.createElement('div');
	sizeProbe.style.cssText = 'position:absolute;visibility:hidden;height:0';
	gallery.appendChild(sizeProbe);
	sizeProbe.style.width = 'var(--gallery-item-min-size)';
	const minimumSize = sizeProbe.getBoundingClientRect().width || 260;
	sizeProbe.style.width = 'var(--gallery-item-max-size)';
	const maximumSize = Math.max(minimumSize, sizeProbe.getBoundingClientRect().width || 400);
	sizeProbe.remove();
	const gap = parseFloat(styles.columnGap) || 0;
	if (availableWidth <= 0) return;

	const columns = Math.min(
		items.length,
		Math.max(1, Math.floor((availableWidth + gap) / (minimumSize + gap)))
	);
	const itemSize = Math.min(
		maximumSize,
		(availableWidth - gap * (columns - 1)) / columns
	);
	const layoutSignature = `${columns}:${items.length}`;
	gallery.style.setProperty('--gallery-item-size', `${itemSize}px`);

	if (gallery.dataset.galleryLayout === layoutSignature) return;

	const rows = [];
	for (let index = 0; index < items.length; index += columns) {
		const row = document.createElement('div');
		row.className = 'gallery-row';
		items.slice(index, index + columns).forEach((item) => row.appendChild(item));
		rows.push(row);
	}

	gallery.replaceChildren(...rows);
	gallery.dataset.galleryLayout = layoutSignature;
}

const galleries = Array.from(document.querySelectorAll('.gallery-grid'));
galleries.forEach(layoutGallery);

if ('ResizeObserver' in window) {
	const galleryObserver = new ResizeObserver((entries) => {
		entries.forEach(({ target }) => layoutGallery(target));
	});
	galleries.forEach((gallery) => galleryObserver.observe(gallery));
} else {
	window.addEventListener('resize', () => galleries.forEach(layoutGallery));
}
