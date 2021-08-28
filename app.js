dashes = '<br>--------------------<br>'

function occurrence(array) {
    var result = {};
    if (array instanceof Array) { // Check if input is array.
        array.forEach(function (v, i) {
            if (!result[v]) { // Initial object property creation.
                result[v] = [i]; // Create an array for that property.
            } else { // Same occurrences found.
                result[v].push(i); // Fill the array.
            }
        });
    }
    return result;
}

//regex parts for copy past
//			playerNameRegex = "([\w+\s*\w*]*)";
//			planetRegex = " planet (\d+) in the (\d+)[,:](\d+) system";
//			lineRegx = "(\d+) ";
//			eventTick = "(\d+)[\s]E[\s]T-(\d{1,4})\s+";

function addLineNumber(text) {
    lines = text.split('\n')
    outputWithLineNumbers = ''
    i = 1
    for (line in lines) {
        outputWithLineNumbers = `${outputWithLineNumbers}${i} ${lines[line]}\n`
        i++
    }
    return outputWithLineNumbers
}

function getExploredPlanetSummary(text) {
    //explored text example
    //1 E	T-424		TIF explored planet 4 in the 232,226 system.
    explorePattern = /(\d+)[\s]E[\s]T-(\d{1,4})\s+([\w+\s*\w*]*) explored planet (\d+) in the (\d+)[,:](\d+) system/gm;
    matches = text.matchAll(explorePattern);
    exploredArray = []
    if (matches !== null) {
        for (const match of matches) {
            extractAllTheValueForLater = `${match[1]} turn:${match[2]} player:${match[3]} planet:${match[5]},${match[6]}:${match[4]}\n`
            exploredArray.push(match[3])
        }
    }
    exploredCounts = occurrence(exploredArray)    
    exploredSummary = `${dashes}Explored${dashes}`
    exploredSummary = buildReportSection(exploredCounts, exploredSummary, 'planet(s) Explored by', 'planet(s) Explored', true)
    return exploredSummary
}

function getCapturedPlanetSummary(text) {
//The forces of niceguy took planet 8 in the 72,13 system from Justin_Bieber (6362).
    capturePattern =/(\d+)[\s]SA[\s]T-(\d{1,4})\s+The forces of ([\w+\s*\w*]*) took planet (\d+) in the (\d+)[,:](\d+) system from ([\w+\s*\w*]*) .(\d+)../gm;
    matches = text.matchAll(capturePattern);
    capturedByPlayer = []
    capturedByFamily = []
    capturedfromEnemyPlayer = []
    if (matches !== null) {
        for (const match of matches) {
            capturedByPlayer.push(match[3])
            capturedfromEnemyPlayer.push(match[7])
            capturedByFamily.push(match[8])
        }
    }

    familyCounts = occurrence(capturedByFamily)
    capturedSummary = `${dashes}Captured from Family${dashes}`
    capturedSummary = buildReportSection(familyCounts, capturedSummary, 'planet(s) Captured from', 'planet(s) Captured', false)

    enemyPlayerCounts = occurrence(capturedfromEnemyPlayer)
    capturedSummary = `${capturedSummary}${dashes}Captured from player${dashes}`
    capturedSummary = buildReportSection(enemyPlayerCounts, capturedSummary, 'planet(s) Captured from', 'planet(s) Captured', false)

    playerCounts = occurrence(capturedByPlayer)
    capturedSummary = `${capturedSummary}${dashes}Captured by player${dashes}`
    capturedSummary = buildReportSection(playerCounts, capturedSummary, 'planet(s) Captured by', 'planet(s) Captured', true)

    return capturedSummary
}

function buildReportSection(array, sectionSummary, textLine1, textLine2, includeSummary = true) {
    total = 0
    if (array !== null) {
        for (const item in array) {
            sectionSummary = `${sectionSummary}${(array[item].length)} ${textLine1} ${item}<br>`
            total = total + array[item].length
        }
        if (includeSummary) {
        sectionSummary = `${sectionSummary}${dashes}${total} ${textLine2}${dashes}`
        }
    }
    return sectionSummary
}