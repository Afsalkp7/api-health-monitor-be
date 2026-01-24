const responseStatus = require('./responseStatus');

export default {
  success: (data:any = {}) => ({
    status: true,
    code: responseStatus.success,
    message: data.message || 'Your request is successfully executed',
    data: data.data || null,
  }),

  failure: (data:any = {}) => ({
    status: false,
    code: responseStatus.failure,
    message: data.message || 'Some error occurred while performing action.',
    data: data.data || null,
  }),

  internalServerError: (data:any = {}) => ({
    status: false,
    code: responseStatus.serverError,
    message: data.message || 'Internal server error.',
    data: data.data || null,
  }),

  badRequest: (data:any = {}) => ({
    status: false,
    code: responseStatus.badRequest,
    message: data.message || 'Request parameters are invalid or missing.',
    data: data.data || null,
  }),

  recordNotFound: (data:any = {}) => ({
    status: false,
    code: responseStatus.recordNotFound,
    message: data.message || 'Record(s) not found with specified criteria.',
    data: data.data,
  }),

  validationError: (data:any = {}) => ({
    status: false,
    code: responseStatus.validationError,
    message: data.message || 'Invalid Data, Validation Failed.',
    data: data.data || null,
  }),

  unAuthorized: (data:any = {}) => ({
    status: false,
    code: responseStatus.unauthorized,
    message: data.message || 'You are not authorized to access the request',
    data: data.data || null,
  }),

  serverError: (data:any = {}) => ({ data: data.data }),
  notFound: (data:any = {}) => ({ data: data.data }),
};

