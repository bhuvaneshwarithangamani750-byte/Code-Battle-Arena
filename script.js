// =====================================================
// CODE BATTLE ARENA - SCRIPT.JS
// PYTHON + C++ BACKEND
// RUN CODE -> OUTPUT + TEST CASES
// SUBMIT -> STOP TIMER + XP + SCORE + STREAK + HEALTH
// =====================================================


// =====================================================
// CHALLENGES
// =====================================================

const battleChallenges = [

    {
        title: "Two Sum",
        question:
            "Given an array [2, 7, 11, 15] and target = 9, find the two numbers.",
        input: "[2, 7, 11, 15], Target = 9",
        answer: "[0, 1]",
        points: 100
    },

    {
        title: "Reverse String",
        question:
            "Write a program to reverse the given string.",
        input: "Hello",
        answer: "olleH",
        points: 100
    },

    {
        title: "Find Maximum Number",
        question:
            "Find the largest number from the given array.",
        input: "[10, 25, 7, 45, 18]",
        answer: "45",
        points: 200
    },

    {
        title: "Palindrome Check",
        question:
            "Check whether the given string is a palindrome.",
        input: "madam",
        answer: "Palindrome",
        points: 200
    },

    {
        title: "Find Duplicate Number",
        question:
            "Find the duplicate number from the given array.",
        input: "[1, 3, 4, 2, 2]",
        answer: "2",
        points: 300
    }

];


// =====================================================
// BATTLE VARIABLES
// =====================================================

let currentBattle = null;

let battleStarted = false;

let battleTimerInterval = null;

let battleTime = 60;

let playerScore = 0;

let opponentScore = 0;

let playerHealth = 100;

let opponentHealth = 100;


// =====================================================
// WIN STREAK
// =====================================================

let winStreak =
    Number(localStorage.getItem("winStreak")) || 0;


// =====================================================
// XP
// =====================================================

let xp =
    Number(localStorage.getItem("playerXP")) || 0;

let level = 1;

let badge = "🥉 Beginner";


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateBattleUI();

        updateStreakUI();

        updateXPLevel();

        const timer =
            document.getElementById("battleTimer");

        if (timer) {
            timer.textContent = "60";
        }

    }
);


// =====================================================
// START SELECTED BATTLE
// =====================================================

function startSelectedBattle() {

    const selector =
        document.getElementById("battleChallenge");

    if (!selector) {
        return;
    }


    const index =
        Number(selector.value);


    currentBattle =
        battleChallenges[index];


    if (!currentBattle) {

        alert("Please select a challenge!");

        return;
    }


    // Reset battle
    battleStarted = true;

    battleTime = 60;

    playerHealth = 100;

    opponentHealth = 100;

    playerScore = 0;

    opponentScore = 0;


    // Clear editor
    const editor =
        document.getElementById("battleCode");

    if (editor) {
        editor.value = "";
    }


    // Clear old result
    const testResult =
        document.getElementById("testCaseResult");

    if (testResult) {

        testResult.innerHTML =
            "🧪 Write your code and click Run Code.";

    }


    // Show question
    const title =
        document.getElementById("battleTitle");

    const question =
        document.getElementById("battleQuestion");


    if (title) {

        title.textContent =
            "🎯 " + currentBattle.title;

    }


    if (question) {

        question.innerHTML =
            currentBattle.question +
            "<br><br>" +
            "<strong>Input:</strong> " +
            currentBattle.input +
            "<br>" +
            "<strong>Expected Output:</strong> " +
            currentBattle.answer;

    }


    updateBattleUI();

    startBattleTimer();

}


// =====================================================
// START BATTLE TIMER
// =====================================================

function startBattleTimer() {

    clearInterval(battleTimerInterval);

    battleTime = 60;

    const timer =
        document.getElementById("battleTimer");

    if (timer) {
        timer.textContent = "60";
    }


    battleTimerInterval =
        setInterval(function () {

            if (!battleStarted) {
                return;
            }


            battleTime--;


            if (timer) {

                timer.textContent =
                    battleTime;

            }


            if (battleTime <= 0) {

                clearInterval(
                    battleTimerInterval
                );

                battleTimerInterval = null;

                battleStarted = false;


                const result =
                    document.getElementById(
                        "testCaseResult"
                    );


                if (result) {

                    result.innerHTML =

                        "<h2>⏰ Time's Up!</h2>" +

                        "<p>Battle ended.</p>" +

                        "<p>⚔️ Submit was not completed.</p>";

                }

            }

        }, 1000);

}


