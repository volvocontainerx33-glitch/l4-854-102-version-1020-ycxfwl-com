(function () {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var movies = window.SEARCH_MOVIES || [];

  if (!input || !results) {
    return;
  }

  function getQuery() {
    return new URLSearchParams(window.location.search).get('q') || '';
  }

  function render(query) {
    var key = query.trim().toLowerCase();
    if (!key) {
      results.innerHTML = '<p class="card-meta">输入关键词后即可查看匹配影片。</p>';
      return;
    }

    var matched = movies.filter(function (movie) {
      var text = [
        movie.title,
        movie.region,
        movie.year,
        movie.type,
        movie.genre,
        movie.tags,
        movie.desc
      ].join(' ').toLowerCase();
      return text.indexOf(key) > -1;
    }).slice(0, 120);

    if (!matched.length) {
      results.innerHTML = '<p class="card-meta">没有找到匹配影片，可以换一个关键词。</p>';
      return;
    }

    results.innerHTML = matched.map(function (movie) {
      return [
        '<a class="search-result-item" href="./' + movie.url + '">',
        '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">',
        '<span>',
        '<strong>' + movie.title + '</strong>',
        '<p>' + movie.year + ' · ' + movie.region + ' · ' + movie.genre + '</p>',
        '<p>' + movie.desc + '</p>',
        '</span>',
        '</a>'
      ].join('');
    }).join('');
  }

  var initial = getQuery();
  input.value = initial;
  render(initial);

  input.addEventListener('input', function () {
    render(input.value);
  });
})();
