import PixabayApiService from './js/pixabay-service';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const pixabayApiService = new PixabayApiService();
const numberOfResponses = pixabayApiService.numberOfResponses();

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');

searchForm.addEventListener('submit', handleSubmit);
loadMore.addEventListener('click', handleClick);

function handleSubmit(evt) {
  evt.preventDefault();
  gallery.innerHTML = '';
  loadMore.setAttribute('hidden', 'hidden');

  pixabayApiService.query = evt.currentTarget.elements.searchQuery.value;
  pixabayApiService.resetPage();
  if (pixabayApiService.query === '') {
    return;
  }

  getImages();
}

function getImages() {
  pixabayApiService
    .axiosImages()
    .then(data => {
      notifySearch(data);
    })
    .catch(error => {
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
      console.log(data.hits);
    })
    .catch(error => {
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
      }) => `<div class="photo-card">
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
        </div>`
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markupImage);
}
