dashes = "<br>--------------------<br>";
doc =
  '<!DOCTYPE html><html><head><link REL=STYLESHEET HREF="ic.css" TYPE="text/css"></head><body>';
var playerList = new Set();
var ememyFamilyList = new Set();
var capturedPanetsArray = [];
var byPlayerDict = {};
var byFamilyDict = {};

function analyse() {
  text = document.getElementById("news").value;
  text = addLineNumber(text);

  exploredPlanetList = getExploredPlanetSummary(text);
  capturedPlanets = getCapturedPlanetSummary(text);
  lostPlanets = getLostPlanetSummary(text);
  blownUpCapturesPlanets = getBlownUpCapturesSummary(text);
  blownUpDefeatsTemp = getBlownUpDefeatsSummary(text);
  report = blownUpDefeatsTemp[0];
  blownUpDefeatsPlanets = blownUpDefeatsTemp[1];
  report = report + getAidSummary(text);

  openRetakeTemp = findOpenRetakes(
    lostPlanets,
    capturedPlanets,
    blownUpCapturesPlanets
  );
  openRetakeCleanList = openRetakeTemp[1];
  report = report + openRetakeTemp[0];
  report =
    report +
    findOutstandingBlowPLanets(
      blownUpDefeatsPlanets,
      exploredPlanetList,
      capturedPlanets
    );

  return [report, openRetakeCleanList];
}

function getExploredPlanetSummary(text) {
  //explored text example
  //1 E	T-424		TIF explored planet 4 in the 232,226 system.
  //			playerNameRegex = "([\w+\s*\w*]*)";
  //			planetRegex = " planet (\d+) in the (\d+)[,:](\d+) system";
  //			lineRegx = "(\d+) ";
  //			eventTick = "(\d+)[\s]E[\s]T-(\d{1,4})\s+";
  explorePattern =
    /(\d+)[\s]E[\s]T-(\d{1,4})\s+([\w+\s*\w*]*) explored planet (\d+) in the (\d+)[,:](\d+) system/gm;
  matches = text.matchAll(explorePattern);
  exploredArray = [];
  exploredPlanetList = [];
  if (matches !== null) {
    for (const match of matches) {
      extractAllTheValueForLater = `${match[1]} turn:${match[2]} player:${match[3]} planet:${match[5]},${match[6]}:${match[4]}\n`;
      exploredArray.push(match[3]);
      exploredPlanetList.push([
        match[1],
        match[2],
        `${match[5]},${match[6]}:${match[4]}`,
      ]); //extract linenumber, turn, planet
    }
  }

  exploredCounts = occurrence(exploredArray);
  for (const player in exploredCounts) {
    playerList.add(player);
    byPlayerDict[player] = [exploredCounts[player].length, 0, 0, 0, 0];
  }
  console.log(byPlayerDict);

  return exploredPlanetList;
}

function getCapturedPlanetSummary(text) {
  //The forces of niceguy took planet 8 in the 72,13 system from Justin_Bieber (6362).
  capturePattern =
    /(\d+)[\s]SA[\s]T-(\d{1,4})\s+The forces of ([\w+\s*\w*]*) took planet (\d+) in the (\d+)[,:](\d+) system from ([\w+\s*\w*]*) .(\d+)../gm;
  matches = text.matchAll(capturePattern);
  capturedByPlayer = [];
  capturedByFamily = [];
  capturedfromEnemyPlayer = [];
  capturedPlanetsList = [];
  if (matches !== null) {
    for (const match of matches) {
      capturedByPlayer.push(match[3]);
      capturedfromEnemyPlayer.push(match[7]);
      capturedByFamily.push(match[8]);
      capturedPlanetsList.push([
        match[1],
        match[2],
        `${match[5]},${match[6]}:${match[4]}`,
      ]);
      player = match[2];
    }
  }

  familyCounts = occurrence(capturedByFamily);
  for (const family in familyCounts) {
    ememyFamilyList.add(family);
    byFamilyDict[family] = [familyCounts[family].length, 0, 0, 0];
  }

  playerCounts = occurrence(capturedByPlayer);
  for (const player in playerCounts) {
    if (playerList.has(player)) {
      byPlayerDict[player] = [
        byPlayerDict[player][0],
        playerCounts[player].length,
        0,
        0,
        0,
      ];
    } else {
      playerList.add(player);
      byPlayerDict[player] = [0, playerCounts[player].length, 0, 0, 0];
    }
  }
  console.log(byPlayerDict);
  return capturedPlanetsList;
}

