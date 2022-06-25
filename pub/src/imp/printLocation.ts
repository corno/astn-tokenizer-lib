import * as tokenLevel from "../../../tokenLevel/interface"

export function printLocation(location: tokenLevel.Location): string {
    return `${location.line}:${location.column}`
}