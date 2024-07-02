import cluster from "cluster";
import os from "os";
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

// Time quantum in milliseconds (adjust as needed)
const timeQuantum = 3000;

let currentWorkerIndex = 0;
const workers = [];

// Function to execute when the time quantum expires for a worker
const switchWorker = () => {
    const nextWorkerIndex = (currentWorkerIndex + 1) % cpuCount;
    if (workers[currentWorkerIndex]) {
        workers[currentWorkerIndex].disconnect(); // disconnect the current worker if it exists
    }
    currentWorkerIndex = nextWorkerIndex; // update the current worker index
};

// Fork worker processes and store them in the workers array
for (let i = 0; i < cpuCount; i++) {
    const worker = cluster.fork();
    workers.push(worker);
}

// Handle worker exits
cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} has been killed`);
    console.log("Starting another worker");
    // Replace the dead worker
    const index = workers.findIndex(w => w === worker);
    workers.splice(index, 1); // Remove the dead worker from the workers array
    cluster.fork(); // Start a new worker to replace the killed one
});

// Set a timer for each worker to enforce the time quantum
setInterval(switchWorker, timeQuantum);
