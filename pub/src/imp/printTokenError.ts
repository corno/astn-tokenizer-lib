import * as pr from "pareto-runtime"

import * as astn from "../interface"

export function printTokenError($: astn.TokenError): string {

    switch ($.type[0]) {
        case "expected hexadecimal digit": {
            const $$ = $.type[1]
            return `expected hexadecimal digit: 0-9, A-F or a-f, but found ${$$.found}`
        }
        case "expected special character after escape slash": {
            const $$ = $.type[1]
            return `expected special character after escape slash, but found ${$$.found}`
        }
        case "found dangling slash": {
            return `found dangling slash`
        }
        case "found dangling slash at the end of the text": {
            return `found dangling slash at the end of the text`
        }
        case "unterminated block comment": {
            return `unterminated block comment`
        }
        case "unterminated string": {
            return `unterminated string`
        }
        default:
            return pr.au($.type[0])
    }
}
