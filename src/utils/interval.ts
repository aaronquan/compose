type Float = number;

export function nextOrSameFractionInterval(value: Float, frac: Float): Float{
    const fl = Math.floor(value);
    for(let i = 0; i <= 1; i+=frac){
      if(fl+i >= value){
        return fl+i;
      }
    }
    return value;
}

export function prevOrSameFractionInterval(value: Float, frac: Float): Float{
  const fl = Math.ceil(value);
  for(let i = 0; i >= -1; i-=frac){
      if(fl+i <= value){
        return fl+i;
      }
    }
    return value;
}

