import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import { createImagesElements } from './createGallery';

const input = document.querySelector('.search-form input');
const searchForm = document.querySelector('.search-form');
const gallary = document.querySelector('.gallery');
const per_page = 40;
let searchValue = '';
let page = 1;

axios.defaults.baseURL =
  'https://pixabay.com/api/?key=31933959-fff4fcda125281524d16af7d4&image_type=photo&orientation=horizontal&safesearch=true&';

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  searchValue = input.value.trim();
  gallary.innerHTML = '';
  page = 1;
  if (searchValue === '') {
    return;
  }
  fetchImages().then(data => submitSearchForm(data));
});

async function submitSearchForm(data) {
  try {
    Number(page) === 1;
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
    console.log(data.hits.length);
    gallary.insertAdjacentHTML('beforeend', createImagesElements(data.hits));
    page += 1;
    observer.observe(document.querySelector('.gallery').lastElementChild);
    lightbox.refresh();
  } catch (error) {
    data.totalHits === 0;
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return error;
  }
  if (
    Number(page) * data.hits.length >= data.totalHits &&
    data.totalHits > per_page
  ) {
    Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
    observer.disconnect();
    return;
  }
}
async function fetchImages() {
  return await axios
    .get(`&q=${searchValue}&page=${page}&per_page=${per_page}`)
    .then(res => res.data);
}

const lightbox = new SimpleLightbox('.photo-card a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        fetchImages().then(data => submitSearchForm(data));
      }
    });
  },
  {
    rootMargin: '200px',
    threshold: 1.0,
  }
);

window.addEventListener('scroll', function () {
  const scroll = this.document.querySelector('.upward');
  scroll.classList.toggle('active', window.scrollY > 500);
});
