export type LogContext = Record<string, unknown>

function write(level: 'info' | 'warn' | 'error', event: string, context: LogContext = {}) {
  if (process.env.NODE_ENV === 'test') {
    return
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...context,
  }

  if (level === 'error') {
    console.error(JSON.stringify(payload))
    return
  }

  console.log(JSON.stringify(payload))
}

export const logger = {
  info(event: string, context?: LogContext) {
    write('info', event, context)
  },
  warn(event: string, context?: LogContext) {
    write('warn', event, context)
  },
  error(event: string, context?: LogContext) {
    write('error', event, context)
  },
}
