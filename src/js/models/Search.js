import axios from "axios";
import { URL_F2F } from '../config';

export default class Search {
  constructor (query) {
    this.query = query;
  }

  async getResults() {
    try {
      const result = await axios(`${URL_F2F}search?&q=${this.query}`);
      this.result = result.data.recipes;
      // console.log(this.result);
    } catch (error) {
      console.log(error);
    }
  }
}

