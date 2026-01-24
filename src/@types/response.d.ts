
type ResponseType = 'SUCCESS' | 'FAILURE' | 'SERVER_ERROR' | 'BAD_REQUEST' | 'RECORD_NOT_FOUND' |'VALIDATION_ERROR' | 'UNAUTHORIZED'


interface ResponseData {
    data?: any
    status: Boolean,
    code: ResponseType,
    message?: string,
}
