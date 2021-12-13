import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.117.0/testing/asserts.ts";
import { Timeout } from "https://deno.land/x/timeout/mod.ts";

// Simple name and function, compact form, but not configurable
await cleanAndBuild();

Deno.test("Test Addition", async () => {
  await check("addition", "2 + 3", 5);
});

async function check(filename: string, program: string, expected: number) {
  assertEquals(await runProgram(filename, program), `${expected}`);
}

async function runProgram(filename: string, program: string) {
  const wat = await compile2Wat(program);

  const watFilename = "build/" + filename + ".wat";
  const wasmFilename = "build/" + filename + ".wasm";

  await Deno.writeTextFileSync(watFilename, wat);
  await runShell(["wat2Wasm", watFilename, "-o", wasmFilename]);

  const wasmCode = await Deno.readFile(wasmFilename);
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
