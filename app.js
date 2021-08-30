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
    exploredPlanetList = []
    if (matches !== null) {
        for (const match of matches) {
            extractAllTheValueForLater = `${match[1]} turn:${match[2]} player:${match[3]} planet:${match[5]},${match[6]}:${match[4]}\n`
            exploredArray.push(match[3])
            exploredPlanetList.push([match[1], match[2], `${match[5]},${match[6]}:${match[4]}`]) //extract linenumber, turn, planet
        }
    }
    exploredCounts = occurrence(exploredArray)
    exploredSummary = `${dashes}Explored${dashes}`
    exploredSummary = buildReportSection(exploredCounts, exploredSummary, 'planet(s) Explored by', 'planet(s) Explored', true)
    return [exploredSummary, exploredPlanetList]
}

function getCapturedPlanetSummary(text) {
    //The forces of niceguy took planet 8 in the 72,13 system from Justin_Bieber (6362).
    capturePattern = /(\d+)[\s]SA[\s]T-(\d{1,4})\s+The forces of ([\w+\s*\w*]*) took planet (\d+) in the (\d+)[,:](\d+) system from ([\w+\s*\w*]*) .(\d+)../gm;
    matches = text.matchAll(capturePattern);
    capturedByPlayer = []
    capturedByFamily = []
    capturedfromEnemyPlayer = []
    capturedPlanetsList = []
    if (matches !== null) {
        for (const match of matches) {
            capturedByPlayer.push(match[3])
            capturedfromEnemyPlayer.push(match[7])
            capturedByFamily.push(match[8])
            capturedPlanetsList.push([match[1], match[2], `${match[5]},${match[6]}:${match[4]}`]) // extract linenumber, turn, planet
        }
    }

    familyCounts = occurrence(capturedByFamily)
    capturedSummary = `${dashes}Captured from Family${dashes}`
    capturedSummary = buildReportSection(familyCounts, capturedSummary, 'planet(s) captured from', 'planet(s) captured', false)

    enemyPlayerCounts = occurrence(capturedfromEnemyPlayer)
    capturedSummary = `${capturedSummary}${dashes}Captured from player${dashes}`
    capturedSummary = buildReportSection(enemyPlayerCounts, capturedSummary, 'planet(s) captured from', 'planet(s) captured', false)

    playerCounts = occurrence(capturedByPlayer)
    capturedSummary = `${capturedSummary}${dashes}Captured by player${dashes}`
    capturedSummary = buildReportSection(playerCounts, capturedSummary, 'planet(s) captured by', 'planet(s) captured', true)

    return [capturedSummary, capturedPlanetsList]
}

function getLostPlanetSummary(text) {
    //example
    //EA	T-96		After a brave fight our family member niceguy had to flee the planet planet 13 in the 100,10 system which was attacked by Justin_Bieber of family 6362.
    defeatPattern = /(\d+)[\s]EA[\s]T-(\d{1,4})\s+After a brave fight our family member ([\w+\s*\w*]*) had to flee the planet planet (\d+) in the (\d+)[,:](\d+) system which was attacked by ([\w+\s*\w*]*) of family (\d+)+./gm;
    matches = text.matchAll(defeatPattern);
    capturedFromPlayer = []
    capturedByFamily = []
    lostPlanets = []
    if (matches !== null) {
        for (const match of matches) {
            capturedFromPlayer.push(match[3])
            capturedByFamily.push(match[8])
            lostPlanets.push([match[1], match[2], `${match[5]},${match[6]}:${match[4]}`, match[8]]) //extract linenumber, turn, planet, family
        }
    }

    familyCounts = occurrence(capturedByFamily)
    defeatSummary = `${dashes}Family Defeats${dashes}`
    defeatSummary = buildReportSection(familyCounts, defeatSummary, 'planet(s) captured by', 'planet(s) lost', false)

    playerCounts = occurrence(capturedFromPlayer)
    defeatSummary = `${defeatSummary}${dashes}Defeats by Player${dashes}`
    defeatSummary = buildReportSection(playerCounts, defeatSummary, 'planet(s) lost by', 'planet(s) lost', true)

    return [defeatSummary, lostPlanets]
}

function getBlownUpCapturesSummary(text) {
    //example
    //SA	T-169		Zanharim attacked Mr_Hinx (6360) on planet 9 in the 68,10 system, and the heavy battle made the planet uninhabitable; an exploration ship will have to be sent there.
    destroyedPattern = /(\d+)[\s]SA[\s]T-(\d{1,4})\s+([\w+\s*\w*]*) attacked ([\w+\s*\w*]*) .(\d+). on planet (\d+) in the (\d+)[,:](\d+) system, and the heavy battle made the planet uninhabitable; an exploration ship will have to be sent there./gm;
    matches = text.matchAll(destroyedPattern);
    destroyedByPlayer = []
    destroyedFamily = []
    destroyedPlanetList = []
    if (matches !== null) {
        for (const match of matches) {
            destroyedByPlayer.push(match[3])
            destroyedFamily.push(match[5])
            destroyedPlanetList.push([match[1], match[2], `${match[6]},${match[7]}:${match[5]}`]) //extract linenumber, turn, planet
        }
    }

    familyCounts = occurrence(destroyedFamily)
    destroyedSummary = `${dashes}Captures blown against family${dashes}`
    destroyedSummary = buildReportSection(familyCounts, destroyedSummary, 'planet(s) made uninhabitable for', 'planet(s) destroyed', false)

    playerCounts = occurrence(destroyedByPlayer)
    destroyedSummary = `${destroyedSummary}${dashes}Captures blown by player${dashes}`
    destroyedSummary = buildReportSection(playerCounts, destroyedSummary, 'planet(s) made uninhabitable by', 'planet(s) destroyed', true)
    return [destroyedSummary, destroyedPlanetList]
}