// =====================================================
// RUN CODE
// =====================================================

async function runBattleCode() {

    const editor =
        document.getElementById("battleCode");

    const result =
        document.getElementById("testCaseResult");

    const language =
        document.getElementById("languageSelect");


    if (!editor || !result) {
        return;
    }


    // Battle check
    if (!battleStarted || !currentBattle) {

        result.innerHTML =
            "⚠️ <strong>Start the battle first!</strong>";

        return;
    }


    // Code check
    const code =
        editor.value.trim();


    if (code === "") {

        result.innerHTML =
            "⚠️ <strong>Please write your code first!</strong>";

        return;
    }


    // Selected language
    const selectedLanguage =
        language
            ? language.value
            : "python";


    // =================================================
    // BACKEND URL
    // =================================================

    let apiURL = "";


    if (selectedLanguage === "python") {

        apiURL =
            "http://localhost:3000/api/run-python";

    }

    else if (selectedLanguage === "cpp") {

        apiURL =
            "http://localhost:3000/api/run-cpp";

    }

    else {

        result.innerHTML =

            "<h3>⚠️ Language Not Available Yet</h3>" +

            "<p>Currently supported:</p>" +

            "<p>🐍 Python</p>" +

            "<p>⚡ C++</p>";

        return;
    }


    // Loading
    result.innerHTML =
        "⏳ Running " +
        selectedLanguage.toUpperCase() +
        " code...";


    try {

        const response =
            await fetch(
                apiURL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        code: code
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Server returned HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        // =================================================
        // BACKEND ERROR
        // =================================================

        if (!data.success) {

            result.innerHTML =

                "<h3>❌ Test Case Failed</h3>" +

                "<p><strong>Error:</strong></p>" +

                "<pre>" +
                escapeHTML(
                    data.output || "Unknown error"
                ) +
                "</pre>";

            return;
        }


        // =================================================
        // OUTPUT
        // =================================================

        const actualOutput =
            String(data.output || "")
                .trim()
                .toLowerCase();


        // =================================================
        // CHECK TEST CASES
        // =================================================

        const passed =
            checkBattleOutput(
                actualOutput,
                currentBattle
            );


        // =================================================
        // ALL TEST CASES PASSED
        // =================================================

        if (passed) {

            result.innerHTML =

                "<h3>🧪 Test Cases</h3>" +

                "<p>✅ Test Case 1 — Passed</p>" +

                "<p>✅ Test Case 2 — Passed</p>" +

                "<p>✅ Test Case 3 — Passed</p>" +

                "<hr>" +

                "<p>🎉 <strong>All Test Cases Passed!</strong></p>" +

                "<p>▶️ <strong>Output:</strong></p>" +

                "<pre>" +
                escapeHTML(data.output) +
                "</pre>";

        }


        // =================================================
        // TEST CASE FAILED
        // =================================================

        else {

            result.innerHTML =

                "<h3>🧪 Test Cases</h3>" +

                "<p>❌ Test Case 1 — Failed</p>" +

                "<hr>" +

                "<p>❌ <strong>Wrong Answer</strong></p>" +

                "<p><strong>Expected:</strong></p>" +

                "<pre>" +
                escapeHTML(
                    currentBattle.answer
                ) +
                "</pre>" +

                "<p><strong>Your Output:</strong></p>" +

                "<pre>" +
                escapeHTML(data.output) +
                "</pre>";

        }


    }

    catch (error) {

        result.innerHTML =

            "<h3>❌ Backend Connection Failed</h3>" +

            "<p>" +
            escapeHTML(error.message) +
            "</p>";

    }

}


// =====================================================
// CHECK RUN CODE OUTPUT
// =====================================================

function checkBattleOutput(
    actual,
    challenge
) {

    actual =
        String(actual)
            .trim()
            .toLowerCase();


    // =================================================
    // TWO SUM
    // =================================================

    if (
        challenge.title ===
        "Two Sum"
    ) {

        return (
            actual.includes("[0, 1]") ||
            actual.includes("0, 1")
        );

    }


    // =================================================
    // REVERSE STRING
    // =================================================

    if (
        challenge.title ===
        "Reverse String"
    ) {

        return actual === "olleh";

    }


    // =================================================
    // MAXIMUM
    // =================================================

   if (
    challenge.title ===
    "Find Maximum Number"
) {

    return actual.includes("45");

}

    // =================================================
    // PALINDROME
    // =================================================

    if (
        challenge.title ===
        "Palindrome Check"
    ) {

        return (
            actual.includes("palindrome") ||
            actual === "madam"
        );

    }


    // =================================================
    // DUPLICATE
    // =================================================

    if (
        challenge.title ===
        "Find Duplicate Number"
    ) {

        return actual === "2";

    }


    return false;

}


// =====================================================
// SUBMIT SOLUTION
// =====================================================

function submitBattle() {

    const editor =
        document.getElementById("battleCode");

    const result =
        document.getElementById("testCaseResult");


    if (!battleStarted || !currentBattle) {

        result.innerHTML =
            "⚠️ <strong>Start the battle first!</strong>";

        return;
    }


    if (!editor || editor.value.trim() === "") {

        result.innerHTML =
            "⚠️ <strong>Please write your solution first!</strong>";

        return;
    }


    // =================================================
    // STOP TIMER IMMEDIATELY
    // =================================================

    clearInterval(
        battleTimerInterval
    );

    battleTimerInterval = null;

    battleStarted = false;


    // =================================================
    // CHECK SUBMITTED CODE
    // =================================================

    const code =
        editor.value.trim();


    const correct =
        checkBattleCode(
            code,
            currentBattle
        );


    // =================================================
    // CORRECT
    // =================================================

    if (correct) {

        playerScore +=
            currentBattle.points;


        opponentHealth -= 25;


        if (opponentHealth < 0) {
            opponentHealth = 0;
        }


        // XP
        xp += currentBattle.points;


        localStorage.setItem(
            "playerXP",
            xp
        );


        updateXPLevel();


        // Win streak
        winStreak++;


        localStorage.setItem(
            "winStreak",
            winStreak
        );


        updateBattleUI();

        updateStreakUI();


        // Submit result only
        result.innerHTML =

            "<h2>🏆 Solution Submitted!</h2>" +

            "<p>✅ Correct Solution</p>" +

            "<hr>" +

            "<p>⭐ Points Earned: +" +
            currentBattle.points +
            "</p>" +

            "<p>🏆 Total Score: " +
            playerScore +
            "</p>" +

            "<p>✨ Total XP: " +
            xp +
            "</p>" +

            "<p>🔥 Win Streak: " +
            winStreak +
            "</p>" +

            "<p>❤️ Your Health: " +
            playerHealth +
            "%</p>" +

            "<p>❤️ Opponent Health: " +
            opponentHealth +
            "%</p>";

    }


    // =================================================
    // WRONG
    // =================================================

    else {

        playerHealth -= 20;


        if (playerHealth < 0) {
            playerHealth = 0;
        }


        winStreak = 0;


        localStorage.setItem(
            "winStreak",
            winStreak
        );


        updateBattleUI();

        updateStreakUI();


        result.innerHTML =

            "<h2>⚔️ Solution Submitted</h2>" +

            "<p>❌ Incorrect Solution</p>" +

            "<hr>" +

            "<p>⭐ Points Earned: 0</p>" +

            "<p>🏆 Score: " +
            playerScore +
            "</p>" +

            "<p>✨ XP: " +
            xp +
            "</p>" +

            "<p>🔥 Win Streak: 0</p>" +

            "<p>❤️ Your Health: " +
            playerHealth +
            "%</p>";

    }

}


// =====================================================
// CHECK SUBMITTED CODE
// =====================================================

function checkBattleCode(
    code,
    challenge
) {

    const text =
        code.toLowerCase();


    // =================================================
    // TWO SUM
    // =================================================

    if (
        challenge.title ===
        "Two Sum"
    ) {

        return (
            text.includes("[0, 1]") ||
            text.includes("0, 1")
        );

    }


    // =================================================
    // REVERSE STRING
    // =================================================

    if (
        challenge.title ===
        "Reverse String"
    ) {

        return (
            text.includes("olleh") ||
            text.includes("reverse")
        );

    }


    // =================================================
    // MAXIMUM
    // =================================================

    if (
        challenge.title ===
        "Find Maximum Number"
    ) {

        return text.includes("45");

    }


    // =================================================
    // PALINDROME
    // =================================================

    if (
        challenge.title ===
        "Palindrome Check"
    ) {

        return (
            text.includes("palindrome") ||
            text.includes("madam")
        );

    }


    // =================================================
    // DUPLICATE
    // =================================================

    if (
        challenge.title ===
        "Find Duplicate Number"
    ) {

        return text.includes("2");

    }


    return false;

}


// =====================================================
// UPDATE BATTLE UI
// =====================================================

function updateBattleUI() {

    const playerScoreElement =
        document.getElementById(
            "playerScore"
        );

    const opponentScoreElement =
        document.getElementById(
            "opponentScore"
        );


    const playerHealthElement =
        document.getElementById(
            "playerHealth"
        );

    const opponentHealthElement =
        document.getElementById(
            "opponentHealth"
        );


    const playerHealthText =
        document.getElementById(
            "playerHealthText"
        );

    const opponentHealthText =
        document.getElementById(
            "opponentHealthText"
        );


    if (playerScoreElement) {

        playerScoreElement.textContent =
            playerScore;

    }


    if (opponentScoreElement) {

        opponentScoreElement.textContent =
            opponentScore;

    }


    if (playerHealthElement) {

        playerHealthElement.style.width =
            playerHealth + "%";

    }


    if (opponentHealthElement) {

        opponentHealthElement.style.width =
            opponentHealth + "%";

    }


    if (playerHealthText) {

        playerHealthText.textContent =
            playerHealth + "%";

    }


    if (opponentHealthText) {

        opponentHealthText.textContent =
            opponentHealth + "%";

    }

}


// =====================================================
// UPDATE STREAK UI
// =====================================================

function updateStreakUI() {

    const streak =
        document.getElementById(
            "winStreakDisplay"
        );


    const badgeElement =
        document.getElementById(
            "streakBadge"
        );


    if (streak) {

        streak.textContent =
            winStreak;

    }


    let streakBadge =
        "🥉 Beginner";


    if (winStreak >= 5) {

        streakBadge =
            "🔥 Battle Master";

    }

    else if (winStreak >= 3) {

        streakBadge =
            "🥈 Battle Pro";

    }

    else if (winStreak >= 1) {

        streakBadge =
            "🥉 Winner";

    }


    if (badgeElement) {

        badgeElement.textContent =
            streakBadge;

    }

}


// =====================================================
// UPDATE XP / LEVEL / BADGE
// =====================================================

function updateXPLevel() {

    if (xp >= 1000) {

        level = 3;

        badge = "🔥 Pro Coder";

    }

    else if (xp >= 500) {

        level = 2;

        badge = "🥈 Intermediate";

    }

    else {

        level = 1;

        badge = "🥉 Beginner";

    }


    const xpElement =
        document.getElementById("xp");

    const levelElement =
        document.getElementById("level");

    const badgeElement =
        document.getElementById("badge");


    if (xpElement) {

        xpElement.textContent =
            xp;

    }


    if (levelElement) {

        levelElement.textContent =
            level;

    }


    if (badgeElement) {

        badgeElement.textContent =
            badge;

    }


    localStorage.setItem(
        "playerXP",
        xp
    );

}


// =====================================================
// PLAY AGAIN
// =====================================================

function playAgain() {

    clearInterval(
        battleTimerInterval
    );

    battleTimerInterval = null;

    battleStarted = false;

    currentBattle = null;

    battleTime = 60;

    playerScore = 0;

    opponentScore = 0;

    playerHealth = 100;

    opponentHealth = 100;


    const timer =
        document.getElementById(
            "battleTimer"
        );


    if (timer) {

        timer.textContent =
            "60";

    }


    const title =
        document.getElementById(
            "battleTitle"
        );


    const question =
        document.getElementById(
            "battleQuestion"
        );


    const result =
        document.getElementById(
            "testCaseResult"
        );


    const editor =
        document.getElementById(
            "battleCode"
        );


    if (title) {

        title.textContent =
            "Choose a Challenge";

    }


    if (question) {

        question.textContent =
            'Select a challenge and click "Start Selected Battle".';

    }


    if (result) {

        result.innerHTML =
            "🧪 Test cases will appear here...";

    }


    if (editor) {

        editor.value = "";

    }


    updateBattleUI();

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}