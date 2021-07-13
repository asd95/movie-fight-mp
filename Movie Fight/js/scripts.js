function createAutoComplete({
  root,
  onRenderOption,
  onOptionSelect,
  inputValue,
  fetchData,
}) {
  // render root template on page
  root.innerHTML = `
  <h1 class="title-movie-search">Search</h1>
    <input type="text" class="input">
    <ul class="dropdown-menu">
    </ul>
`;
  // get items from root
  const input = root.querySelector(".input");
  const dropdownMenu = root.querySelector(".dropdown-menu");

  // 
  const onInput = async (e) => {
    try {
      // get Data
      const items = await fetchData(e.target.value);

      // dropdown !visible
      items.length > 0
        ? dropdownMenu.classList.add("show")
        : dropdownMenu.classList.remove("show");
      dropdownMenu.innerHTML = "";
      
      // 
      items.forEach((item) => {
        // create a dropdown-item
        const dropdownItem = createDropdownItem(onRenderOption, item);
        // append dropdown-item in dropdown-menu
        dropdownMenu.appendChild(dropdownItem);
      });
    } catch (e) {
      // error handling
      throw new Error(e);
    }
  };

  function createDropdownItem(onRenderOption, item) {
    const li = document.createElement("li");
    const option = document.createElement("a");

    option.classList.add("dropdown-item");
    option.innerHTML = onRenderOption(item);
    option.addEventListener("click", () => onDropdownItem(item));
    li.appendChild(option)
    return li;
  }

  function onDropdownItem(item) {
    dropdownMenu.classList.remove("show");
    input.value = inputValue(item);

    onOptionSelect(item);
  }

  // event listener
  input.addEventListener("input", deBounce(onInput, 500));
  document.addEventListener("click", (e) => {
    if (!dropdownMenu.classList.contains("show")) {
      return;
    }
    if (!root.contains(e.target)) {
      dropdownMenu.classList.remove("show");
    }
  });
}

const autoCompleteConfig = {
  onRenderOption: (movie) => {
    const { Poster, Title } = movie;
    const imageSRC = Poster === "N/A" ? "" : Poster;
    return `
      <img src = "${imageSRC}" />
      ${Title}
      `;
  },
  inputValue: (movie) => {
    return movie.Title;
  },
  fetchData: (movieTitle) =>
    getData("s", movieTitle).then((res) => {
      if (res.Error) {
        return [];
      }
      return res.Search;
    }),
};

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector(".left-autocomplete"),
  onOptionSelect: (movie) => {
    document.querySelector(".notification").classList.add("ntf-hidden");
    onMovieSelect(movie, document.querySelector(".left-summary"), "left");
  },
});
createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector(".right-autocomplete"),
  onOptionSelect: (movie) => {
    document.querySelector(".notification").classList.add("ntf-hidden");
    onMovieSelect(movie, document.querySelector(".right-summary", "right"));
  },
});

// summary of movie

let sideLeft;
let sideRight;
async function onMovieSelect(movie, summaryEl, side) {
  const result = await getData("i", movie.imdbID).then((result) => result);
  const summary = summaryEl;
  summary.innerHTML = "";
  summary.innerHTML = createMovieTemplate(result);

  if (side === "left") {
    sideLeft = result;
  } else sideRight = result;

  if (sideLeft && sideRight) {
    runComparision();
  }
}

function runComparision() {
  const leftSideStats = document.querySelectorAll(
    ".left-summary .list-group-item"
  );
  const rightSideStats = document.querySelectorAll(
    ".right-summary .list-group-item"
  );

  leftSideStats.forEach((leftStat, idx) => {
    const rightStat = rightSideStats[idx];
    const leftSideValue = Number(leftStat.dataset.value);
    const rightSideValue = Number(rightStat.dataset.value);
    
      leftStat.classList.remove(...leftStat.classList);
      leftStat.classList.add("list-group-item", "primary");
      rightStat.classList.remove(...rightStat.classList);
      rightStat.classList.add("list-group-item", "primary");

    if (leftSideValue < rightSideValue) {
      leftStat.classList.add("less");
      rightStat.classList.add("more");
    } else if (leftSideValue > rightSideValue) {
      leftStat.classList.add("more");
      rightStat.classList.add("less");
    } else if (leftSideValue === rightSideValue) {
      leftStat.classList.add("equal");
      rightStat.classList.add("equal");
    }
  });
}

function createMovieTemplate(movieDetails) {
  const awards = movieDetails.Awards.split(" ").reduce(
    (total, currentValue) => {
      const value = parseInt(currentValue);
      if (isNaN(value)) {
        return total;
      } else return total + value;
    },
    0
  );
  const bucks = parseInt(
    movieDetails.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metascore = parseInt(movieDetails.Metascore);
  const imdbRating = parseFloat(movieDetails.imdbRating);
  const imdbVotes = parseInt(movieDetails.imdbVotes.replace(/,/g, ""));

  return `
  <div class="card mb-3">
    <div class="row g-0">
      <div class=" col-12 col-sm-4 d-flex justify-content-center">
        <img src="${movieDetails.Poster}" class="img-fluid rounded-start" alt="...">
      </div>
      <div class="col-12 col-sm-8">
        <div class="card-body">
          <h5 class="card-title">${movieDetails.Title}</h5>
          <p class="card-text">${movieDetails.Genre}</p>
          <p class="card-text"><small class="text-muted">${movieDetails.Plot}</small></p>
        </div>
      </div>
    </div>
    <ul class="list-group list-group-flush">
      <li data-value=${awards} class="list-group-item primary"><p class="name">Awards:</p><p class="detail-st">${movieDetails.Awards}</p></li>
      <li data-value=${bucks} class="list-group-item primary"><p class="name">Box Office:</p><p class="detail-st">${movieDetails.BoxOffice}</p></li>
      <li data-value=${metascore} class="list-group-item primary"><p class="name">Meta score:</p><p class="detail-st">${movieDetails.Metascore}</p></li>
      <li data-value=${imdbRating} class="list-group-item primary"><p class="name">IMDb Rating:</p><p class="detail-st">${movieDetails.imdbRating}</p></li>
      <li data-value=${imdbVotes} class="list-group-item primary"><p class="name">IMDb Votes:</p><p class="detail-st">${movieDetails.imdbVotes}</p></li>
    </ul>
  </div>
  `;
}

 async function getData(type, text) {
  const res = await fetch(`https://www.omdbapi.com/?${type}=${text}&apikey=5b10b9a3`);
  if (!res.ok) {
    throw new Error(`Could not fetch ${res.url}, received ${res.status}`);
  }
  return res.json();
};
function deBounce (cb, delay = 1000) {
  let seto;
  return (...args) => {
    if (seto) {
      clearTimeout(seto);
    }
    seto = setTimeout(() => {
      cb.call(null, ...args);
    }, delay);
  };
};
