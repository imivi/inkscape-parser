#!/usr/bin/env node

import { parseInkscape } from "./index"
import fs from "fs"

const inputPath  = process.argv[2]
const outputPath = process.argv[3]


const svgText = fs.readFileSync(inputPath, { encoding: "utf-8" })

const { pageProperties, elements } = parseInkscape(svgText)

fs.writeFileSync(
    outputPath,
    JSON.stringify({ pageProperties, elements }, null, 4),
    { encoding: "utf-8" }
)