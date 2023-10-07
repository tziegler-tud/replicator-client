class tcpResponseGenerator {
    constructor(){
        return this;
    }

    tcpStatus = {
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
     *
     *  31-40 command errors
     *   31: invalid command
     *   32: invalid arguments received
     *   33: Internal error
     */

    tpcResponse = {
        CONNECTION: {
            SUCCESSFULL: {
                status: this.tcpStatus.OK,
                code: 0,
                message: "Connection successful"
            },
            FAIL: {
                status: this.tcpStatus.ERROR,
                code: 1,
                message: "Connection failed"
            },
        },
        ARGUMENTS: {
            MISSING: {
                status: this.tcpStatus.ERROR,
                code: 11,
                message: "Arguments missing",
            },
            TYPEMISSMATCH: {
                status: this.tcpStatus.ERROR,
                code: 12,
                message: "Arguments type missmatch",
            },
            INVALIDCLIENTID: {
                status: this.tcpStatus.ERROR,
                code: 13,
                message: "ClientId does not match connection authorization",
            }

        },
        REGISTRATION: {
            SUCCESSFULL: {
                status: this.tcpStatus.OK,
                code: 0,
                message: "Registration Successfull"
            },
            NOTREGISTERED: {
                status: this.tcpStatus.UNAUTHORIZED,
                code: 21,
                message: "Not registered",
            },
            INVALID: {
                status: this.tcpStatus.ERROR,
                code: 22,
                message: "Registeration invalid",
            },
            EXPIRED: {
                status: this.tcpStatus.UNAUTHORIZED,
                code: 23,
                message: "Registeration expired",
            },
            INCOMPLETE: {
                status: this.tcpStatus.ERROR,
                code: 24,
                message: "Registeration incomplete",
            },
            ALREADYREGISTERED: {
                status: this.tcpStatus.ERROR,
                code: 25,
                message: "Client already registered.",
            },
            NOTALLOWED: {
                status: this.tcpStatus.ERROR,
                code: 26,
                message: "Registration not allowed.",
            }
        },
        COMMAND: {
            SUCCESSFULL: {
                status: this.tcpStatus.OK,
                code: 0,
                message: "Command execution successfull."
            },
            INVALID: {
                status: this.tcpStatus.UNAUTHORIZED,
                code: 21,
                message: "Invalid command received.",
            },
            INVALID_ARGUMENT: {
                status: this.tcpStatus.ERROR,
                code: 22,
                message: "Invalid argument received.",
            },
            INTERNAL_ERROR: {
                status: this.tcpStatus.UNAUTHORIZED,
                code: 23,
                message: "Internal error while executing command.",
            },
            NOTALLOWED: {
                status: this.tcpStatus.ERROR,
                code: 26,
                message: "Command not allowed.",
            }
        }
    }
}

export default new tcpResponseGenerator();