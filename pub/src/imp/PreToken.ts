import * as tokenLevel from "../interface"
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
        range: tokenLevel.Range
    }]
    | ["block comment begin", {
        range: tokenLevel.Range
    }]
    | ["block comment end", {
        range: tokenLevel.Range //| null
    }]
    | ["line comment begin", {
        range: tokenLevel.Range
    }]
    | ["line comment end", {
        location: tokenLevel.Location //| null
    }]
    | ["newline", {
        range: tokenLevel.Range //| null
    }]
    | ["structural", {
        type: sp.StructuralTokenType
        range: tokenLevel.Range
    }]
    | ["wrapped string begin", {
        range: tokenLevel.Range
        type: WrappedStringType
    }]
    | ["wrapped string end", {
        range: tokenLevel.Range
        wrapper: string | null
    }]
    | ["snippet", {
        chunk: string
        begin: number
        end: number
    }]
    | ["non wrapped string begin", {
        location: tokenLevel.Location
    }]
    | ["non wrapped string end", {
        location: tokenLevel.Location //| null
    }]
    | ["whitespace begin", {
        location: tokenLevel.Location
    }]
    | ["whitespace end", {
        location: tokenLevel.Location //| null
    }]
}