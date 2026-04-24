type Int32 = number;
type Float = number;

export class CircularArray<T>{
  array: T[];
  length: number;

  constructor(arr: T[]){
    this.array = arr;
    this.length = arr.length;
  }



  get(i: number): T{
    const count = this.array.length;
    let index = i % count;
    if(index < 0){
      index = count + index;
    }
    return this.array[index];
  }

  static test(){
    const arr = [0,1,2,3,4]

    const ca = new CircularArray<number>(arr);

    console.log(ca.get(-1));
    console.log(ca.get(-7));
    console.log(ca.get(6));
    console.log(ca.get(3));
  }
}

export class SortedArray<T>{
  private array: T[];
  private cmp: (a: T, b: T) => Int32;
  constructor(arr: T[]=[], cmp: (a: T, b: T) => Int32){
    this.array = [...arr];
    this.array = this.array.sort(cmp);
    this.cmp = cmp;
  }
  size(): Int32{
    return this.array.length;
  }
  add(ele: T){
    const index = this.lowerBound(ele);
    this.array.splice(index, 0, ele);
  }
  remove(i: Int32){
    if(i < this.array.length && i >= 0){
      this.array.splice(i, 1);
    }
  }
  getArray(): T[]{
    return this.array;
  }
  get(i: Int32): T | undefined{
    if(i < this.array.length && i >= 0){
      return this.array[i];
    }
    return undefined;
  }
  lowerBound(ele: T): Int32{
    let i = 0;
    let j = this.array.length-1;
    while(i <= j){
      let m = Math.floor((i+j)*0.5);
      const c = this.cmp(ele, this.array[m]);
      if(c == 0){
        return m;
      }else if(c < 0){
        j = m - 1;
      }else{
        i = m + 1;
      }
    }
    return i;
  }
  //returns any element 
  search(ele: T): Int32 | undefined{
    let i = 0;
    let j = this.array.length-1;
    while(i <= j){
      let m = Math.floor((i+j)*0.5);
      const c = this.cmp(ele, this.array[m])
      if(c == 0){
        return m;
      }else if(c < 0){
        j = m - 1;
      }else{
        i = m + 1;
      }
    }
    return undefined;
  }
}


export function flatten<T>(arr: T[][]): T[]{
  const flat = [];
  for(const a of arr){
    for(const e of a){
      flat.push(e);
    }
  }
  return flat;
}

export function reverse<T>(arr: T[]){
  const h = Math.floor(arr.length/2);
  for(let i = 0; i < h; i++){
    [arr[i], arr[arr.length-i-1]] = [arr[arr.length-i-1], arr[i]];
  }
  return arr;
}

export function binarySearch<T>(arr: T[], compare: (t:T) => Float): Int32{
  let i = 0;
  let j = arr.length-1;
  while(i <= j){
    const m = Math.trunc((i+j)/2);
    const comp = compare(arr[m]);
    if(comp == 0){
      return m;
    }else if(comp > 0){
      i = m+1;
    }else{ // less
      j = m-1;
    }
  }
  return -1;
}



export function binarySearchUpperBound<T>(arr: T[], compare: (t:T) => Float): Int32{
  let i = 0;
  let j = arr.length-1;
  while(i <= j){
    const m = Math.trunc((i+j)/2);
    const comp = compare(arr[m]);
    if(comp <= 0){
      j = m - 1;
    }else{
      i = m + 1;
    }
  }
  return i;
}

export function binarySearchLowerBound<T>(arr: T[], compare: (t:T) => Float): Int32{
  let i = 0;
  let j = arr.length-1;
  while(i <= j){
    const m = Math.trunc((i+j)/2);
    const comp = compare(arr[m]);
    if(comp >= 0){
      i = m + 1;
    }else{
      j = m - 1;
    }
  }
  return j;
}

export function random0ToN(size: Int32): Int32[]{
  const arr = Array.from({length: size}, (_, i) => i);
  for(let i = arr.length-1; i > 0; i--){
    const j = Math.floor(Math.random()*(i+1));
    //new_cards[n] = this.cards[j];

    [arr[j], arr[i]] = [arr[i], arr[j]];
  }
  return arr;
}
