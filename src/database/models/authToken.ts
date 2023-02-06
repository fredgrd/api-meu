// Interface
export interface IAuthToken {
  id: string;
  number: string;
  iat?: number;
  exp?: number;
}

// Helpers
export const isAuthToken = (token: any): token is IAuthToken => {
  const unsafeCast = token as IAuthToken;

  return (
    unsafeCast.id !== undefined &&
    unsafeCast.number !== undefined &&
    unsafeCast.iat !== undefined &&
    unsafeCast.exp !== undefined
  );
};
