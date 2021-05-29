import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { environment as env } from '../../environments/environment';

export interface TranslatedResponseDTO {
  TranslatedText: string;
  From: string;
}

export interface LanguageDTO {
  Language: string;
  Code: string;
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  targetLanguages: LanguageDTO[] = [
    {
      Language: 'English',
      Code: 'en'
    },
    {
      Language: 'Afrikaans',
      Code: 'af'
    },
    {
      Language: 'French',
      Code: 'fr'
    },
    {
      Language: 'Igbo',
      Code: 'ig'
    },
    {
      Language: 'Italian',
      Code: 'it'
    },
    {
      Language: 'Hausa',
      Code: 'ha'
    },
    {
      Language: 'German',
      Code: 'de'
    },
    {
      Language: 'Russian',
      Code: 'ru'
    },
    {
      Language: 'Spanish',
      Code: 'es'
    },
    {
      Language: 'Swedish',
      Code: 'sv'
    }
  ];

  constructor(private readonly httpSrv: HttpClient) { }

  translateText(rawText: string, targetLanguage: string)
    : Observable<TranslatedResponseDTO> {
      return this.httpSrv
                  .get<TranslatedResponseDTO>(`${env.apiRoot}/translate-text?targetLanguage=${targetLanguage}&rawText=${rawText}`)
                  .pipe(
                    retry(3)
                  );
    }
}
