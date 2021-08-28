export function getExploredPlanetSummary(text) {
    /*example explored text
    1 E	T-424		TIF explored planet 4 in the 232,226 system.
    */
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