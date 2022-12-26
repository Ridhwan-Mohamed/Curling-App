/*
  Models a collection of elements like a set from math
  Sets don't store duplicates (based on === operator)
*/

class Set {
  //let collection = []  //NOT ALLOWED WITH CLASSES
  constructor() {
    //"this" refers to new memory allocated in "new Set()" expression
    this.collection = []
  }
  add(x) {
    //add element x if no current element === x
    if (this.collection.indexOf(x) < 0) this.collection.push(x)
  }

  remove(x) {
    //remove first occurence of element === x
    let position = this.collection.indexOf(x)
    const NUM_TO_DELETE = 1
    if (position > -1) this.collection.splice(position, NUM_TO_DELETE)
  }

  contains(x) {
    //answer whether set contains element === x
    return this.collection.indexOf(x) > -1
  }

  toString() {
    return this.collection.toString()
  }
}
