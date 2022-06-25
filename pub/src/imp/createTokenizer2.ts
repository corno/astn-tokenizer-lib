/* eslint
    complexity: off
*/
import * as pr from "pareto-runtime"

import * as inf from "../interface"
import * as sp from "astn-parser-api"

import { getEndLocationFromRange } from "./getEndLocationFromRange"
import { WrappedStringType } from "./PreToken"

function createRangeFromLocations(start: inf.Location, end: inf.Location): inf.Range {
    return {
        start: start,
        length: end.position - start.position,
        size: ((): inf.RangeSize => {
            if (start.line === end.line) {
                return ["single line", { "column offset": end.column - start.column }]
            } else {
                return ["multi line", { "line offset": end.line - start.line, "column": end.column }]
            }
        })(),
    }
}

function createRangeFromSingleLocation(location: inf.Location): inf.Range {
    return {
        start: location,
        length: 0,
        size: ["single line", { "column offset": 0 }],
    }
}

type NonWrappedStringContext = {
    nonwrappedStringNode: string
    readonly start: inf.Location
}
type WhitespaceContext = {
    whitespaceNode: string
    readonly start: inf.Location
}

type CommentContext = {
    commentNode: string
    readonly start: inf.Range
    readonly indentation: null | string
}

type WrappedStringContext = {
    readonly type: WrappedStringType
    readonly start: inf.Range
    wrappedStringNode: string
    indentation: string
}

type CurrentToken =
    | ["none", {}]
    | ["line comment", CommentContext]
    | ["block comment", CommentContext]
    | ["non wrapped string", NonWrappedStringContext]
    | ["wrapped string", WrappedStringContext]
    | ["whitespace", WhitespaceContext]


export function printTokenizer2Error(error: inf.Tokenizer2Error): string {
    return error[0]
}

