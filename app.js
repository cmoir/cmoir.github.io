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
    counts = occurrence(exploredArray)
    dashes = '<br>--------------------<br>'
    exploredSummary = `${dashes}Explored${dashes}`
    total = 0
    if (counts !== null) {
        for (const player in counts) {
            exploredSummary = `${exploredSummary}${(counts[player].length)} planet(s) Explored by ${player}<br>`
            total = total + counts[player].length
        }
        exploredSummary = `${exploredSummary}${dashes}${total} planet(s) Explored${dashes}`
    }
    return exploredSummary
}

