import type { Express } from "express";
export interface Server {
    app: Express;
    port: number;
    name: string;
    subdomain: string;
}
export declare function getServers(): Server[];
