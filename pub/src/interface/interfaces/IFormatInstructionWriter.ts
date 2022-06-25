import { NonTokenFormatInstruction, TokenFormatInstruction } from "../types/FormatInstruction"

export type IFormatInstructionWriter<EventAnnotation> = {
    token: (instruction: TokenFormatInstruction, annotation: EventAnnotation) => void
    nonToken: (instruction: NonTokenFormatInstruction) => void
}