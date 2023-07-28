#!/usr/bin/env node

import fs from "fs"
import { parseInkscape } from "."


function cli() {
    if(process.argv.length < 4) {
        console.log("Error: too few arguments provided. Please provide the path to the svg file and an output path (.json)")
        return
    }
    const inputPath  = process.argv[2];
    const outputPath = process.argv[3];

    [inputPath,outputPath].forEach(path => {
        if(!fs.existsSync(path)) {
            console.log("Error: file not found.", path)
            return
        }
    });
    
    const svgText = fs.readFileSync(inputPath, { encoding: "utf-8" })
    
    const { pageProperties, elements } = parseInkscape(svgText)
    
    fs.writeFileSync(
        outputPath,
        JSON.stringify({ pageProperties, elements }, null, 4),
        { encoding: "utf-8" }
    )
}

cli()