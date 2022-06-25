import { PreToken } from "./PreToken"

export type TokenReturnType = {
    startSnippet: boolean
    consumeCharacter: boolean
    preToken: null | PreToken
}
export type ILoopState = {
    ensureFlushed(callback: () => TokenReturnType): TokenReturnType
    whileLoop(
        callback: (
            nextChar: number,
        ) => TokenReturnType,
    ): PreToken | null
}
export type IPreTokenizer = {
    handleDanglingToken(): PreToken | null
    createNextToken(loopState: ILoopState): null | PreToken
}