import PixabayApiService from './js/pixabay-service';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const pixabayApiService = new PixabayApiService();
const numberOfResponses = pixabayApiService.numberOfResponses();

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');

const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  animationSpeed: 200,
  fadeSpeed: 150,
});

searchForm.addEventListener('submit', handleSubmit);
loadMore.addEventListener('click', handleClick);

function handleSubmit(evt) {
  evt.preventDefault();

  if (
    pixabayApiService.query === evt.currentTarget.elements.searchQuery.value
  ) {
    Notify.info('Enter a new word in the search field');
    return;
  }

  pixabayApiService.query = evt.currentTarget.elements.searchQuery.value;

  if (pixabayApiService.query.trim() === '') {
    Notify.info('Enter a word in the search field');
    return;
  }

  loadMore.setAttribute('hidden', 'hidden');
  gallery.innerHTML = '';
  pixabayApiService.resetPage();

  getImages();
}

function getImages() {
  pixabayApiService
    .axiosImages()
    .then(data => {
      notifySearch(data);
    })
    .catch(error => {
      Notify.failure('Oh, problem! Try again.');
      console.error(error);
    });
}

function notifySearch(data) {
  if (data.totalHits === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
    renderMarkupOfImages(data);
  }
  if (data.totalHits > numberOfResponses) {
    loadMore.removeAttribute('hidden');
  } else {
    loadMore.setAttribute('hidden', 'hidden');
  }
}

function handleClick() {
  pixabayApiService
    .axiosImages()
    .then(data => {
      notifyLoadMore(data);
      renderMarkupOfImages(data);
      scroll();
    })
    .catch(error => {
      Notify.failure('Oh, problem! Try again.');
      console.error(error);
    });
}

function notifyLoadMore(data) {
  if (
    Math.ceil(data.totalHits / numberOfResponses) ===
    pixabayApiService.currentPage()
  ) {
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
    loadMore.setAttribute('hidden', 'hidden');
  }
}

function renderMarkupOfImages(data) {
  const imageObject = data.hits;
  const markupImage = imageObject
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<a href="${largeImageURL}">
          <div class="photo-card">
          <div class="image">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
          </div>
          <div class="info">
            <p class="info-item">
              <b>Likes</b> ${likes}
            </p>
            <p class="info-item">
              <b>Views</b> ${views}
            </p>
            <p class="info-item">
              <b>Comments</b> ${comments}
            </p>
            <p class="info-item">
              <b>Downloads</b> ${downloads}
            </p>
          </div>
        </div></a>`
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markupImage);
  lightbox.refresh();
}

function scroll() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 1.4,
    behavior: 'smooth',
  });
}
