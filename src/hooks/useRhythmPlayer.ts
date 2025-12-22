import { useEffect, useMemo, useRef, useState } from "react";
import { Rhythm, getBeatIntervalMilliseconds } from "../compose/rhythm";
import { Oscillator, TickOscillator } from "../compose/audio";
import { nextNote } from "../compose/note";

type UseRhythmPlayerProps = {
  audio_context: AudioContext;
  rhythm: Rhythm;
  tempo: number;
  repeating: boolean;

  onFinished: () => void;
}

type RhythmPlayerState = {
  current_note: number;
  current_beat: number;
  is_playing: boolean;
}

type PlayingRhythmNoteDetails = {
  is_rest: boolean | null;
  is_on_beat: boolean;
  current_note_id: number;
  playing_beat_float: number;
  current_note_start_beat: number;
  current_note_end_beat: number;
}

type NextBeatInterval = number;

type RhythmPlayerReturn = [boolean, number, number, () => void, () => void];

export function useRhythmPlayer(props: UseRhythmPlayerProps): RhythmPlayerReturn{
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentNoteId, setCurrentNoteId] = useState(0);
  const beat_milliseconds = useMemo(() => getBeatIntervalMilliseconds(props.tempo), [props.tempo]);
  const timeoutId = useRef<null | number>(null);
  const repeating = useRef(props.repeating);
  useEffect(() => {
    repeating.current = props.repeating
  }, [props.repeating]);

  const currentNoteDetails = useRef<PlayingRhythmNoteDetails | null>(null
    /*{
      is_rest: false, is_beat: false, 
      current_beat_float: 0, current_note: 0,
      current_note_start_beat: 0  
    }*/
  );
  //const playerState = useRef<RhythmPlayerState>({current_beat: 0, current_note: 0});
  const oscillator = useRef(new Oscillator(props.audio_context));
  const ticker = useRef(new TickOscillator(props.audio_context));

  const onPlay: () => void = () => {
    setIsPlaying(true);
    setCurrentNoteId(0);
    setCurrentBeat(0);

    //set first note
    if(props.rhythm.notes.length > 0){
      const firstNote = props.rhythm.notes[0];
      currentNoteDetails.current = {
        is_rest: firstNote.is_rest, is_on_beat: true, 
        playing_beat_float: 0, current_note_id: 0,
        current_note_start_beat: 0,
        current_note_end_beat: firstNote.length,
        
      };
      playCurrentNote();
    }
  }

  function onStop(){
    if(timeoutId.current != null){
      clearTimeout(timeoutId.current);
      resetPlayer();
    }
  }

  function playNote(details: PlayingRhythmNoteDetails){
    //const details = currentNoteDetails.current!;
    if(details.is_on_beat){
      setCurrentBeat(details.playing_beat_float);
      ticker.current.tick();
    }
    if(details.is_rest != null){
      setCurrentNoteId(details.current_note_id);
      if(details.is_rest){
        oscillator.current.stop();
      }else{
        oscillator.current.play(); //is note
      }
    }
  }

  // returns next interval
  function updatePlayingDetails(details: PlayingRhythmNoteDetails): NextBeatInterval{
    //const beat_milliseconds = getBeatIntervalMilliseconds(props.tempo);
    const next_on_beat = Math.floor(details.playing_beat_float)+1;
    let beat_interval = 0;
    if(details.current_note_end_beat > next_on_beat){
      beat_interval = Math.min(next_on_beat - details.playing_beat_float, details.current_note_end_beat-details.playing_beat_float);
      currentNoteDetails.current = {
        is_rest: null,
        is_on_beat: true,
        playing_beat_float: next_on_beat,
        current_note_id: details.current_note_id,
        current_note_start_beat: details.current_note_start_beat,
        current_note_end_beat: details.current_note_end_beat
      }
    }else{
      const next_note = props.rhythm.getNote(details.current_note_id+1);
      if(next_note != null){
        const next_beat_fl = details.current_note_end_beat;
        beat_interval = next_beat_fl - details.playing_beat_float;
        currentNoteDetails.current = {
          is_rest: next_note.is_rest,
          is_on_beat: next_beat_fl == Math.floor(next_beat_fl),
          playing_beat_float: next_beat_fl,
          current_note_id: details.current_note_id + 1,
          current_note_start_beat: details.current_note_end_beat,
          current_note_end_beat: details.current_note_end_beat+next_note.length
        }
      }
    }
    return beat_interval;
  }

  function playCurrentNote(){
    if(currentNoteDetails.current){
      const details = currentNoteDetails.current;
      playNote(details);
      const beat_interval = updatePlayingDetails(details);
      if(beat_interval != 0){
        const time_interval = beat_interval*beat_milliseconds;
        timeoutId.current = setTimeout(() => {
          playCurrentNote();
        }, time_interval);
      }else{
        //const current_note_length = props.rhythm.getNote(details.current_note_id)!.length;
        const final_time = currentNoteDetails.current.current_note_end_beat - currentNoteDetails.current.playing_beat_float;
        //const final_time = (nextNoteDetails.current.current_note_start_beat)+current_note_length - nextNoteDetails.current.current_note_start_beat;
        currentNoteDetails.current = null;
        //console.log(final_time)
        timeoutId.current = setTimeout(() => {
          console.log(repeating);
          resetPlayer();
          if(repeating.current){
            onPlay();
          }
        }, final_time*beat_milliseconds);
      }
      
    }
  }

  function resetPlayer(){
    setCurrentBeat(0);
    setCurrentNoteId(0);
    setIsPlaying(false);
    oscillator.current.stop();
  }

  return [isPlaying, currentBeat, currentNoteId, onPlay, onStop];
}

type TempoClickerProps = {
  audio_context: AudioContext;
  tempo: number;
  is_playing: boolean;
}

export function useTempoClicker(props: TempoClickerProps){
  const ticker = useRef(new TickOscillator(props.audio_context));
  const tickTimeout = useRef(-1);
  const tick_interval = useMemo(() => getBeatIntervalMilliseconds(props.tempo), [props.tempo]); 
  useEffect(() => {
    if(props.is_playing){
      runTicking();
    }else{
      clearTimeout(tickTimeout.current);
    }
  }, [props.is_playing]);

  function runTicking(){
    ticker.current.tick();
    console.log("Hello");
    tickTimeout.current = setTimeout(() => {
      runTicking();
    }, tick_interval);
  }
}