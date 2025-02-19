import loadtest from 'loadtest';

const options = {
    url: 'http://localhost:3000/load', // URL where the load is being sent
    maxRequests: 1000,  // Number of requests to send
    concurrency: 100,   // Number of concurrent requests
};

loadtest.loadTest(options, function(error, result) {
    if (error) {
        console.error('Load test failed:', error);
    } else {
        console.log('Load test results:', result);
    }
});
