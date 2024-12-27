export class PredictionDto {
  text: string;
  aspect: string;
  sentiment: string;

  constructor(text?: string, aspect?: string, sentiment?: string) {
    this.text = text;
    this.aspect = aspect;
    this.sentiment = sentiment;
  }
}
