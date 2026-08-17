const express = require("express");
const cors = require("cors");
const { spawn, execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());


// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
    res.json({
        message: "🚀 Code Battle Arena Backend is Running!"
    });
});


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
    res.json({
        status: "success",
        message: "Backend is working perfectly!"
    });
});


// =====================================================
// PYTHON CODE EXECUTION
// =====================================================

app.post("/api/run-python", (req, res) => {

    const code = req.body.code;

    if (!code) {
        return res.json({
            success: false,
            output: "No Python code provided."
        });
    }

    const pythonFile =
        path.join(__dirname, "run_python.py");

    const python =
        spawn("python", [pythonFile]);

    let output = "";
    let error = "";

    python.stdout.on("data", (data) => {
        output += data.toString();
    });

    python.stderr.on("data", (data) => {
        error += data.toString();
    });

    python.on("error", (err) => {

        return res.json({
            success: false,
            output: "Python execution failed: " + err.message
        });

    });

    python.on("close", (exitCode) => {

        if (error) {

            return res.json({
                success: false,
                output: error
            });

        }

        res.json({
            success: exitCode === 0,
            output: output
        });

    });

    python.stdin.write(code);
    python.stdin.end();
});


// =====================================================
// C++ CODE EXECUTION
// =====================================================

// MSYS2 UCRT64 G++ compiler
const gppPath =
    "C:\\msys64\\ucrt64\\bin\\g++.exe";


// =====================================================
// RUN C++ API
// =====================================================

app.post("/api/run-cpp", (req, res) => {

    const code = req.body.code;

    if (!code) {

        return res.json({
            success: false,
            output: "No C++ code provided."
        });

    }


    // Temporary C++ file
    const cppFile =
        path.join(__dirname, "run_cpp.cpp");


    // Temporary executable
    const exeFile =
        path.join(__dirname, "run_cpp.exe");


    // Check compiler
    if (!fs.existsSync(gppPath)) {

        return res.json({
            success: false,
            output:
                "C++ compiler not found.\n\n" +
                "Expected location:\n" +
                gppPath
        });

    }


    // Save submitted C++ code
    try {

        fs.writeFileSync(
            cppFile,
            code,
            "utf8"
        );

    } catch (error) {

        return res.json({
            success: false,
            output:
                "Unable to create C++ file:\n" +
                error.message
        });

    }


    // =================================================
    // COMPILE C++
    // =================================================

    execFile(
        gppPath,

        [
            cppFile,
            "-o",
            exeFile
        ],

        {
            timeout: 10000
        },

        (compileError, stdout, stderr) => {


            // Compilation failed
            if (compileError) {

                if (fs.existsSync(cppFile)) {
                    fs.unlinkSync(cppFile);
                }

                if (fs.existsSync(exeFile)) {
                    fs.unlinkSync(exeFile);
                }

                return res.json({

                    success: false,

                    output:
                        stderr ||
                        compileError.message

                });

            }


            // =================================================
            // RUN COMPILED PROGRAM
            // =================================================

            execFile(

                exeFile,

                [],

                {
                    timeout: 5000
                },

                (runError, runStdout, runStderr) => {


                    // Delete temporary files
                    if (fs.existsSync(cppFile)) {
                        fs.unlinkSync(cppFile);
                    }

                    if (fs.existsSync(exeFile)) {
                        fs.unlinkSync(exeFile);
                    }


                    // Runtime error
                    if (runError) {

                        return res.json({

                            success: false,

                            output:
                                runStderr ||
                                runError.message

                        });

                    }


                    // Successful execution
                    return res.json({

                        success: true,

                        output: runStdout

                    });

                }

            );

        }

    );

});


// =====================================================
// START SERVER
// =====================================================

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `🚀 Server running on http://localhost:${PORT}`
    );

});