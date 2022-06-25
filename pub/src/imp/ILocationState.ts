import * as tokenLevel from "../interface"

export type ILocationState = {
    getCurrentLocation(): tokenLevel.Location
    getNextLocation(): tokenLevel.Location
    increase(character: number): void
}