function getLostPlanetSummary(text) {
  //example
  //EA	T-96		After a brave fight our family member niceguy had to flee the planet planet 13 in the 100,10 system which was attacked by Justin_Bieber of family 6362.
  defeatPattern =
    /(\d+)[\s]EA[\s]T-(\d{1,4})\s+After a brave fight our family member ([\w+\s*\w*]*) had to flee the planet planet (\d+) in the (\d+)[,:](\d+) system which was attacked by ([\w+\s*\w*]*) of family (\d+)+./gm;
  matches = text.matchAll(defeatPattern);
  capturedFromPlayer = [];
  capturedByFamily = [];
  lostPlanets = [];
  if (matches !== null) {
    for (const match of matches) {
      capturedFromPlayer.push(match[3]);
      capturedByFamily.push(match[8]);
      lostPlanets.push([
        match[1],
        match[2],
        `${match[5]},${match[6]}:${match[4]}`,
        match[8],
      ]); //extract linenumber, turn, planet, family
    }
  }

  familyCounts = occurrence(capturedByFamily);

  for (const family in familyCounts) {
    if (ememyFamilyList.has(family)) {
      byFamilyDict[family] = [
        byFamilyDict[family][0],
        familyCounts[family].length,
        0,
        0,
      ];
    } else {
      ememyFamilyList.add(family);
      byFamilyDict[family] = [0, familyCounts[family].length, 0, 0];
    }
  }

  playerCounts = occurrence(capturedFromPlayer);
  for (const player in playerCounts) {
    if (playerList.has(player)) {
      byPlayerDict[player] = [
        byPlayerDict[player][0],
        byPlayerDict[player][1],
        playerCounts[player].length,
        0,
        0,
      ];
    } else {
      playerList.add(player);
      byPlayerDict[player] = [0, 0, playerCounts[player].length, 0, 0];
    }
  }
  return lostPlanets;
}

function getBlownUpCapturesSummary(text) {
  //example
  //SA	T-169		Zanharim attacked Mr_Hinx (6360) on planet 9 in the 68,10 system, and the heavy battle made the planet uninhabitable; an exploration ship will have to be sent there.
  destroyedPattern =
    /(\d+)[\s]SA[\s]T-(\d{1,4})\s+([\w+\s*\w*]*) attacked ([\w+\s*\w*]*) .(\d+). on planet (\d+) in the (\d+)[,:](\d+) system, and the heavy battle made the planet uninhabitable; an exploration ship will have to be sent there./gm;
  matches = text.matchAll(destroyedPattern);
  destroyedByPlayer = [];
  destroyedFamily = [];
  destroyedPlanetList = [];
  if (matches !== null) {
    for (const match of matches) {
      destroyedByPlayer.push(match[3]);
      destroyedFamily.push(match[5]);
      destroyedPlanetList.push([
        match[1],
        match[2],
        `${match[6]},${match[7]}:${match[5]}`,
      ]); //extract linenumber, turn, planet
    }
  }

  familyCounts = occurrence(destroyedFamily);
  for (const family in familyCounts) {
    if (ememyFamilyList.has(family)) {
      byFamilyDict[family] = [
        byFamilyDict[family][0],
        byFamilyDict[family][1],
        familyCounts[family].length,
        0,
      ];
    } else {
      ememyFamilyList.add(family);
      byFamilyDict[family] = [0, 0, familyCounts[family].length, 0];
    }
  }

  playerCounts = occurrence(destroyedByPlayer);
  for (const player in playerCounts) {
    if (playerList.has(player)) {
      byPlayerDict[player] = [
        byPlayerDict[player][0],
        byPlayerDict[player][1],
        byPlayerDict[player][2],
        playerCounts[player].length,
        0,
      ];
    } else {
      playerList.add(player);
      byPlayerDict[player] = [0, 0, 0, playerCounts[player].length, 0];
    }
  }

  return destroyedPlanetList;
}

