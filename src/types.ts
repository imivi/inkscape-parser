export type SvgElement = {
    layer: string | null // property "inkscape:label"
    type: string | null // "text" | "rect" | "path" | "circle" // property "tagName"
} & Partial<{
    value: string // Only used if type is text
    id: string
    label: string
    x: number
    y: number

    // Rectangle
    width: number
    height: number

    // Circle
    cx: number
    cy: number
    r: number
}>


export type SvgRoot = {
    type: "root",
    children: [InputSvgElement]
}


export type InputSvgElement = Partial<{
    type: "element"
    tagName: "svg" | "g" | "rect" | "tspan" | "text" | "path" | "sodipodi:namedview"
    value: string // Used if type is text
    properties: {
        "sodipodi:role": "line",
        id: string
        "inkscape:label": string
        "inkscape:groupmode": "layer" | string
        "style": string, // CSS properties
        x: number
        y: number
        width: number // Page width in millimeters
        height: number // Page width in millimeters
        viewBox: string
        "inkscape:version": string
        version: number

        // Circle
        cx: number
        cy: number
        r: number
    }
    children: InputSvgElement[],
}>

