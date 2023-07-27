import fs from "fs"
import { parseInkscape } from "."

export function test() {
    const inputFile = "src/inkscape2.svg"
    const rawSvgText = fs.readFileSync(inputFile, { encoding: "utf-8" })

    // console.log("Watching changes and reparsing:", inputFile)
    
    const output = parseInkscape(rawSvgText)

    Object.entries(output).map(([key,value]) => {
        fs.writeFileSync(`output/${key}.json`, JSON.stringify(value,null,4), { encoding: "utf-8" })
    })
    
}

test()