function getBlownUpDefeatsSummary(text) {
  //example
  //EA	T-129		An overwhelming force from Mr_Hinx, family 6360 attacked Who's planet 4 in the 93,83 system. The defenders for Who managed to set off a nuclear blast which made the planet uninhabitable.
  destroyedDefetsPattern =
    /(\d+)[\s]..[\s]T-(\d{1,4})\s+An overwhelming force from ([\w+\s*\w*]*), family (\d+) attacked ([\w+\s*\w*]*).s planet (\d+) in the (\d+)[,:](\d+) system. The defenders for ([\w+\s*\w*]*).*/gm;

  matches = text.matchAll(destroyedDefetsPattern);
  destroyedEAByPlayer = [];
  destroyedEAFamily = [];
  destroyEAPlanetList = [];
  if (matches !== null) {
    for (const match of matches) {
      destroyedEAByPlayer.push(match[5]);
      destroyedEAFamily.push(match[4]);
      destroyEAPlanetList.push([
        match[1],
        match[2],
        `${match[7]},${match[8]}:${match[6]}`,
        match[5],
      ]); //extract linenumber, turn, planet, player
    }
  }

  familyCounts = occurrence(destroyedEAFamily);
  for (const family in familyCounts) {
    if (ememyFamilyList.has(family)) {
      byFamilyDict[family] = [
        byFamilyDict[family][0],
        byFamilyDict[family][1],
        byFamilyDict[family][2],
        familyCounts[family].length,
      ];
    } else {
      ememyFamilyList.add(family);
      byFamilyDict[family] = [0, 0, 0, familyCounts[family].length];
    }
  }

  playerCounts = occurrence(destroyedEAByPlayer);
  console.log(byPlayerDict);
  for (const player in playerCounts) {
    if (playerList.has(player)) {
      byPlayerDict[player] = [
        byPlayerDict[player][0],
        byPlayerDict[player][1],
        byPlayerDict[player][2],
        byPlayerDict[player][3],
        playerCounts[player].length,
      ];
    } else {
      playerList.add(player);
      byPlayerDict[player] = [0, 0, 0, 0, playerCounts[player].length];
    }
  }
  console.log(byPlayerDict);
  return [buildCombatSummary(), destroyEAPlanetList];
}

function findOpenRetakes(lostPlanets, capturedPlanets, blownUpCapturesPlanets) {
  openRetakeList = `${dashes}OPEN RETAKES${dashes}`;
  openRetakes = [];
  //97,82:3 (#6360, lost Tick 171)
  match = false;
  for (let i = 0; i < lostPlanets.length; i++) {
    for (let j = 0; j < capturedPlanets.length; j++) {
      if (
        lostPlanets[i][2] === capturedPlanets[j][2] &&
        capturedPlanets[j][0] < lostPlanets[i][0]
      ) {
        match = true;
        break;
      }
    }
    for (let k = 0; k < blownUpCapturesPlanets.length; k++) {
      if (
        lostPlanets[i][2] === blownUpCapturesPlanets[k][2] &&
        blownUpCapturesPlanets[k][0] < lostPlanets[i][0]
      ) {
        match = true;
        break;
      }
    }
    if (!match) {
      openRetakes.push(lostPlanets[i]);
      openRetakeList = `${openRetakeList}${lostPlanets[i][2]} (${lostPlanets[i][3]}), lost Tick ${lostPlanets[i][1]}<br>`;
    }
    match = false;
  }
  openRetakeList = `${openRetakeList}${dashes}Total Missing ${openRetakes.length}${dashes}`;
  openRetakeCleanList = "";
  for (let i = 0; i < openRetakes.length; i++) {
    openRetakeCleanList = `${openRetakeCleanList}${lostPlanets[i][2]}\n`;
  }
  return [openRetakeList, openRetakeCleanList];
}

