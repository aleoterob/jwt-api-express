// Este archivo define el helper "asyncHandler".
// Su propósito es manejar los errores de las funciones asíncronas en los controladores de Express, evitando el uso de múltiples bloques try/catch.
// Si ocurre un error dentro de una función asíncrona controlada por asyncHandler, el error será pasado automáticamente al middleware de manejo de errores global (definido en 'middleware/error.middleware.ts').
// Este helper se utiliza comúnmente para envolver rutas o controladores asíncronos, por ejemplo en los archivos de controllers (como user.controller.ts), asegurando que cualquier excepción sea capturada y no cause cuelgues silenciosos en el servidor.

import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Exporta una función que recibe un controlador asíncrono y retorna una función que maneja su ejecución.
// Si la función rechaza (lanza un error), este será capturado y enviado al next() para llegar al middleware de errores.
export function asyncHandler(fn: AsyncFunction) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
