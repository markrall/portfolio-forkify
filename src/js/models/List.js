import { v4 as uuidv4 } from 'uuid';

export default class List {
  constructor () {
    this.items = [];
  }

  addItem(count, unit, ingredient) {
    const item = {
      id: uuidv4(),
      count,
      unit,
      ingredient,
    };
    this.items.push(item);
    return(item);
  }

  deleteItem(id) {
    const index = this.items.findIndex(el => el.id === id);
    this.items.splice(index, 1);
  }

  updateCount(id, newCount) {
    if (newCount >= 0 ) this.items.find(el => el.id === id).count = newCount;
  }
}