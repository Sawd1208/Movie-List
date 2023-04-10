const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";

const movies = []; //電影總清單
const MOVIES_PER_PAGE = 12;
let filteredMovies = [];
let currentPage = 1;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const layoutToggle = document.querySelector("#layout-toggle");
const cardLayout = document.querySelector(".fa-th");
const listLayout = document.querySelector(".fa-bars");

// 用 data-state 來決定是卡片模式渲染還是清單模式渲染
function renderMovieList(data) {
  if (cardLayout.dataset.state === "true") {
    let rawHTML = "";
    data.forEach((item) => {
      // title, image, id
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button 
            class="btn btn-primary 
            btn-show-movie" 
            data-bs-toggle="modal" 
            data-bs-target="#movie-modal" 
            data-id="${item.id}"
          >
            More
          </button>
          <button 
            class="btn btn-info btn-add-favorite" 
            data-id="${item.id}"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>`;
    });
    dataPanel.innerHTML = rawHTML;
  } else if (listLayout.dataset.state === "true") {
    let rawHTML = "";
    data.forEach((item) => {
      rawHTML += `<li class="list-group-item d-flex justify-content-between align-items-center">${item.title}
    <span>
      <button class="btn btn-primary
            btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">
        More
      </button>
      <button class="btn btn-info btn-add-favorite" data-id="${item.id}">
        +
      </button>
    </span>
  </li>`;
    });
    dataPanel.innerHTML = rawHTML;
  }
}
// 以電影的數量來決定多少的分頁
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" data-page=${page} href="#">${page}</a></li>`;
  }

  paginator.innerHTML = rawHTML;
}
// 分頁上是哪幾部電影
function getMoviesByPage(page) {
  // movies ? "movies" : "filteredMovies"
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}
// 電影詳細資訊
function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  // send request to show api
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;

    // insert data into modal ui
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
  });
}
// 加入我的最愛
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }

  list.push(movie);
  console.log(list);

  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// 監聽器：詳細資訊和加入最愛清單
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});
// 監聽器：選擇分頁
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);
  currentPage = page;
  renderMovieList(getMoviesByPage(page));
});
// 監聽器：搜尋電影
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  temporaryFilteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (temporaryFilteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  filteredMovies = temporaryFilteredMovies;
  renderPaginator(filteredMovies.length);
  currentPage = 1;
  renderMovieList(getMoviesByPage(currentPage));
});

layoutToggle.addEventListener("click", function onLayoutToggleClicked(event) {
  const data = event.target.dataset;
  if (data.id === "card-layout") {
    if (data.state === "true" && listLayout.dataset.state === "false") return;
    data.state = "true";
    listLayout.dataset.state = "false";
    renderMovieList(getMoviesByPage(currentPage));
  } else if (data.id === "list-layout") {
    if (data.state === "true" && cardLayout.dataset.state === "false") return;
    data.state = "true";
    cardLayout.dataset.state = "false";
    renderMovieList(getMoviesByPage(currentPage));
  }
});

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(currentPage));
  })
  .catch((err) => console.log(err));
