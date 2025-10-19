import "styles/cover.scss";
//import * as fs from 'node:fs';
// import * as fs from 'FS';
import * as das from "./DaScript/daScript.js";
import {FS} from "./DaScript/daScript.js";
// fs.writeFile('main.das', `
// [export]
// def main {
// 	var a = 1
// 	var b = 4
// 	var c = a + b
// 	print("{c}\\n")
// 	print("Hello World\\n")
// }
// `, "utf8");


//console.log("test", das.wasmExports);


FS.writeFile('main.das',await (await fetch("modules/cover/test.das")).text());

das.callMain(['main.das']);


console.log("test", das.wasmExports)
