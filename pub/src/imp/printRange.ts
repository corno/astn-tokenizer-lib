
import * as tokenLevel from "../../../tokenLevel/interface"

export function printRange(range: tokenLevel.Range): string {
    const tail = range.size[0] === "single line" ? `${range.start.column + range.size[1]["column offset"]}` : `${range.size[1]["line offset"] + range.start.line}:${range.size[1].column}`
    return `${range.start.line}:${range.start.column}-${tail}`
}
