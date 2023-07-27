import { parse } from "svg-parser"
import { SvgElement, SvgRoot, InputSvgElement } from "./types"
import { unescapeText } from "./utils/unescapeText"

export {
    SvgElement,
    SvgRoot,
    InputSvgElement,
}



type Options = {
    // flat: false | number
    include: string[]
    exclude: string[]
    unescape: boolean
}

const defaultOptions: Options = {
    // flat: 9,
    exclude: ["sodipodi:namedview", "defs"],
    include: [],
    unescape: true,
}


type Output = {
    unprocessed: SvgRoot,
    pageProperties: Record<string, string | number>,
    elements: SvgElement[],
}

/**
 * Parse the content of any inkscape SVG.
 * @param svgString The source inkscape SVG as a string
 * @param options
 * @returns object: { unprocessed, pageProperties, elements }
 */
export function parseInkscape(svgString: string, customOptions: Partial<Options> = {}): Output {

    const options   = { ...defaultOptions, ...customOptions }
    const includeSet = new Set(options.include)
    const excludeSet = new Set(options.exclude)

    const svgTree = parse(svgString) as SvgRoot

    // The root element contains the document size and metadata
    const rootElement = svgTree.children[0]
    const svgElements = rootElement.children as InputSvgElement[]

    // Parse elements and filter out those excluded
    const elements = parseElements(svgElements)
        .filter(element => {
            if(element.type && includeSet.size>0 && !includeSet.has(element.type))  return false
            if(element.type && excludeSet.size>0 && excludeSet.has(element.type))   return false
            return true
        })
    
    return {
        unprocessed: svgTree,
        pageProperties: rootElement.properties as Record<string, string | number>,
        elements: options.unescape ? unescapeText(elements) : elements,
    }
}


function parseElements(elements: InputSvgElement[], flattenDepth=9): SvgElement[] {
    const parsedElements = elements.map(node => visitNode(node, null))

    // @ts-expect-error "Excessively deep recursive type"
    return parsedElements.flat(flattenDepth)
}


type ParsedElementTree = SvgElement | ParsedElementTree[]

function visitNode(node: InputSvgElement, parentLayerName: string|null): ParsedElementTree {
    const { tagName } = node
    const layerName = node.properties?.["inkscape:label"]

    const childrenNodes = node.children as InputSvgElement[]

    if(childrenNodes) {
        if(tagName === "text" || tagName === "path") {
            return parseGenericNode(node, parentLayerName)
        }
    }

    if(childrenNodes && childrenNodes.length > 0) {
        const newLayerName = parentLayerName ? [parentLayerName,layerName].join(".") : layerName
        return childrenNodes.map(node => visitNode(node, newLayerName || null))
    }
    else {
        const parsedElement: SvgElement = {
            type: tagName || null,
            layer: parentLayerName,
            id: node.properties?.id,
            label: node.properties?.["inkscape:label"],
            width: node.properties?.width,
            height: node.properties?.height,
            x: node.properties?.x,
            y: node.properties?.y,
            cx: node.properties?.cx,
            cy: node.properties?.cy,
            r: node.properties?.r,
        }
        return parsedElement
    }
}


function parseGenericNode(node: InputSvgElement, parentLayer: string|null) {

    const parsedElement: SvgElement = {
        type: node.type || null,
        layer: parentLayer,
        id: node.properties?.id,
        label: node.properties?.["inkscape:label"],
        x: node.properties?.x,
        y: node.properties?.y,
    }
    const text = getTextFromChildren(node.children as InputSvgElement[])
    if(text) {
        parsedElement.type = "text"
        parsedElement.value = text
    }

    return parsedElement
}


function getTextFromChildren(nodes: InputSvgElement[]): string | null {
    
    const textLines: string[] = []
    nodes.forEach(node => {
        if(node.children && node.children[0].value) {
            textLines.push(node.children[0].value)
        }
    })

    return textLines.length > 0 ? textLines.join("\n") : null
}