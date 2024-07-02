import cluster from "cluster";
import os from "os";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const cpuCount = os.cpus().length;

console.log(`Total CPU count: ${cpuCount}`);
console.log(`Parent Process id: ${process.pid}`);

cluster.setupPrimary({
    exec: __dirname + "/index.js",
});

// Array to store workers
const workers = [];

// Fork worker processes
for (let i = 0; i < cpuCount; i++) {
    const worker = cluster.fork();
    workers.push(worker);
}

// Function to find the worker with the least number of connections
function findLeastLoadedWorker() {
    let leastLoadedWorker = workers[0];
    for (let i = 1; i < workers.length; i++) {
        if (workers[i].getConnections() < leastLoadedWorker.getConnections()) {
            leastLoadedWorker = workers[i];
        }
    }
    return leastLoadedWorker;
}

// Handle worker exits
cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} has been killed`);
    console.log("Starting another worker");
    // Find the least loaded worker and replace the dead worker
    const leastLoadedWorker = findLeastLoadedWorker();
    const newWorker = cluster.fork();
    const index = workers.indexOf(worker);
    workers[index] = newWorker;
});

// Start your server logic in index.js
