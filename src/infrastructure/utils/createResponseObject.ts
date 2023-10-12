export interface ResponseObject {
  status: number;
  message: any;
}

export const createResponseObject = (
  statusCode: number,
  message: any,
): ResponseObject => {
  return {
    status: statusCode,
    message: message,
  };
};
