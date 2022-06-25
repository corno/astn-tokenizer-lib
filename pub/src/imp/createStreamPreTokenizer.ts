/* eslint
    complexity:"off",
    no-console:"off",
*/

import * as pr from "pareto-runtime"

import * as tokenLevel from "../interface"

import { TokenizerOptions } from "../interface"
import { IChunk } from "./IChunk"
import { ILocationState } from "./ILocationState"
import { createPreTokenizer } from "./createPreTokenizer"
import { ILoopState, TokenReturnType } from "./IPreTokenizer"
import { PreToken } from "./PreToken"

const Whitespace = {
    tab: 0x09,               // \t
    lineFeed: 0x0A,          // \n
    carriageReturn: 0x0D,    // \r
    space: 0x20,             //
}

/**
 *
 * @param tokenStreamConsumer
 * @param onError
 * @param opt
 */
export function createStreamPreTokenizer(
    tokenStreamConsumer: tokenLevel.IPreTokenStreamConsumer,
    onError: ($: {
        error: tokenLevel.TokenError
        range: tokenLevel.Range
    }) => void,
    opt?: TokenizerOptions
): pr.IStreamConsumer<string, null> {

    const location = {
        position: -1,
        column: 0,
        line: 1,
    }
    const spacesPerTab: number = opt === undefined
        ? 4
        : opt.spaces_per_tab === undefined
            ? 4
            : opt.spaces_per_tab

    const locationState: ILocationState = {
        getCurrentLocation: () => {
            return {
                position: location.position + 1,
                line: location.line,
                column: location.column + 1,
            }
        },
        getNextLocation: () => {
            return {
                position: location.position + 2,
                line: location.line,
                column: location.column + 2,
            }
        },
        increase: (character) => {
            location.position++
            //set the position
            switch (character) {
                case Whitespace.lineFeed:
                    location.line++
                    location.column = 0
                    break
                case Whitespace.carriageReturn:
                    break
                case Whitespace.tab:
                    location.column += spacesPerTab
                    break
                default:
                    location.column++
            }
        },
    }
    const tokenizerState = createPreTokenizer(locationState, onError)

    return {
        onData: (chunk) => {
            let currentIndex = 0
            const str = chunk
            const currentChunk = {
                lookahead: () => {
                    const char = str.charCodeAt(currentIndex)
                    return isNaN(char) ? null : char
                },
                increaseIndex: () => {
                    currentIndex += 1
                },
                getCurrentIndex: () => {
                    return currentIndex
                },
                getString: () => {
                    return str
                },
            }
            while (true) {
                const la = currentChunk.lookahead()
                if (la === null) {
                    return
                }

                function createLoopState(
                    chunk2: IChunk,
                ): ILoopState {
                    let startIndex: null | number = null

                    function ensureFlushed(callback: () => TokenReturnType): TokenReturnType {
                        if (startIndex !== null) {
                            return {
                                startSnippet: false,
                                consumeCharacter: false,
                                preToken: {
                                    type: ["snippet", {
                                        chunk: chunk2.getString(),
                                        begin: startIndex,
                                        end: chunk2.getCurrentIndex(),
                                    }],
                                },
                            }
                        }
                        return callback()
                    }

                    return {
                        /**
                         * if not flushed, the callback is not called.
                         * the current character position should not change so that the next round
                         * the same call will be made, but now it is flushed, so the callback will be called
                         */
                        ensureFlushed: (callback: () => TokenReturnType) => {
                            return ensureFlushed(callback)
                        },
                        whileLoop: (
                            callback: (
                                nextChar: number,
                            ) => TokenReturnType
                        ): PreToken | null => {
                            function whileLoop<RT>(
                                callback2: () => undefined | RT,
                            ): RT {
                                while (true) {
                                    const returnValue = callback2()
                                    if (returnValue !== undefined) {
                                        return returnValue
                                    }
                                }
                            }
                            return whileLoop(
                                () => {
                                    const nextChar = chunk2.lookahead()
                                    if (nextChar === null) {
                                        return ensureFlushed(() => {
                                            return {
                                                startSnippet: false,
                                                consumeCharacter: false,
                                                preToken: null,
                                            }
                                        }).preToken
                                    }
                                    const result = callback(nextChar)
                                    if (result.startSnippet) {
                                        if (startIndex === null) {
                                            startIndex = chunk2.getCurrentIndex()
                                        }
                                    }
                                    if (result.consumeCharacter) {
                                        const cc = chunk2.lookahead()
                                        if (cc === null) {
                                            throw new Error("Unexpected consume")
                                        }
                                        locationState.increase(cc)
                                        chunk2.increaseIndex()
                                    }
                                    if (result.preToken !== null) {
                                        return result.preToken
                                    }
                                    return undefined
                                }
                            )
                        },
                    }
                }
                const loopState = createLoopState(currentChunk)

                const tokenData = tokenizerState.createNextToken(loopState)

                if (tokenData !== null) {
                    tokenStreamConsumer.onData(tokenData)
                }
            }
        },
        onEnd: () => {
            const tokenData = tokenizerState.handleDanglingToken()
            if (tokenData !== null) {
                tokenStreamConsumer.onData(tokenData)
            }
            tokenStreamConsumer.onEnd(locationState.getCurrentLocation())

        },
    }

}