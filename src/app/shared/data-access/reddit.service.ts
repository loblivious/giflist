import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  catchError,
  combineLatest,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  map,
  scan,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import {
  Gif,
  RedditPagination,
  RedditPost,
  RedditResponse,
} from '../interfaces';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class RedditService {
  #pagination$ = new BehaviorSubject<RedditPagination>({
    after: null,
    totalFound: 0,
    retries: 0,
    infiniteScroll: null,
  });
  private settings$ = this.settingsService.settings$;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  getGifs(subredditFormControl: FormControl): Observable<Gif[]> {
    // Start with a default emission of 'gifs', then only emit when
    // subreddit changes
    const subreddit$ = subredditFormControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith(subredditFormControl.value),
      // Reset pagination values
      tap(() =>
        this.#pagination$.next({
          after: null,
          totalFound: 0,
          retries: 0,
          infiniteScroll: null,
        })
      )
    );

    return combineLatest([subreddit$, this.settings$]).pipe(
      switchMap(([subreddit, settings]) => {
        // Fetch gifs
        const gifsForCurrentPage$ = this.#pagination$.pipe(
          concatMap((pagination) =>
            this.fetchFromReddit(subreddit, settings.sort, pagination.after)
          )
        );

        // Every time we get a new batch of gifs, add it to the cached gifs
        const allGifs$ = gifsForCurrentPage$.pipe(
          scan((previousGifs, currentGifs) => [...previousGifs, ...currentGifs])
        );

        return allGifs$;
      })
    );
  }

  private fetchFromReddit(
    subreddit: string,
    sort: string,
    after: string | null
  ) {
    return this.http
      .get<RedditResponse>(
        `https://www.reddit.com/r/${subreddit}/${sort}/.json?limit=100` +
          (after ? `&after=${after}` : '')
      )
      .pipe(
        // If there is an error, just return an empty observable
        catchError(() => EMPTY),

        // Convert response into the gif format we need
        map((res) => this.convertRedditPostsToGifs(res.data.children))
      );
  }

  private convertRedditPostsToGifs(posts: RedditPost[]): Gif[] {
    return posts
      .map((post) => ({
        src: this.getBestSrcForGif(post),
        author: post.data.author,
        name: post.data.name,
        permalink: post.data.permalink,
        title: post.data.title,
        thumbnail: post.data.thumbnail,
        comments: post.data.num_comments,
        loading: false,
      }))
      .filter((gifs) => gifs.src !== null);
  }

  private getBestSrcForGif(post: RedditPost) {
    // If the source is in .mp4 format, leave unchanged
    if (post.data.url.indexOf('.mp4') > -1) {
      return post.data.url;
    }

    // If the source is in .gifv or .webm formats, convert to .mp4
    if (post.data.url.indexOf('.gifv') > -1) {
      return post.data.url.replace('.gifv', '.mp4');
    }

    if (post.data.url.indexOf('.webm') > -1) {
      return post.data.url.replace('.webm', '.mp4');
    }

    // If the URL is not .gifv or .webm, check if media or secure media is available
    if (post.data.secure_media?.reddit_video) {
      return post.data.secure_media.reddit_video.fallback_url;
    }

    if (post.data.media?.reddit_video) {
      return post.data.media.reddit_video.fallback_url;
    }

    // If media objects are not available, check if a preview is available
    if (post.data.preview?.reddit_video_preview) {
      return post.data.preview.reddit_video_preview.fallback_url;
    }

    return null;
  }

  nextPage(infiniteScrollEvent: Event, after: string) {
    this.#pagination$.next({
      after,
      totalFound: 0,
      retries: 0,
      infiniteScroll:
        infiniteScrollEvent?.target as HTMLIonInfiniteScrollElement,
    });
  }
}
