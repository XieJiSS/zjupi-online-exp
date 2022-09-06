export const app: import("express-serve-static-core").Express;
import { port } from "./config";
import { name as serverName } from "./config";
import { subdomain } from "./config";
export { port, serverName as name, subdomain };
