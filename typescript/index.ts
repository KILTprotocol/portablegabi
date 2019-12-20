import { claimer, attestationArr } from "./wasm_exec_new";

const test = async () => {
  const x = await claimer();
  console.log("x: ", x);
  const y = await attestationArr();
  console.log("y: ", y);
};
(async () => test())();