export function createTokenizer2(
    parser: sp.IStructureParser<inf.TokenizerAnnotationData>,
    onError2: ($: {
        error: inf.Tokenizer2Error
        range: inf.Range
    }) => void,
): inf.IPreTokenStreamConsumer {

    function onError(error: inf.Tokenizer2Error, range: inf.Range) {
        onError2({
            error: error,
            range: range,
        })
    }
    const indentationState = (() => {
        let indentation = ""
        let lineIsDirty = false
        return {
            setLineDirty: () => {
                lineIsDirty = true
            },
            onWhitespace: (value: string) => {
                if (!lineIsDirty) {
                    indentation = value
                }
            },
            onNewline: () => {
                indentation = ""
                lineIsDirty = false
            },
            getIndentation: () => {
                return indentation
            },
        }
    })()

    function createAnnotation(
        range: inf.Range,
    ): inf.TokenizerAnnotationData {
        return {
            range: range,
            indentation: indentationState.getIndentation(),
        }
    }
    let currentToken: CurrentToken = ["none", {}]

    function setCurrentToken(contextType: CurrentToken, range: inf.Range) {
        if (currentToken[0] !== "none") {
            onError(["unexpected start of token", {}], range)
        }
        currentToken = contextType
    }
    function unsetCurrentToken(range: inf.Range) {
        if (currentToken[0] === "none") {
            onError(["unexpected, parser is already in 'none' mode", {}], range)
        }
        currentToken = ["none", {}]
    }

    return {
        onData: (data) => {
            switch (data.type[0]) {
                case "block comment begin": {
                    const $ = data.type[1]

                    setCurrentToken(["block comment", {
                        commentNode: "",
                        start: $.range,
                        indentation: indentationState.getIndentation(),
                    }], $.range)

                    indentationState.setLineDirty()
                    break
                }
                case "block comment end": {
                    const $ = data.type[1]

                    if (currentToken[0] !== "block comment") {
                        onError(["Unexpected block comment end", {}], $.range)
                    }
                    //const $ = currentToken[1]
                    //const endOfStart = getEndLocationFromRange($.start)
                    // const od = parser.onData({
                    //     tokenString: "*/",
                    //     range: createRangeFromLocations(
                    //         $.start.start,
                    //         getEndLocationFromRange(end),
                    //     ),
                    //     type: [TokenType.Overhead, {
                    //         type: [OverheadTokenType.Comment, {
                    //             comment: $.commentNode,
                    //             innerRange: createRangeFromLocations(
                    //                 {
                    //                     position: endOfStart.position,
                    //                     line: endOfStart.line,
                    //                     column: endOfStart.column,
                    //                 },
                    //                 {
                    //                     position: end.start.position,
                    //                     line: end.start.line,
                    //                     column: end.start.column,
                    //                 },
                    //             ),
                    //             indentation: $.indentation,
                    //             type: "block",
                    //         }],
                    //     }],
                    // })
                    unsetCurrentToken($.range)
                    //return od
                    break
                }
                case "line comment begin": {
                    const $ = data.type[1]

                    setCurrentToken(
                        ["line comment", {
                            commentNode: "",
                            start: $.range,
                            indentation: indentationState.getIndentation(),
                        }],
                        $.range
                    )
                    indentationState.setLineDirty()
                    break
                }
                case "line comment end": {
                    const $ = data.type[1]
                    function onLineCommentEnd(location: inf.Location) {

                        if (currentToken[0] !== "line comment") {
                            onError(["Unexpected line comment end", {}], createRangeFromSingleLocation(location))
                        }

                        //const $ = currentToken[1]
                        // const range = createRangeFromLocations($.start.start, location)
                        // const endOfStart = getEndLocationFromRange($.start)
                        // const od = parser.onData({
                        //     tokenString: "",
                        //     range: range,
                        //     type: [TokenType.Overhead, {
                        //         type: [OverheadTokenType.Comment, {
                        //             comment: $.commentNode,
                        //             innerRange: createRangeFromLocations(
                        //                 {
                        //                     position: endOfStart.position,
                        //                     line: endOfStart.line,
                        //                     column: endOfStart.column,
                        //                 },
                        //                 location,
                        //             ),
                        //             indentation: $.indentation,
                        //             type: "line",
                        //         }],
                        //     }],
                        // })
                        unsetCurrentToken(createRangeFromSingleLocation(location))
                    }
                    onLineCommentEnd($.location)
                    break
                }
                case "newline": {
                    const $ = data.type[1]
                    function onNewLine(_range: inf.Range, _tokenString: string) {

                        indentationState.onNewline()


                        switch (currentToken[0]) {
                            case "line comment": {
                                throw new Error(`unexpected newline`)
                            }
                            case "block comment": {
                                throw new Error("IMPLEMENT ME: BLOCK COMMENT NEWLINE")
                                // $.type[1].previousLines.push($.wrappedStringNode)
                                // $.wrappedStringNode = ""
                                break
                            }
                            case "none": {

                                // return parser.onData({
                                //     tokenString: tokenString,
                                //     range: range,
                                //     type: [TokenType.Overhead, {
                                //         type: [OverheadTokenType.NewLine, {
                                //         }],
                                //     }],
                                // })
                                break
                            }
                            case "wrapped string": {
                                const $ = currentToken[1]
                                if ($.type[0] !== "multiline") {
                                    throw new Error(`unexpected newline`)
                                }
                                $.type[1].previousLines.push($.wrappedStringNode)
                                $.wrappedStringNode = ""
                                break
                            }
                            case "non wrapped string": {
                                throw new Error(`unexpected newline`)
                            }
                            case "whitespace": {
                                throw new Error(`unexpected newline`)
                            }
                            default:
                                pr.au(currentToken[0])
                        }
                    }
                    onNewLine($.range, "FIXME NEWLINE TOKEN STRING")
                    break
                }
                case "header start": {
                    const $ = data.type[1]
                    indentationState.setLineDirty()
                    parser.onToken({
                        annotation: createAnnotation(
                            $.range,
                        ),
                        token: ["header start", { }],
                    })
                    break
                }
                case "structural": {
                    const $ = data.type[1]
                    indentationState.setLineDirty()
                    parser.onToken({
                        annotation: createAnnotation(
                            $.range,
                        ),
                        token: ["content", ["structural", {
                            //char: $.char,
                            type: $.type,
                        }]],
                    })
                    break
                }
                case "snippet": {
                    const $$ = data.type[1]
                    switch (currentToken[0]) {
                        case "line comment": {
                            const $ = currentToken[1]
                            $.commentNode += $$.chunk.substring($$.begin, $$.end)
                            break
                        }
                        case "block comment": {
                            const $ = currentToken[1]
                            $.commentNode += $$.chunk.substring($$.begin, $$.end)
                            break
                        }
                        case "none": {
                            throw new Error(`unexpected snippet`)
                        }
                        case "wrapped string": {
                            const $ = currentToken[1]
                            $.wrappedStringNode += $$.chunk.substring($$.begin, $$.end)
                            break
                        }
                        case "non wrapped string": {
                            const $ = currentToken[1]
                            $.nonwrappedStringNode += $$.chunk.substring($$.begin, $$.end)
                            break
                        }
                        case "whitespace": {
                            const $ = currentToken[1]
                            $.whitespaceNode += $$.chunk.substring($$.begin, $$.end)
                            break
                        }
                        default:
                            pr.au(currentToken[0])
                    }
                    break
                }
                case "wrapped string begin": {
                    const $ = data.type[1]
                    indentationState.setLineDirty()
                    function onWrappedStringBegin(begin: inf.Range, quote: WrappedStringType) {
                        setCurrentToken(
                            ["wrapped string", {
                                wrappedStringNode: "",
                                start: begin,
                                type: quote,
                                indentation: indentationState.getIndentation(),
                            }],
                            begin
                        )
                    }
                    onWrappedStringBegin($.range, $.type)
                    break
                }
                case "wrapped string end": {
                    const $ = data.type[1]
                    function onWrappedStringEnd(end: inf.Range, wrapper: string | null) {
                        if (currentToken[0] !== "wrapped string") {
                            onError(["Unexpected nonwrapped string end", {}], end)
                        } else {
                            const $tok = currentToken[1]
                            const $ = currentToken[1]

                            const range = createRangeFromLocations($tok.start.start, getEndLocationFromRange(end))

                            unsetCurrentToken(end)

                            switch ($.type[0]) {
                                case "apostrophe": {
                                    parser.onToken({
                                        annotation: createAnnotation(
                                            range,
                                        ),
                                        token: ["content", ["simple string", {
                                            value: $.wrappedStringNode,
                                            wrapping: ["apostrophe", { }],
                                        }]],
                                    })
                                    break
                                }
                                case "multiline": {
                                    const $$ = $.type[1]
                                    function trimStringLines(lines: string[], indentation: string) {
                                        return lines.map((line, index) => {
                                            if (index === 0) { //the first line needs no trimming
                                                return line
                                            }
                                            if (line.startsWith(indentation)) {
                                                return line.substr(indentation.length)
                                            }
                                            return line
                                        })
                                    }
                                    parser.onToken({
                                        annotation: createAnnotation(
                                            range,
                                        ),
                                        token: ["content", ["multiline string", {
                                            lines: trimStringLines($$.previousLines.concat([$.wrappedStringNode]), $.indentation),
                                        }]],
                                    })
                                    break
                                }
                                case "quote": {
                                    parser.onToken({
                                        annotation: createAnnotation(
                                            range,
                                        ),
                                        token: ["content", ["simple string", {
                                            value: $.wrappedStringNode,
                                            wrapping: ["quote", { }],
                                        }]],
                                    })
                                    break
                                }
                                default:
                                    pr.au($.type[0])
                            }
                        }
                    }
                    onWrappedStringEnd($.range, $.wrapper)
                    break
                }
                case "non wrapped string begin": {
                    const $ = data.type[1]
                    function onNonWrappedStringBegin(location: inf.Location) {

                        indentationState.setLineDirty()

                        setCurrentToken(["non wrapped string", { nonwrappedStringNode: "", start: location }], createRangeFromSingleLocation(location))
                    }
                    onNonWrappedStringBegin($.location)
                    break
                }
                case "non wrapped string end": {
                    const $ = data.type[1]
                    function onNonWrappedStringEnd(location: inf.Location) {

                        if (currentToken[0] !== "non wrapped string") {
                            onError(["Unexpected nonwrapped string end", {}], createRangeFromSingleLocation(location))
                        } else {
                            const $ = currentToken[1]

                            const $tok = currentToken[1]
                            const value = $tok.nonwrappedStringNode
                            const range = createRangeFromLocations($.start, location)
                            unsetCurrentToken(createRangeFromSingleLocation(location))
                            parser.onToken({
                                annotation: createAnnotation(
                                    range,
                                ),
                                token: ["content", ["simple string", {
                                    value: value,
                                    wrapping: ["none", { }],
                                    //startCharacter: $tok.startCharacter,
                                    //wrapper: null,
                                }]],
                            })
                        }
                    }
                    onNonWrappedStringEnd($.location)
                    break
                }
                case "whitespace begin": {
                    const $ = data.type[1]
                    function onWhitespaceBegin(location: inf.Location) {
                        const $: WhitespaceContext = { whitespaceNode: "", start: location }

                        setCurrentToken(["whitespace", $], createRangeFromSingleLocation(location))
                    }

                    onWhitespaceBegin($.location)
                    break
                }
                case "whitespace end": {
                    const $ = data.type[1]
                    function onWhitespaceEnd(location: inf.Location) {

                        if (currentToken[0] !== "whitespace") {
                            onError(["Unexpected whitespace end", {}], createRangeFromSingleLocation(location))
                        } else {
                            const $ = currentToken[1]
                            //const range = createRangeFromLocations($.start, location)
                            indentationState.onWhitespace($.whitespaceNode)
                            // const od = parser.onData({
                            //     tokenString: $.whitespaceNode,
                            //     range: range,
                            //     type: [TokenType.Overhead, {
                            //         type: [OverheadTokenType.WhiteSpace, {
                            //             value: $.whitespaceNode,
                            //         }],
                            //     }],
                            // })
                            unsetCurrentToken(createRangeFromSingleLocation(location))
                            //return od
                        }
                    }
                    onWhitespaceEnd($.location)
                    break
                }
                default:
                    pr.au(data.type[0])
            }
        },
        onEnd: (location: inf.Location) => {
            parser.onEnd(
                createAnnotation(
                    createRangeFromLocations(location, location),
                )
            )
        },
    }
}