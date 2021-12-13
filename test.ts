import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.117.0/testing/asserts.ts";
import { Timeout } from "https://deno.land/x/timeout/mod.ts";

// Simple name and function, compact form, but not configurable
await cleanAndBuild();

Deno.test("hello world #1", async () => {
  assertEquals(await runProgram("build/addition.wasm", "2 + 3"), `${5}`);
});

async function runProgram(filename: string, program: string) {
  const wat = await compile2Wat(program);
  console.log("\n", wat);
  console.log(await wat2Wasm(filename, wat));

  const wasmCode = await Deno.readFile(filename);
  const wasmModule = new WebAssembly.Module(wasmCode);
  const wasmInstance = new WebAssembly.Instance(wasmModule);
  const main = wasmInstance.exports.main as CallableFunction;
  const output = main().toString();
  return output;
}

async function compile2Wat(program: string) {
  const p = Deno.run({
    cmd: ["build/exec/awsm"],
    stdout: "piped",
    stdin: "piped",
  });
  p.stdin.write(new TextEncoder().encode(program));
  p.stdin.close();
  const { success } = await Timeout.race([p.status()], 1000);
  assert(success, "Compile language unsucessful");

  p.close();
  return new TextDecoder().decode(await p.output());
}

async function wat2Wasm(filename: string, program: string) {
  const p = Deno.run({
    cmd: ["wat2Wasm", "-o", filename, "-"],
    stdout: "piped",
    stdin: "piped",
  });
  p.stdin.write(new TextEncoder().encode(program));
  p.stdin.close();
  const { success } = await Timeout.race([p.status()], 1000);
  assert(success, "Compile wat 2 wasm unsucessful");

  p.close();
  return new TextDecoder().decode(await p.output());
}

async function cleanAndBuild() {
  console.log(await runShell(["rm", "-rf", "build/"]));
  console.log(await runShell(["idris2", "--build", "awsm.ipkg"]));
}

async function runShell(cmd: string[] | string) {
  const p = Deno.run({ cmd: Array.from(cmd), stdout: "piped" });
  const { success } = await p.status();
  assert(success, "comand not successful: " + JSON.stringify(cmd));
  const stdout = new TextDecoder().decode(await p.output());
  p.close();
  return stdout;
}
