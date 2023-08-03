import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Gif } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class RedditService {
  getGifs(): Observable<Gif[]> {
    return of([
      {
        src: '',
        author: '',
        name: '',
        permalink: '',
        title: '',
        thumbnail: '',
        comments: 0,
      },
    ]);
  }
}
