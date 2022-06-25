import { Range } from "./Range"
import { Location } from "./Location"
import * as sp from "astn-parser-api"


export type WrappedStringType =
    | ["apostrophe", {}]
    | ["quote", {}]
    | ["multiline", {
        previousLines: string[]
    }]

/**
 * A PreToken is a low level token
 */
export type PreToken = {
    type:
    | ["header start", {
        range: Range
    }]
    | ["block comment begin", {
        range: Range
    }]
    | ["block comment end", {
        range: Range //| null
    }]
    | ["line comment begin", {
        range: Range
    }]
    | ["line comment end", {
        location: Location //| null
    }]
    | ["newline", {
        range: Range //| null
    }]
    | ["structural", {
        type: sp.StructuralTokenType
        range: Range
    }]
    | ["wrapped string begin", {
        range: Range
        type: WrappedStringType
    }]
    | ["wrapped string end", {
        range: Range
        wrapper: string | null
    }]
    | ["snippet", {
        chunk: string
        begin: number
        end: number
    }]
    | ["non wrapped string begin", {
        location: Location
    }]
    | ["non wrapped string end", {
        location: Location //| null
    }]
    | ["whitespace begin", {
        location: Location
    }]
    | ["whitespace end", {
        location: Location //| null
    }]
}