function findOutstandingBlowPLanets(
  blownUpDefeatsPlanets,
  exploredPlanetList,
  capturedPlanets
) {
  blownUpList = `${dashes}List of destroyed planets, not re-explored or retaken${dashes}`;
  match = false;
  for (let i = 0; i < blownUpDefeatsPlanets.length; i++) {
    for (let j = 0; j < capturedPlanets.length; j++) {
      if (
        blownUpDefeatsPlanets[i][2] === capturedPlanets[j][2] &&
        capturedPlanets[j][0] < blownUpDefeatsPlanets[i][0]
      ) {
        match = true;
        break;
      }
    }
    for (let k = 0; k < exploredPlanetList.length; k++) {
      if (
        blownUpDefeatsPlanets[i][2] === exploredPlanetList[k][2] &&
        exploredPlanetList[k][0] < blownUpDefeatsPlanets[i][0]
      ) {
        match = true;
        break;
      }
    }
    if (!match) {
      openRetakes.push(blownUpDefeatsPlanets[i]);
      blownUpList = `${blownUpList}${blownUpDefeatsPlanets[i][2]} (${blownUpDefeatsPlanets[i][3]}), lost Tick ${blownUpDefeatsPlanets[i][1]}<br>`;
    }
    match = false;
  }
  return blownUpList;
}

