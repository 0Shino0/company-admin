/**
 * 日志存储
 * @author yyshino
 */
const log4js = require('log4js');

const levels = {
    'trace': log4js.levels.TRACE,
    'debug': log4js.levels.DEBUG,
    'info': log4js.levels.INFO,
    'warn': log4js.levels.WARN,
    'error': log4js.levels.ERROR,
    'fatal': log4js.levels.FATAL
}

log4js.configure({
    appenders:{
        console:{ type:'console' },
        // 将信息发送到 文件中
        info: {
            type: 'file',
            filename: "logs/all-the-logs.log"
        },
        error: {
            type: 'dateFile',
            filename: "logs/log",
            pattern: 'yyy-MM-dd.log',
            alwaysIncludePattern: true // 设置文件名称为 fielname + pattern
        },
    },
    categories:{
        default: { appenders: [ 'console' ], level: 'debug' },
        info:{
            appenders: [ 'info','console' ],
            level: 'info'
        },
        error:{
            appenders: [ 'error','console' ],
            level: 'error'
        }
    }
})

/**
 * 日志输出 error
 * @param {string} content
 */
exports.error = (content) => {
    let logger = log4js.getLogger('error');
    logger.level = levels.error;
    logger.error(content);
}

/**
 * 日志输出 info
 * @param {string} content
 */
exports.info = (content) => {
    let logger = log4js.getLogger('info');
    logger.level = levels.info;
    logger.info(content);
}


/**
 * 日志输出 debug
 * @param {string} content
 */
exports.debug = (content) => {
    let logger = log4js.getLogger();
    logger.level = levels.debug;
    logger.debug(content);
}
