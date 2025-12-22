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
