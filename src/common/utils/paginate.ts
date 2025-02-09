import { FindManyOptions, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationArgs } from '../args/pagination.arg';
import { PaginatedMetaData } from '../dto/PaginatedMeta';
import { FilterArgs } from '../args/filter.arg';

type PaginatedData<T> = Promise<{ data: T[]; meta: PaginatedMetaData }>;

export async function paginate<T>(
  repo: Repository<T>,
  paginationOptions: PaginationArgs,
  options: FindManyOptions<T>,
): PaginatedData<T> {
  paginationOptions.page = paginationOptions.page ?? 0;
  paginationOptions.size = paginationOptions.size ?? 10;

  const skip = paginationOptions.page * paginationOptions.size;
  if (isNaN(skip) || skip < 0) {
    throw new Error(
      '"skip" value must be a valid number greater than or equal to 0.',
    );
  }

  const [data, count] = await repo.findAndCount({
    take: paginationOptions.size,
    skip: paginationOptions.page * paginationOptions.size,
    ...options,
  });

  return { data, meta: new PaginatedMetaData(paginationOptions, count) };
}

export async function paginateByQuery<T>(
  query: SelectQueryBuilder<T>,
  paginationOptions: PaginationArgs,
  filter: FilterArgs,
  options?: FindManyOptions<T> & { isRaw?: boolean },
): PaginatedData<T> {
  paginationOptions.page = paginationOptions.page ?? 0;
  // paginationOptions.size = paginationOptions.size ?? 900000000;

  // const skip = paginationOptions.page * paginationOptions.size;
  // if (isNaN(skip) || skip < 0) {
  //   throw new Error(
  //     '"skip" value must be a valid number greater than or equal to 0.',
  //   );
  // }
  let querySql;
  if (paginationOptions.size)
    querySql = query
      // .setFindOptions(options)
      .setParameters(filter)
      .take(paginationOptions.size)
      .skip(paginationOptions.page * paginationOptions.size);
  else
    querySql = query
      // .setFindOptions(options)
      .setParameters(filter)
      .take(paginationOptions.size);

  console.log({ sql: querySql.getSql() });

  if (!options.isRaw) {
    const [data, count] = await querySql.getManyAndCount();
    return { data, meta: new PaginatedMetaData(paginationOptions, count) };
  } else {
    const count = (await querySql.getRawMany()).length;
    const data = await querySql
      .take(paginationOptions.size)
      .skip(paginationOptions.page * paginationOptions.size)
      .getRawMany();
    return { data, meta: new PaginatedMetaData(paginationOptions, count) };
  }
}
