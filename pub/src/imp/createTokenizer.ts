import * as pr from "pareto-runtime"

import * as inf from "../interface"
import * as grammar from "astn-parser-api"

import { createStreamPreTokenizer } from "./createStreamPreTokenizer";
import { createTokenizer2 } from "./createTokenizer2";

export function createTokenizer($p: {
    parser: grammar.IStructureParser<inf.TokenizerAnnotationData>
    onError: ($: {
        error: inf.TokenizerError
        range: inf.Range
    }) => void
}): pr.IStreamConsumer<string, null> {
    return createStreamPreTokenizer(
        createTokenizer2(
            $p.parser,
            ($) => {
                $p.onError({
                    error: ["tokenizer", $.error],
                    range: $.range,
                })
            },
        ),
        ($) => {
            $p.onError({
                error: ["pre", $.error],
                range: $.range,
            })
        },
    )
}