export = servers;
/**
 * @type {{ app: import("express").Express, port: number, name: string, subdomain: string }[]}
 */
declare const servers: {
    app: import("express").Express;
    port: number;
    name: string;
    subdomain: string;
}[];
