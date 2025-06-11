// Ship class to represent individual ships
class Ship {
  constructor() {
    this.locations = [];
    this.hits = [];
  }

  addLocation(location) {
    this.locations.push(location);
    this.hits.push('');
  }

  hit(location) {
    const index = this.locations.indexOf(location);
    if (index >= 0 && this.hits[index] !== 'hit') {
      this.hits[index] = 'hit';
      return true;
    }
    return false;
  }

  isSunk() {
    return this.hits.every(hit => hit === 'hit');
  }

  isAlreadyHit(location) {
    const index = this.locations.indexOf(location);
    return index >= 0 && this.hits[index] === 'hit';
  }
}

module.exports = Ship; 