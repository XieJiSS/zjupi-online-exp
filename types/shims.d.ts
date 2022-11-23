declare module "express-session" {
  interface SessionData {
    username: string | null;
  }
}

export {};
