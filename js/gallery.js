const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeButton = document.querySelector('.lightbox-close');
const previousButton = document.querySelector('.lightbox-prev');
const nextButton = document.querySelector('.lightbox-next');
let currentGalleryItems = [];
let currentImageIndex = 0;
let savedScrollY = 0;
let previousBodyStyles;



			// Swap images on hover for mouse users and toggle them on touch.
			document.querySelectorAll('img[data-hover-src]').forEach((image) => {
				const stillImageSrc = image.src;
				let isShowingHoverImage = false;

				const showHoverImage = () => {
					image.src = image.dataset.hoverSrc;
					isShowingHoverImage = true;
				};
				const showStillImage = () => {
					image.src = stillImageSrc;
					isShowingHoverImage = false;
				};

				if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
					image.addEventListener('mouseenter', showHoverImage);
					image.addEventListener('mouseleave', showStillImage);
				}

				image.addEventListener('pointerdown', (event) => {
					if (event.pointerType !== 'touch') return;
					image.parentElement.classList.add('is-activated');
					if (isShowingHoverImage) {
						showStillImage();
					} else {
						showHoverImage();
					}
				});
			});


function openLightbox(gallery, index) {
	currentGalleryItems = Array.from(gallery.querySelectorAll('.gallery-item img'));
	currentImageIndex = index;
	lightboxImg.src = currentGalleryItems[currentImageIndex].src;
	savedScrollY = window.scrollY;
	previousBodyStyles = {
		position: document.body.style.position,
		top: document.body.style.top,
		width: document.body.style.width,
		overflow: document.body.style.overflow,
	};
	document.body.style.position = 'fixed';
	document.body.style.top = `-${savedScrollY}px`;
	document.body.style.width = '100%';
	document.body.style.overflow = 'hidden';
	lightbox.classList.add('active');
}

function closeLightbox() {
	lightbox.classList.remove('active');
	if (!previousBodyStyles) return;

	document.body.style.position = previousBodyStyles.position;
	document.body.style.top = previousBodyStyles.top;
	document.body.style.width = previousBodyStyles.width;
	document.body.style.overflow = previousBodyStyles.overflow;
	previousBodyStyles = undefined;
	window.scrollTo(0, savedScrollY);
}

function changeImage(direction) {
	if (currentGalleryItems.length === 0) return;

	currentImageIndex = (currentImageIndex + direction + currentGalleryItems.length) % currentGalleryItems.length;
	lightboxImg.src = currentGalleryItems[currentImageIndex].src;
}

document.querySelectorAll('.gallery-grid').forEach((gallery) => {
	gallery.addEventListener('click', (event) => {
		const item = event.target.closest('.gallery-item');
		if (!item || !gallery.contains(item)) return;

		const items = Array.from(gallery.querySelectorAll('.gallery-item'));
		openLightbox(gallery, items.indexOf(item));
	});
});

closeButton.addEventListener('click', closeLightbox);
previousButton.addEventListener('click', () => changeImage(-1));
nextButton.addEventListener('click', () => changeImage(1));

lightbox.addEventListener('click', (event) => {
	if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (event) => {
	if (!lightbox.classList.contains('active')) return;
	if (event.key === 'Escape') closeLightbox();
	if (event.key === 'ArrowLeft') changeImage(-1);
	if (event.key === 'ArrowRight') changeImage(1);
});

Object.entries(galleryImages).forEach(([galleryId, images]) => {
	document.querySelectorAll('.gallery-grid').forEach((gallery) => {
		if (gallery.id !== galleryId) return;

		images.forEach((src, index) => {
			const item = document.createElement('div');
			item.className = 'gallery-item';

			const img = document.createElement('img');
			img.src = src;
			img.alt = `${galleryId} gallery image ${index + 1}`;
			img.loading = 'lazy';

			item.appendChild(img);
			gallery.appendChild(item);
		});
	});
});