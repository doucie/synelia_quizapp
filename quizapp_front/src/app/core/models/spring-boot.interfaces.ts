export interface SpringBootRequest<T> {
  data: T;
  sessionUser?: string | null;
  size?: number | null;
  index?: number | null;
  lang?: string;
  businessLineCode?: string | null;
  caseEngine?: string | null;
  isAnd?: boolean | null;
  user?: number | null;
  isSimpleLoading?: boolean;
}

export interface SpringBootResponse<T> {
  items?: T[];
  hasError: boolean;
  status: {
    code: string;
    message: string;
  };
  httpCode?: number;
}

export interface UserApiData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userRole?: string;
}
