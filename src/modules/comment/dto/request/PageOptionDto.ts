import { OrderBy } from '../../../../common/constants/order';

export class PageOptionsDto {
  readonly order: OrderBy = OrderBy.ASC;

  readonly page: number = 1;

  readonly take: number = 100;

  get skip(): number {
    return (this.page - 1) * this.take;
  }

  readonly size: number = 100;

  readonly q?: string;
}