function getAidSummary(text) {
  resources = ["Cash", "Endurium", "Food", "Iron", "Octarine"];

  //get all the aid info add to aidSummaryArray
  aidPattern1 =
    /(\d+)[\s]A[\s]T-(\d{1,4})\s+In the name of family cooperation ([\w+\s*\w*]*) has sent a shipment of (\d+) (\w+) .*to ([\w+\s*\w*]*)./gm;
  aidPattern2 =
    /(\d+)[\s]A[\s]T-(\d{1,4})\s+In the name of family cooperation ([\w+\s*\w*]*) has sent a shipment of \d+ \w+ (\d+) (\w+) .*to ([\w+\s*\w*]*)./gm;
  aidPattern3 =
    /(\d+)[\s]A[\s]T-(\d{1,4})\s+In the name of family cooperation ([\w+\s*\w*]*) has sent a shipment of \d+ \w+ \d+ \w+ (\d+) (\w+) .*to ([\w+\s*\w*]*)./gm;
  aidPattern4 =
    /(\d+)[\s]A[\s]T-(\d{1,4})\s+In the name of family cooperation ([\w+\s*\w*]*) has sent a shipment of \d+ \w+ \d+ \w+ \d+ \w+ (\d+) (\w+) .*to ([\w+\s*\w*]*)./gm;
  aidPattern5 =
    /(\d+)[\s]A[\s]T-(\d{1,4})\s+In the name of family cooperation ([\w+\s*\w*]*) has sent a shipment of \d+ \w+ \d+ \w+ \d+ \w+ \d+ \w+ (\d+) (\w+) to ([\w+\s*\w*]*)./gm;
  aidSummmaryArray = [];
  aidPattern1Matches = text.matchAll(aidPattern1);
  if (aidPattern1Matches !== null) {
    for (const match of aidPattern1Matches) {
      aidSummmaryArray.push([match[3], match[6], match[4], match[5]]); //extract: sending player, receiving player, amount, resource
    }
  }
  aidPattern2Matches = text.matchAll(aidPattern2);
  if (aidPattern2Matches !== null) {
    for (const match of aidPattern2Matches) {
      aidSummmaryArray.push([match[3], match[6], match[4], match[5]]);
    }
  }
  aidPattern3Matches = text.matchAll(aidPattern3);
  if (aidPattern3Matches !== null) {
    for (const match of aidPattern3Matches) {
      aidSummmaryArray.push([match[3], match[6], match[4], match[5]]);
    }
  }
  aidPattern4Matches = text.matchAll(aidPattern4);
  if (aidPattern4Matches !== null) {
    for (const match of aidPattern4Matches) {
      aidSummmaryArray.push([match[3], match[6], match[4], match[5]]);
    }
  }
  aidPattern5Matches = text.matchAll(aidPattern5);
  if (aidPattern5Matches !== null) {
    for (const match of aidPattern5Matches) {
      aidSummmaryArray.push([match[3], match[6], match[4], match[5]]);
    }
  }

  if (aidSummmaryArray === []) {
    //exit aid section, no aid records in news
    return `${dashes}Not Aid Sent or Received${dashes}`;
  }
  //get player list
  addPlayerNames(aidSummmaryArray, 0);
  addPlayerNames(aidSummmaryArray, 3);
  //resources = ['Cash', 'Endurium', 'Food', 'Iron', 'Octarine']
  sendAidArray = {};
  receivedAidArray = {};
  //build dict with array of 0 values with player lookpup
  for (player of playerList.values()) {
    sendAidArray[player] = [0, 0, 0, 0, 0];
    receivedAidArray[player] = [0, 0, 0, 0, 0];
  }

  for (item in aidSummmaryArray) {
    switch (aidSummmaryArray[item][3]) {
      case "Cash":
        player = aidSummmaryArray[item][0];
        currentAmount = sendAidArray[player][0];
        sendAidArray[player][0] =
          Number(currentAmount) + Number(aidSummmaryArray[item][2]);

        playerReceived = aidSummmaryArray[item][1];
        currentAmount = receivedAidArray[playerReceived][0];
        receivedAidArray[playerReceived][0] =
          Number(currentAmount) + Number(aidSummmaryArray[item][2]);
        break;
      case "Endurium":
        player = aidSummmaryArray[item][0];
        currentAmount = sendAidArray[player][1];
        sendAidArray[player][1] =
          Number(currentAmount) + Number(aidSummmaryArray[item][2]);

        playerReceived = aidSummmaryArray[item][1];
        currentAmount = receivedAidArray[playerReceived][1];
        receivedAidArray[playerReceived][1] =
          Number(currentAmount) + Number(aidSummmaryArray[item][2]);
        break;
      case "Food":
        player = aidSummmaryArray[item][0];
        currentAmount = sendAidArray[player][2];
        sendAidArray[player][2] =
          Number(currentAmount) + Number(aidSummmaryArray[item][2]);

        playerReceived = aidSummmaryArray[item][1];
        currentAmount = receivedAidArray[playerReceived][2];
        receivedAidArray[playerReceived][2] =
          Number(currentAmount) + Number(aidSummmaryArray[item][2]);
        break;
      case "Iron":
        player = aidSummmaryArray[item][0];
        currentAmount = sendAidArray[player][3];
        sendAidArray[player][3] =
          Number(currentAmount) + Number(aidSummmaryArray[item][2]);

        playerReceived = aidSummmaryArray[item][1];
        currentAmount = receivedAidArray[playerReceived][3];
        receivedAidArray[playerReceived][3] =
          Number(currentAmount) + Number(aidSummmaryArray[item][2]);
        break;
      case "Octarine":
        player = aidSummmaryArray[item][0];
        currentAmount = sendAidArray[player][4];
        sendAidArray[player][4] =
          Number(currentAmount) + Number(aidSummmaryArray[item][2]);

        playerReceived = aidSummmaryArray[item][1];
        currentAmount = receivedAidArray[playerReceived][4];
        receivedAidArray[playerReceived][4] =
          Number(currentAmount) + Number(aidSummmaryArray[item][2]);
        break;
      default:
        console.log(
          `New resource ${aidSummmaryArray[item][3]} added to the game?`
        );
    }
  }

  aidSummary = `   <br>
        <table border = "1">
            <tr>
                <th colspan = "6">Aid Sent</th>
            </tr>
            <th>Player</th><th>Cash</th><th>Endurium</th><th>Food</th><th>Iron</th><th>Octarine</th>
            <tr>`;
  for (player in sendAidArray) {
    aidSummary = `${aidSummary}<td>${player}</td><td>${sendAidArray[player][0]}</td><td>${sendAidArray[player][1]}</td><td>${sendAidArray[player][2]}</td><td>${sendAidArray[player][3]}</td><td>${sendAidArray[player][4]}</td></tr>`;
  }

  aidSummary = `${aidSummary}</table> <br>
    <table border = "1">
        <tr>
            <th colspan = "6">Aid Received</th>
        </tr>
        <th>Player</th><th>Cash</th><th>Endurium</th><th>Food</th><th>Iron</th><th>Octarine</th>
        <tr>`;

  for (player in receivedAidArray) {
    aidSummary = `${aidSummary}<td>${player}</td><td>${receivedAidArray[player][0]}</td><td>${receivedAidArray[player][1]}</td><td>${receivedAidArray[player][2]}</td><td>${receivedAidArray[player][3]}</td><td>${receivedAidArray[player][4]}</td></tr>`;
  }

  aidSummary = `${aidSummary}</table></body>`;
  return aidSummary;
}

