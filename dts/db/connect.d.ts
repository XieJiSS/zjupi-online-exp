/** @format */
import { Sequelize } from "sequelize";
export declare function gracefullyCloseDatabaseConnection(): Promise<void>;
export declare const _promise: Promise<Sequelize>;
export declare function hasAuthed(): boolean;
export declare function getGlobalSequelizeInstance(): Sequelize | null;
