import * as inf from "../interface"

export function printTokenizer2Error(error: inf.Tokenizer2Error): string {
    return error[0]
}