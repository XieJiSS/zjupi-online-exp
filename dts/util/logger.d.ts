/** @format */
import log4js from "log4js";
interface CustomLogger extends log4js.Logger {
    warn: (message: any, ...args: any[]) => void | Promise<void>;
    error: (message: any, ...args: any[]) => void | Promise<void>;
}
export default function getLogger(name: string): CustomLogger;
export {};
