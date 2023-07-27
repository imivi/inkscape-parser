import { SvgElement } from "../types";
import { decode } from "he";


export function unescapeText(elements: SvgElement[]): SvgElement[] {
    elements.forEach(element => {
        if(element.type === "text" && element.value) {
            element.value = decode(element.value)
        }
    })
    return elements
}