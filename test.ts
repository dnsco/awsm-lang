import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.117.0/testing/asserts.ts";
import { Timeout } from "https://deno.land/x/timeout/mod.ts";

// Simple name and function, compact form, but not configurable
await cleanAndBuild();

Deno.test("Test Addition", async () => {
  await check("addition1", "2 + 3", 5);
  await check("addition2", "2 + 6", 8);
});

async function check(filename: string, program: string, expected: number) {
  assertEquals(await runProgram(filename, program), `${expected}`);
}

async function runProgram(testFilenameBase: string, program: string) {
  const wasmFilename = await compile(program, testFilenameBase);
  const output = await runWasmFile(wasmFilename);
  return output;
}

async function compile(program: string, baseFilename: string) {
  const wat = await compileAwsm2Wat(program);
  const wasmFilename = await writeWasmToDisk(baseFilename, wat);
  return wasmFilename;
}

async function compileAwsm2Wat(program: string) {
  const p = Deno.run({
    cmd: ["build/exec/awsm"],
    stdout: "piped",
    stdin: "piped",
    stderr: "piped",
  });
  p.stdin.write(new TextEncoder().encode(program));
  p.stdin.close();
  const { success } = await Timeout.race([p.status()], 1000);
  assert(success, "AWSM compiler: \n" + await p.stderrOutput());

  p.close();
  return new TextDecoder().decode(await p.output());
}

async function writeWasmToDisk(filename: string, wat: string) {
  const watFilename = "build/" + filename + ".wat";
  const wasmFilename = "build/" + filename + ".wasm";

  await Deno.writeTextFileSync(watFilename, wat);
  await runShell(["wat2Wasm", watFilename, "-o", wasmFilename]);
  return wasmFilename;
}

async function runWasmFile(wasmFilename: string) {
  const wasmCode = await Deno.readFile(wasmFilename);
  const wasmModule = new WebAssembly.Module(wasmCode);
  const wasmInstance = new WebAssembly.Instance(wasmModule);
  const main = wasmInstance.exports.main as CallableFunction;
  const output = main().toString();
  return output;
}

async function cleanAndBuild() {
  console.log(await runShell(["rm", "-rf", "build/"]));
  console.log(await runShell(["idris2", "--build", "awsm.ipkg"]));
}

async function runShell(cmd: string[] | string) {
  const p = Deno.run({
    cmd: Array.from(cmd),
    stdout: "piped",
    stderr: "piped",
  });
  const { success } = await p.status();
  const stdout = new TextDecoder().decode(await p.output());
  const stdErr = new TextDecoder().decode(await p.stderrOutput());
  assert(
    success,
    "comand not successful: " + JSON.stringify(cmd) + "\n" + stdErr,
  );
  p.close();
  return stdout;
}
