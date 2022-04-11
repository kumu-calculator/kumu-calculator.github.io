let conversionRates = {
  // conversionCost : convertedCoins
  200000: 110000,
  120000: 63000,
  40000: 21500,
  20000: 10600,
  4000: 2100,
  2000: 1000
};

let conversionCosts = Object.keys(conversionRates);

let minimumCost = Infinity;

// Evaluate the percentage return when diamonds are converted to coins
conversionCosts.forEach(conversionCost => {
  conversionRates[conversionCost] = {
    coins: conversionRates[conversionCost],
    return: conversionRates[conversionCost] / Number(conversionCost)
  }
  // while we do, lets find minimum cost
  minimumCost = Math.min(Number(conversionCost), minimumCost);
});

conversionCosts.sort((a, b) => {
  let returnDifference = conversionRates[b].return - conversionRates[a].return;
  if (returnDifference != 0) {
    return returnDifference;
  }
  return Number(b) - Number(a);
});

function convertDiamondsToCoins(diamonds) {
  let count, cost, rate, i;

  for (i = 0; i < conversionCosts.length; i++) {
    count = Math.floor(diamonds / Number(conversionCosts[i]));
    if (count > 0) break;
  }
  cost = conversionCosts[i];
  rate = conversionRates[cost].coins;

  return {
    cost: cost,
    rate: rate,
    count: count,
    coins: count * rate,
    excess: diamonds - (count * Number(cost))
  }
}

function calculateTotalCampaignDiamonds(coins) {
  let total = coins; // Initial coins are always added
  let convertableDiamonds = Math.floor(0.8 * coins); // Maximum of 80% can be received by co-hosts
  let conversionInfo;
  let summary = [];
  let info = {};

  info.drop = coins;
  info.recovered = convertableDiamonds;
  do {
    conversionInfo = convertDiamondsToCoins(convertableDiamonds);
    summary.push({
      ...info,
      ...conversionInfo
    });

    total += conversionInfo.coins; // converted coins will be dropped and added to total
    convertableDiamonds = conversionInfo.excess + Math.floor(0.8 * conversionInfo.coins);

    info.drop = conversionInfo.coins;
    info.recovered = convertableDiamonds;
  } while (convertableDiamonds > minimumCost);

  conversionInfo.count = 0;
  conversionInfo.coins = 0;
  conversionInfo.excess = info.recovered;
  summary.push({
    ...info,
    ...conversionInfo
  });
  
  return {
    total: total,
    excess: convertableDiamonds,
    info: summary
  };
}

window.addEventListener('load', function () {
  document.body.innerHTML = [
    `<h1 id="title">Kumu Calculator</h1>`,
    `<p id="description">A simple calculator to estimate total diamonds earned for campaigns when converting co-host earned 
    diamonds to coins repeatedly using the conversion rates below</p>`,
    `<div id="content">`,
    `<div id="settings" class="w3-responsive">`,
    `<table id="rates" class="w3-table-all w3-third w3-centered">`,
    `<tr><th>Diamond Cost</th><th>Output Coins</th><th>Return Percentage</th></tr>`,
    ...Object.keys(conversionRates).sort((a, b) => {
      return Number(b) - Number(a);
    }).map(cost => {
      return `<tr><td>${cost}</td><td>${conversionRates[cost].coins}</td><td>${Math.fround(100 * conversionRates[cost].return)}</td></tr>`
    }),
    `</table>`,
    `</div>`,
    `</div>`,
    `<div id="calculator">`,
    `<h2>Estimate Total Diamonds</h2>`,
    `<input required id="coins" type="number" value="1000000"/>`,
    `<button id="calculate">Calculate</button>`,
    `</div>`,
    `<div id="result" style="display:none;">`,
    `<h2>Result</h2>`,
    `<div class="w3-responsive">`,
    `<table id="summary" class="w3-table-all w3-centered">`,
    `</table>`,
    `</div>`,
    `<h3>Estimated Total:&nbsp;<strong id="total"></strong></h3>`,
    `</div>`,
  ].join("");

  document.getElementById("calculate").addEventListener("click", () => {
    let coinsInput = document.getElementById('coins');
    if (!coinsInput.validity.valid) {
      alert("Please input a valid amoount of coins");
      return;
    }
    let result = calculateTotalCampaignDiamonds(Number(coinsInput.value));
    document.getElementById("summary").innerHTML = [
      `<tr><th>Dropped Coins</th><th>Recovered Diamonds</th><th>Diamond Cost</th><th>Output Coins</th><th>Conversion Count</th><th>Returned Coins</th><th>Excess Diamonds</th></tr>`,
      ...result.info.map(info => {
        return `<tr><td>${info.drop}</td><td>${info.recovered}</td><td>${info.cost}</td><td>${info.rate}</td><td>${info.count}</td><td>${info.coins}</td><td>${info.excess}</td></tr>`;
      })
    ].join("");

    document.getElementById("total").textContent = result.total;
    document.getElementById("result").style.display = "block";
  });
});
