
import express from "express";

const app = express();
import cluster from "cluster";
import os from "os";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cpuCount = os.cpus().length;

console.log(`Total CPU count ${cpuCount}`);
console.log(`Parent Process id = ${process.pid}`);

cluster.setupPrimary({
    exec: "./index.js",
})

// Track the last processed time for each worker
const workerLastProcessedTime = {};

// Fork worker processes
for (let i = 0; i < cpuCount; i++) {
    console.log("cpu : ", cpuCount);
    cluster.fork();
}

// Handle worker exits
cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} has been killed`);
    console.log("Starting another worker");
    // Replace the dead worker
    cluster.fork();
});

// Master process listens on port 3000
if (cluster.isMaster) {
    // Handle incoming requests in master process
    // Route incoming requests to workers
    const routeRequest = (req, res) => {
        const sortedWorkers = Object.keys(workerLastProcessedTime).sort((a, b) => {
            return workerLastProcessedTime[a] - workerLastProcessedTime[b];
        });

        const leastRecentlyProcessedWorkerId = sortedWorkers[0];
        const leastRecentlyProcessedWorker = cluster.workers[leastRecentlyProcessedWorkerId];
        leastRecentlyProcessedWorker.send({ cmd: "handleRequest", request: req, response: res });
        workerLastProcessedTime[leastRecentlyProcessedWorkerId] = Date.now(); // Update last processed time
    };

    app.get("/load", (req, res) => {
        routeRequest(req, res);
    });

    app.listen(3000, () => {
        console.log(`Master process listening on port 3000`);
    });
} else {
    // Worker processes do not listen on any port
    // They handle incoming requests sent from the master process
    process.on("message", (message) => {
        if (message.cmd === "handleRequest") {
            // Process the request

            app.get("/load", (req, res) => {
                let precess = 0;

                for (let i = 1; i <= 50_000_000; i++) {
                    precess++;
                }

                res.send(`Current process is ${process.pid}\n`);
            });

            app.handle(message.request, message.response);
        }
    });
}
