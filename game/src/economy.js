export const PRICES = { Pistol: 300, SMG: 1500, Rifle: 2700, Sniper: 4750, Armor: 650, 'Defuse kit': 400, Smoke: 300, Flash: 350 };
export function createEconomy() {
  return { money: 800, loss: 0, buy(item) { const price = PRICES[item]; if (!price || this.money < price) return false; this.money -= price; return item; }, roundResult(win) { if (win) { this.money += 3250; this.loss = 0; } else { this.money += 1900 + (this.loss ? 500 : 0); this.loss++; } } };
}
