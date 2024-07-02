import cluster from "cluster";
import os  from "os";
import { dirname } from "path";
import { fileURLToPath } from "url";


const __dirname = dirname(fileURLToPath(import.meta.url));

const cpuCount = os.cpus().length;

console.log(`Total CPU count ${cpuCount}`);
console.log(`Parent Process id = ${process.pid}`);

cluster.setupPrimary({
    exec: __dirname + "/index.js",
})

console.log("cpu : ", cpuCount);
// Function to get the next worker index for round-robin
// Fork worker processes
for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
}

// Handle worker exits
cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} has been killed`);
    console.log("Starting another worker");
    // Replace the dead worker
    cluster.fork();
});