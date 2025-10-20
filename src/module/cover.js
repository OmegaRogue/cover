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

console.log(das.wasmExports.Q.length)
das.HEAP8[0] = 69;
das.callMain(['main.das']);
console.log(das.wasmExports.Q.length)
das.callMain(['main.das']);
console.log(das.wasmExports.Q.length)


// const text = new TextDecoder("utf-8").decode(new Uint8Array(das.wasmExports.O.buffer));
// const file = new File([text], 'note.txt', {
// 	type: 'text/plain',
// })
//
// const link = document.createElement('a')
// const url = URL.createObjectURL(file)
//
// link.href = url
// link.download = file.name
// document.body.appendChild(link)
// link.click()
//
// document.body.removeChild(link)
// window.URL.revokeObjectURL(url)
// console.log("testtt", JSON.stringify());
//
// console.log("test", das.wasmExports)
globalThis.WasmExports = das;
