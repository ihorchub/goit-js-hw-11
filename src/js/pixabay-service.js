import axios from 'axios';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';

export default class PixabayApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.perPage = 40;
  }

  async axiosImages() {
    const BASE_URL = 'https://pixabay.com/api/';
    const KEY = '28948295-d76f7bbfd37371e36a905586f';
    const searchParams = new URLSearchParams({
      key: KEY,
      q: this.searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: this.perPage,
      page: this.page,
    });

    Loading.circle();

    try {
      const response = await axios.get(BASE_URL, { params: searchParams });
      Loading.remove();
      this.incrementPage();
      return response.data;
    } catch {
      Loading.remove();
      Report.info(
        'The request was not processed',
        'Maybe there is a problem with your internet or the server is not responding. <br/><br/> Try again later',
        'Okay'
      );
      console.log(error.message);
    }
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  numberOfResponses() {
    return this.perPage;
  }

  currentPage() {
    return this.page - 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
