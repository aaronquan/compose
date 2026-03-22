type Int32 = number;

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
  add(ele: T){
    const index = this.lowerBound(ele);
    this.array.splice(index, 0, ele);
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
