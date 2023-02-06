// Interfaces
export interface ISignupToken {
  number: string;
  iat?: number;
  exp?: number;
}

// Helpers
export const isSignupToken = (token: any): token is ISignupToken => {
  const unsafeCast = token as ISignupToken;

  return (
    unsafeCast.number !== undefined &&
    unsafeCast.iat !== undefined &&
    unsafeCast.exp !== undefined
  );
};
