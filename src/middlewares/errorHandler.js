import { constants } from "../config/constants.js";

export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode || 500;

    const errorResponse = {
        title: "",
        message: err.message,
        stackTrace: err.stack,
    };

    switch (statusCode) {
        case constants.VALIDATION_ERROR:
            errorResponse.title = "Validation Failed!";
            break;

        case constants.NOT_FOUND:
            errorResponse.title = "Not Found!";
            break;

        case constants.UNAUTHORIZED:
            errorResponse.title = "Unauthorized!";
            break;

        case constants.FORBIDDEN:
            errorResponse.title = "Forbidden!!!";
            break;

        case constants.SERVER_ERROR:
            errorResponse.title = "Server Error!";
            break;

        default:
            console.log('NO ERROR FOUND!!!');
            break;
    }

    return res.json(errorResponse);
};
