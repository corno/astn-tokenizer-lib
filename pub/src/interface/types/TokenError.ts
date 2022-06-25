
export type TokenError = {
    readonly "type":
    | ["unterminated block comment", {}]
    | ["found dangling slash at the end of the text", {}]
    | ["unterminated string", {}]
    | ["found dangling slash", {}]
    | ["expected hexadecimal digit", {
        readonly "found": string
    }]
    | ["expected special character after escape slash", {
        readonly "found": string
    }]
}