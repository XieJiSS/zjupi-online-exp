/** @format */
export type CameraDirection = "left" | "right" | "up" | "down";
export type CameraOperation = "start" | "stop";
export type CameraClientOperationReqBody = {
    direction: CameraDirection;
    operation: "start";
    speed: number;
} | {
    direction: void;
    operation: "stop";
    speed: number;
};
export declare function pingCameraIP(cameraIP: string): Promise<boolean>;
/**
 * @throws {TypeError} if direction is not string or void when operation is "start" or "stop", respectively
 */
export declare function sendOpToCameraIP<T extends CameraOperation>(cameraIP: string, direction: T extends "start" ? CameraDirection : T extends "stop" ? void : never, operation: T, speed?: number): Promise<boolean>;
