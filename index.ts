import './style.css';

import {
  fromEvent,
  map,
  from,
  debounceTime,
  mergeMap,
  tap,
  partition,
  Subject,
  publish
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
  retry,
  share,
  switchMap
} from 'rxjs/operators';

const subject = new Subject();

const keyup$ = fromEvent(document.getElementById('search'), 'keyup').pipe(
  debounceTime(1000),
  map((event: KeyboardEvent) => (event.target as HTMLInputElement).value),
  distinctUntilChanged(),
  share()
);

// let [user$, reset$] = keyup$.pipe(partition(() => true));
let [user$, reset$] = partition(keyup$, value => {
  return value.trim().length > 0;
});

user$ = user$.pipe(
  tap(showLoading),
  switchMap(query =>
    from(
      fetch(`https://api.github.com/search/users?q=${query}`).then(res =>
        res.json()
      )
    )
  ),
  tap(hideLoading),
  retry(2),
  finalize(hideLoading)
);

reset$ = reset$.pipe(tap(v => ($layer.innerHTML = '')));

const $layer = document.querySelector('#suggestLayer');

user$.subscribe(value => {
  drawLayer(value.items);
});

reset$.subscribe();

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

const $loading = document.getElementById('loading');

function showLoading() {
  $loading.style.display = 'block';
}

function hideLoading() {
  $loading.style.display = 'none';
}

keyup$.connect();
