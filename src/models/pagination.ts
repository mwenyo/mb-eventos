export type Pagination<T> = {
  rows: Array<T>,
  count: number,
};

export interface ISearchParameterBase {
  offset: number;
  orderBy: string;
  isDESC: boolean;
  limit: number;
}