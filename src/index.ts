import { parse } from "svg-parser"
import { SvgElement, SvgRoot, ParsedElement } from "./types"



type Options = {
    flat: false | number
    include: string[]
    exclude: string[]
}

const defaultOptions: Options = {
    flat: 9,
    exclude: ["sodipodi:namedview", "defs"],
    include: [],
}

/**
 * Parse the content of any inkscape SVG.
 * @param svgString The source inkscape SVG as a string
 * @param customOptions 
 * @returns object: { unprocessed, pageProperties, elements }
 */
export function parseInkscape(svgString: string, customOptions: Partial<Options> = {}) {

    const options   = { ...defaultOptions, ...customOptions }
    const includeSet = new Set(options.include)
    const excludeSet = new Set(options.exclude)

    const svgTree = parse(svgString) as SvgRoot

    // The root element contains the document size and metadata
    const rootElement = svgTree.children[0]
    const svgElements = rootElement.children as SvgElement[]

    // Parse elements and filter out those excluded
    const elements = parseElements(svgElements, options.flat || 0)
        .filter(element => {
            if(includeSet.size>0 && !includeSet.has(element.type))  return false
            if(excludeSet.size>0 && excludeSet.has(element.type))   return false
            return true
        })
    
    return {
        unprocessed: svgTree,
        pageProperties: rootElement.properties,
        elements,
    }
}


function parseElements(elements: SvgElement[], flattenDepth: number) {
    const parsedElements = elements.map(node => visitNode(node,null))

    // @ts-expect-error "Excessively deep recursive type"
    return parsedElements.flat(flattenDepth)
}


type ParsedElementTree = ParsedElement | ParsedElementTree[]

function visitNode(node: SvgElement, parentLayerName: string|null): ParsedElementTree {
    const { tagName } = node
    const layerName = node.properties?.["inkscape:label"]

    const childrenNodes = node.children as SvgElement[]

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
        const parsedElement: ParsedElement = {
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


function parseGenericNode(node: SvgElement, parentLayer: string|null) {

    const parsedElement: ParsedElement = {
        type: node.tagName!,
        layer: parentLayer,
        id: node.properties?.id,
        label: node.properties?.["inkscape:label"],
        x: node.properties?.x,
        y: node.properties?.y,
    }
    const text = getTextFromChildren(node.children as SvgElement[])
    if(text) {
        parsedElement.value = text
    }

    return parsedElement
}


function getTextFromChildren(nodes: SvgElement[]): string | null {
    
    const textLines: string[] = []
    nodes.forEach(node => {
        if(node.children && node.children[0].value) {
            textLines.push(node.children[0].value)
        }
    })

    return textLines.length > 0 ? textLines.join("\n") : null
}