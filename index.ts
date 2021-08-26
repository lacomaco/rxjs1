import './style.css';

import { fromEvent, map, from, debounceTime, mergeMap } from 'rxjs';
import { catchError, distinctUntilChanged, filter } from 'rxjs/operators';
const keyup$ = fromEvent(document.getElementById('search'), 'keyup').pipe(
  debounceTime(1000),
  map((event: KeyboardEvent) => (event.target as HTMLInputElement).value),
  distinctUntilChanged(),
  filter(query => query.trim().length > 0),
  mergeMap(query =>
    from(
      fetch(`https://api.github.com/search/users?q=${query}`).then(res =>
        res.json()
      )
    )
  )
);

keyup$.subscribe(value => {
  drawLayer(value.items);
});

const $layer = document.querySelector('#suggestLayer');

function drawLayer(items) {
  $layer.innerHTML = items
    .map(user => {
      return `<li class="user">
      <img src="${user.avatar_url}" width="50px" height="50px"/>
      <p>
        <a href="${user.html_url}" target="_blank">${user.login}</a>
      </p>
    </li>`;
    })
    .join('');
}
