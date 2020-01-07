import { Logger } from "./Logger";
import { LogGroupRule } from "./LogGroupRule";
import { LogFormat, LoggerType, LogLevel } from "../LoggerOptions";
import { LogMessage } from "./AbstractLogger";
/**
 * Represents the runtime settings for a LogGroup (LogGroupRule).
 */
export declare class LogGroupRuntimeSettings {
    private _logGroupRule;
    private _level;
    private _loggerType;
    private _logFormat;
    private _callBackLogger;
    private _formatterLogMessage;
    constructor(logGroupRule: LogGroupRule);
    /**
     * Returns original LogGroupRule (so not runtime settings!)
     * @return {LogGroupRule}
     */
    readonly logGroupRule: LogGroupRule;
    level: LogLevel;
    loggerType: LoggerType;
    logFormat: LogFormat;
    callBackLogger: ((name: string, settings: LogGroupRuntimeSettings) => Logger) | null;
    formatterLogMessage: ((message: LogMessage) => string) | null;
}
