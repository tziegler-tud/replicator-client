export default class ApiResponse {
    constructor(response){
        this.status = response.status;
        this.result = response;
    }

    static apiStatus = {
        OK: 200,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        ERROR: 500,
    }

    /**
     * tcp response protocol prototype:
     * response codes:
     * 200: OK
     * 500: Error
     *
     * Error codes:
     * 1-10 connection errors:
     *  1: connection failed
     *
     *
     * 11-20 argument errors:
     *  11: missing required argument
     *  12: wrong argument type
     *  13: invalid clientId
     *
     * 21-30 client registration related errors:
     *  21: not registered
     *  22: registration invalid
     *  23: registration expired
     *  24: registration incomplete
     *  25: already registered
     *  26: registration not allowed
     */

    static apiResponse = {
        CONNECTION: {
            SUCCESSFULL: {
                status: this.apiStatus.OK,
                code: 0,
                message: "Connection successful"
            },
            FAIL: {
                status: this.apiStatus.ERROR,
                code: 1,
                message: "Connection failed"
            },
        },
        ARGUMENTS: {
            MISSING: {
                status: this.apiStatus.ERROR,
                code: 11,
                message: "Arguments missing",
            },
            TYPEMISSMATCH: {
                status: this.apiStatus.ERROR,
                code: 12,
                message: "Arguments type missmatch",
            },
            INVALIDCLIENTID: {
                status: this.apiStatus.ERROR,
                code: 13,
                message: "ClientId does not match connection authorization",
            }

        },
        REGISTRATION: {
            SUCCESSFULL: {
                status: this.apiStatus.OK,
                code: 0,
                message: "Registration Successfull"
            },
            NOTREGISTERED: {
                status: this.apiStatus.UNAUTHORIZED,
                code: 21,
                message: "Not registered",
            },
            INVALID: {
                status: this.apiStatus.ERROR,
                code: 22,
                message: "Registeration invalid",
            },
            EXPIRED: {
                status: this.apiStatus.UNAUTHORIZED,
                code: 23,
                message: "Registeration expired",
            },
            INCOMPLETE: {
                status: this.apiStatus.ERROR,
                code: 24,
                message: "Registeration incomplete",
            },
            ALREADYREGISTERED: {
                status: this.apiStatus.OK,
                code: 25,
                message: "Client already registered.",
            },
            NOTALLOWED: {
                status: this.apiStatus.ERROR,
                code: 26,
                message: "Registration not allowed.",
            },
            RENEWED: {
                status: this.apiStatus.OK,
                code: 27,
                message: "Registration renewed",
            },
            FAILED: {
                status: this.apiStatus.ERROR,
                code: 28,
                message: "Registration failed.",
            }
        }
    }
}