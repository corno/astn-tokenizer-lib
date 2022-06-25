import { TokenError } from "./TokenError"

export type Tokenizer2Error =
| ["unexpected start of token", {}]
| ["unexpected, parser is already in 'none' mode", {}]
| ["Unexpected block comment end", {}]
| ["Unexpected line comment end", {}]
| ["Unexpected nonwrapped string end", {}]
| ["Unexpected whitespace end", {}]

export type TokenizerError =
| ["pre", TokenError]
| ["tokenizer", Tokenizer2Error]