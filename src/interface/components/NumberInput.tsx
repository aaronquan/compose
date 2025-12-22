import { useEffect, useState } from "react";

function parseIntNum(s: string): number{
  if(isNaN(s as any)){
    return 0;
  }
  return parseInt(s);
}

type NumberInputProps = {
  initial?: number;
  onChange: (n:number) => void;
}

export function NumberInput(props: NumberInputProps){
  const [number, setNumber] = useState(0);
  useEffect(() => {
    if(props.initial) setNumber(props.initial);
  }, [props.initial])
  function handleChange(e: React.ChangeEvent<HTMLInputElement>){
    let num = e.target.valueAsNumber;
    if(isNaN(num)){
      num = 0;
    }
    console.log(num);
    setNumber(num);
    props.onChange(num);
  }
  return(
    <input type="number" value={number} onChange={handleChange}/>
  );
}