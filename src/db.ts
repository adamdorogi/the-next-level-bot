export type TodoDocument = {
    _id: string
    entries: Record<string, string>
    needed: number
}
