import { Component, OnDestroy } from '@angular/core';
import * as Tesseract from 'tesseract.js';
import { createWorker } from 'tesseract.js';
import { 
  Camera, 
  CameraResultType, 
  CameraSource 
} from '@capacitor/camera';
import { Clipboard } from '@capacitor/clipboard';
import { LanguageDTO, SharedService } from '../services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements 
OnDestroy {
  tessaractWorker: Tesseract.Worker;
  workerReady: boolean = false;
  imageUrl: string;
  // imageUrl: string = './assets/images/eng_bw.png';
  ocrResult: string;
  captureProgress = 0;
  cameraSource = CameraSource;
  isModalOpen = false;
  subscription: Subscription;
  translatedText: string;

  constructor(
    private readonly sharedSrv: SharedService,
  ) {
    this.loadWorker();
  }

  // ngOnInit():void {
  //   setTimeout(async () => {
  //     await this.recognizeImage();
  //   }, 3000)
  // }
  

  private async loadWorker(): Promise<void> {
    this.tessaractWorker = createWorker({
      logger: (progress) => {
        if (progress.status === 'recognizing text') {
          this.captureProgress = parseInt(`${progress.progress * 100}`);
        }
      }
    });
    await this.tessaractWorker.load();
    await this.tessaractWorker.loadLanguage('eng');
    await this.tessaractWorker.initialize('eng');
    this.workerReady = true;
  }

  toggleModal(): void {
    this.isModalOpen = !this.isModalOpen;
  }

  async captureImage(source: CameraSource): Promise<void> {
    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source,
    });
    if (image?.dataUrl) {
      this.imageUrl = image.dataUrl;
      await this.recognizeImage();
    }
  }

  async recognizeImage(): Promise<void> {
    const result = await this.tessaractWorker.recognize(this.imageUrl);
    console.log({ result });
    this.ocrResult = result.data.text;
  }

  copyToClipBoard(textInputEl: HTMLTextAreaElement): void {
    Clipboard.write({
      string: textInputEl.value
    });
    textInputEl.select();
  }

  copyTranslationToClipBoard(textEl: HTMLParagraphElement): void {
    Clipboard.write({
      string: textEl.innerText
    });
    textEl.classList.add('content-highlighted');
  }

  resetTemplate(): void {
    this.ocrResult = '';
    this.imageUrl = '';
    this.workerReady = false;
    this.captureProgress = 0;
  }

  translate(targetLanguage: string): void {
    if (this.ocrResult) {
      this.subscription =
      this.sharedSrv
          .translateText(this.ocrResult, targetLanguage)
          .subscribe(
            ({ TranslatedText }) => {
              this.translatedText = TranslatedText;
            },
            (error) => {
              console.error(error);
              this.translatedText = 'Translation Failed';
            }
          );
    }
  }

  getSupportedLanguages(): LanguageDTO[] {
    return this.sharedSrv.targetLanguages;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
