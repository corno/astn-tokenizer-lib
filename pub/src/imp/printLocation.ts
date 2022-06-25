import * as tokenLevel from "../interface"

export function printLocation(location: tokenLevel.Location): string {
    return `${location.line}:${location.column}`
}