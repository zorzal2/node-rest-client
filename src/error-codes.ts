import Common from '@zorzal2/common';

export const ErrorCodes = Common.code.complete({
  invalidEndpoint: {
    message: 'La URL del endpoint no es válida.'
  },
  badRequest: {
    objectRequired: {
      message: 'Esta operación requiere un argumento de tipo objeto.'
    },
    message: 'El servidor reportó un error en la request.'
  },
  forbidden: {
    message: 'No está autorizado para realizar esta operación.'
  },
  unauthorized: {
    message: 'Se requiere autenticación para realizar la operación.'
  },
  notFound: {
    message: 'No se encontró el objeto.'
  },
  methodNotAllowed: {
    message: 'No se permite realizar esa operación.'
  },
  internal: {
    message: 'Error interno del servidor.'
  },
  requestError: {
    message: 'No se pudo realizar la operación.'
  },
  responseError: {
    noBody: {
      message: 'La respuesta no tiene body.'
    },
    noId: {
      message: 'Esta operación esperaba un id pero no fue recibido.'
    },
    message: 'La respuesta recibida no es correcta.'
  }
});
