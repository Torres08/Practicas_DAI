// ./logger.js
import { createLogger, format, transports } from 'winston';

// filtros
const errorFilter = format((info, opts) => {
    return info.level === 'error' ? info : false;
  });
  
  const infoFilter = format((info, opts) => {
    return info.level === 'info' ? info : false;
});


const logger = createLogger({
  level: 'info',
  
  // formato del mensaje con fecha
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),

  
  defaultMeta: { service: 'admin-service' },

  // seleccionar error y combined
  transports: [
    new transports.File({ filename: 'error.log', level: 'error', format: errorFilter() }),
    new transports.File({ filename: 'info.log', format: infoFilter() })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

export default logger;