import * as pr from "pareto-runtime"

export function createSerializedMultilineString(
    lines: string[],
    indentation: string,
): string {
    //don't escape tabs, newlines!
    return `\`${lines.map((line, index) => `${index === 0 ? "" : indentation}${pr.escapeString({
        str: line,
        escapeTabsAndNewLines: false,
        wrapperToEscape: "`",
     })}`).join("")}\``
}

export function createSerializedApostrophedString(str: string): string {
    return `'${pr.escapeString({
       str: str,
       escapeTabsAndNewLines: true,
       wrapperToEscape: "'",
    })}'`
}

export function createSerializedQuotedString(str: string): string {
    return `"${pr.escapeString({
        str: str,
        escapeTabsAndNewLines: true,
        wrapperToEscape: "\"",
     })}"`
}

export function createSerializedNonWrappedString(str: string): string {
    return pr.escapeString({
        str: str,
        escapeTabsAndNewLines: false,
        wrapperToEscape: null,
     })
}
