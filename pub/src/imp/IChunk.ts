
export type IChunk = {
    lookahead(): number | null
    getCurrentIndex(): number
    getString(): string
    increaseIndex(): void
}