function buildCombatSummary() {
  combatTableSummary = `${doc}<br>
    <table border = "1">
        <tr>
            <th colspan = "6">Combat Player Summary</th>
        </tr>
        <th>Player</th><th>Explored</th><th>Captures</th><th>Defeats</th><th>Blown Up</th><th>Blown Up (lost)</th>`;
  totals = [0, 0, 0, 0, 0];
  for (player in byPlayerDict) {
    combatTableSummary = `${combatTableSummary}<tr><td>${player}</td><td>${byPlayerDict[player][0]}</td><td>${byPlayerDict[player][1]}</td><td>${byPlayerDict[player][2]}</td><td>${byPlayerDict[player][3]}</td><td>${byPlayerDict[player][4]}</td></tr>`;
    totals = [
      totals[0] + byPlayerDict[player][0],
      totals[1] + byPlayerDict[player][1],
      totals[2] + byPlayerDict[player][2],
      totals[3] + byPlayerDict[player][3],
      totals[4] + byPlayerDict[player][4],
    ];
  }
  combatTableSummary = `${combatTableSummary}<tr><td>Total</td><td>${totals[0]}</td><td>${totals[1]}</td><td>${totals[2]}</td><td>${totals[3]}</td><td>${totals[4]}</td></tr></table>`;

  combatTableSummary = `${combatTableSummary}<br>
<table border = "1">
    <tr>
        <th colspan = "6">Combat Family Summary</th>
    </tr>
    <th>Family</th><th>Captures</th><th>Defeats</th><th>Blown Up</th><th>Blown Up (lost)</th>`;
  totals = [0, 0, 0, 0];
  for (family in byFamilyDict) {
    combatTableSummary = `${combatTableSummary}<tr><td>${family}</td><td>${byFamilyDict[family][0]}</td><td>${byFamilyDict[family][1]}</td><td>${byFamilyDict[family][2]}</td><td>${byFamilyDict[family][3]}</td></tr>`;
    totals = [
      totals[0] + byFamilyDict[family][0],
      totals[1] + byFamilyDict[family][1],
      totals[2] + byFamilyDict[family][2],
      totals[3] + byFamilyDict[family][3],
    ];
  }
  combatTableSummary = `${combatTableSummary}<tr><td>Total</td><td>${totals[0]}</td><td>${totals[1]}</td><td>${totals[2]}</td><td>${totals[3]}</td></tr>`;

  combatTableSummary = `${combatTableSummary}</table></body>`;
  return combatTableSummary;
}

//general functions

function addPlayerNames(array, playerIndex) {
  for (item of array) {
    playerList.add(item[0]);
  }
  return playerList;
}

function occurrence(array) {
  var result = {};
  if (array instanceof Array) {
    // Check if input is array.
    array.forEach(function (v, i) {
      if (!result[v]) {
        // Initial object property creation.
        result[v] = [i]; // Create an array for that property.
      } else {
        // Same occurrences found.
        result[v].push(i); // Fill the array.
      }
    });
  }
  return result;
}

function addLineNumber(text) {
  lines = text.split("\n");
  outputWithLineNumbers = "";
  i = 1;
  for (line of lines) {
    outputWithLineNumbers = `${outputWithLineNumbers}${i} ${line}\n`;
    i++;
  }
  return outputWithLineNumbers;
}

function copyToClipboard(id) {
  var copyText = document.getElementById(id);
  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */
  /* Copy the text inside the text field */
  navigator.clipboard.writeText(copyText.value);
}