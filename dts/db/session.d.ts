/// <reference types="express" />
import type { Store } from "express-session";
export declare function getSequelizeSessionStore(sessionStore: typeof Store): {
    sync(options?: import("sequelize/types").SyncOptions): void;
    touch: (sid: string, data: any, callback?: (err: any) => void) => void;
    stopExpiringSessions: () => void;
    get(sid: string, callback: (err: any, session?: import("express-session").SessionData) => void): void;
    set(sid: string, session: import("express-session").SessionData, callback?: (err?: any) => void): void;
    destroy(sid: string, callback?: (err?: any) => void): void;
    regenerate(req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, callback: (err?: any) => any): void;
    load(sid: string, callback: (err: any, session?: import("express-session").SessionData) => any): void;
    createSession(req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, session: import("express-session").SessionData): import("express-session").Session & import("express-session").SessionData;
    all?(callback: (err: any, obj?: {
        [sid: string]: import("express-session").SessionData;
    } | import("express-session").SessionData[]) => void): void;
    length?(callback: (err: any, length: number) => void): void;
    clear?(callback?: (err?: any) => void): void;
    addListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
    on(eventName: string | symbol, listener: (...args: any[]) => void): any;
    once(eventName: string | symbol, listener: (...args: any[]) => void): any;
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
    off(eventName: string | symbol, listener: (...args: any[]) => void): any;
    removeAllListeners(event?: string | symbol): any;
    setMaxListeners(n: number): any;
    getMaxListeners(): number;
    listeners(eventName: string | symbol): Function[];
    rawListeners(eventName: string | symbol): Function[];
    emit(eventName: string | symbol, ...args: any[]): boolean;
    listenerCount(eventName: string | symbol): number;
    prependListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
    prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
    eventNames(): (string | symbol)[];
};
