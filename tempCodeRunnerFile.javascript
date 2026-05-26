process.stdin.resume();
process.stdin.setEncoding("utf-8");

let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => solve(input.trim()));