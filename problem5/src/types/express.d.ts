declare global {
  namespace Express {
    interface Request {
      /** Set by the request-id middleware. */
      id: string;
    }
  }
}

export {};
