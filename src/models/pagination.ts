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

export interface ISearchParameterUser extends ISearchParameterBase {
  name: string | null;
  email: string | null;
  profileType: string[] | null;
}

export interface ISearchParameterEvent extends ISearchParameterBase {
  name: string | null;
  promoter: string | null;
}