function getBlownUpDefeatsSummary(text) {
    //example
    //EA	T-129		An overwhelming force from Mr_Hinx, family 6360 attacked Who's planet 4 in the 93,83 system. The defenders for Who managed to set off a nuclear blast which made the planet uninhabitable.
    destroyedDefetsPattern = /(\d+)[\s]..[\s]T-(\d{1,4})\s+An overwhelming force from ([\w+\s*\w*]*), family (\d+) attacked ([\w+\s*\w*]*).s planet (\d+) in the (\d+)[,:](\d+) system. The defenders for ([\w+\s*\w*]*).*/gm;

    matches = text.matchAll(destroyedDefetsPattern);
    destroyedEAByPlayer = []
    destroyedEAFamily = []
    destroyEAPlanetList = []
    if (matches !== null) {
        for (const match of matches) {
            destroyedEAByPlayer.push(match[5])
            destroyedEAFamily.push(match[4])
            destroyEAPlanetList.push([match[1], match[2], `${match[7]},${match[8]}:${match[6]}`,match[5]]) //extract linenumber, turn, planet, player
        }
    }

    familyCounts = occurrence(destroyedEAFamily)
    destroyedEASummary = `${dashes}Defeats blown by family${dashes}`
    destroyedEASummary = buildReportSection(familyCounts, destroyedEASummary, 'planet(s) made uninhabitable by', 'planet(s) destroyed', false)

    playerCounts = occurrence(destroyedEAByPlayer)
    destroyedEASummary = `${destroyedEASummary}${dashes}Defeats blown by player${dashes}`
    destroyedEASummary = buildReportSection(playerCounts, destroyedEASummary, 'planet(s) made uninhabitable for', 'planet(s) destroyed', true)
    return [destroyedEASummary, destroyEAPlanetList]
}

function findOpenRetakes(lostPlanets, capturedPlanets, blownUpCapturesPlanets) {
    openRetakeList = `${dashes}OPEN RETAKES${dashes}`
    openRetakes = []
    //97,82:3 (#6360, lost Tick 171)
    match = false
    for (let i = 0; i < lostPlanets.length; i++) {
        for (let j = 0; j < capturedPlanets.length; j++) {
            if ((lostPlanets[i][2] === capturedPlanets[j][2]) && (capturedPlanets[j][0] < lostPlanets[i][0])) {
                match = true;
                break;
            }
        }
        for (let k = 0; k < blownUpCapturesPlanets.length; k++) {
            if ((lostPlanets[i][2] === blownUpCapturesPlanets[k][2]) && (blownUpCapturesPlanets[k][0] < lostPlanets[i][0])) {
                match = true;
                break;
            }
        }
        if (!match) {
            openRetakes.push(lostPlanets[i])
            openRetakeList = `${openRetakeList}${lostPlanets[i][2]} (${lostPlanets[i][3]}), lost Tick ${lostPlanets[i][1]}<br>`
        }
        match = false
    }
    openRetakeList = `${openRetakeList}${dashes}Total Missing ${openRetakes.length}${dashes}`
    openRetakeCleanList = `${dashes}Retake List${dashes}`
    for  (let i = 0; i < openRetakes.length; i++) {
        openRetakeCleanList = `${openRetakeCleanList}${lostPlanets[i][2]}<br>`
    }
    return [openRetakeList, openRetakeCleanList]
}

    function findOutstandingBlowPLanets(blownUpDefeatsPlanets, exploredPlanetList, capturedPlanets) {
        blownUpList = `${dashes}List of destroyed planets, not re-explored or retaken${dashes}`
        match = false
        for (let i = 0; i < blownUpDefeatsPlanets.length; i++) {
            for (let j = 0; j < capturedPlanets.length; j++) {
                if ((blownUpDefeatsPlanets[i][2] === capturedPlanets[j][2]) && (capturedPlanets[j][0] < blownUpDefeatsPlanets[i][0])) {
                    match = true;
                    break;
                }
            }
            for (let k = 0; k < exploredPlanetList.length; k++) {
                if ((blownUpDefeatsPlanets[i][2] === exploredPlanetList[k][2]) && (exploredPlanetList[k][0] < blownUpDefeatsPlanets[i][0])) {
                    match = true;
                    break;
                }
            }
            if (!match) {
                openRetakes.push(blownUpDefeatsPlanets[i])
                blownUpList = `${blownUpList}${blownUpDefeatsPlanets[i][2]} (${blownUpDefeatsPlanets[i][3]}), lost Tick ${blownUpDefeatsPlanets[i][1]}<br>`
            }
            match = false
        }
        return [blownUpList]

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