const { spawn } = require("child_process");
const path = require("path");

function runFetchTrends() {
  return new Promise((resolve, reject) => {
    console.log("Fetching trends from Google...");

    const python = spawn("python3", [path.join(__dirname, "fetch_trends.py")], {
      cwd: __dirname,
    });

    python.stdout.on("data", (data) => {
      process.stdout.write(data.toString());
    });

    python.stderr.on("data", (data) => {
      console.error("Python error:", data.toString());
    });

    python.on("close", (code) => {
      if (code === 0) {
        console.log("Trends updated successfully.");
        resolve();
      } else {
        reject(new Error(`Python exited with code ${code}`));
      }
    });
  });
}

module.exports = runFetchTrends;
