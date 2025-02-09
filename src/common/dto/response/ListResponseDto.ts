export class ListResponseDto<T> {
  total = 0;

  limit? = 0;

  offset? = 0;

  items: T[] = [];

  constructor(items: T[], total: number, limit?: number, offset?: number) {
    this.items = items || [];
    this.total = total;
    this.limit = limit;
    this.offset = offset;
  }
}
