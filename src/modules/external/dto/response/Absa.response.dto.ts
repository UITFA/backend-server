export class PredictionDto {
  FACILITY: string | null;
  MATERIAL: string | null;
  OTHERS: string | null;
  PROFESSIONALISM: string | null;
}

export class PredictResponseDto {
  feedback: string;
  prediction: PredictionDto;
}
