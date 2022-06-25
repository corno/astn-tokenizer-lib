import * as pr from "pareto-runtime"
import * as tokenLevel from "../types/Location"

import { PreToken } from "../types/PreToken"


export type IPreTokenStreamConsumer = pr.IStreamConsumer<PreToken, tokenLevel.Location>