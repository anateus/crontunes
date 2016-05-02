Crontunes is a WebAudio sequencer that uses crontab-like sequence.

      ┌───────────── 1/32 beat 
      │ ┌────────────── 1/16 beat
      │ │ ┌─────────────── 1/8 beat
      │ │ │ ┌──────────────── 1/4 beat
      │ │ │ │ ┌───────────────── 1/2 beat
      │ │ │ │ │ ┌─────────────────── 1 beat
      │ │ │ │ │ │
      * * * * * * instrument


So to play a square wave oscillator every 1/8 beat that's divisible by 3 for 1/8 of a beat you'd write:


      0 0 */3 * * * square(440, 0.125)


### Running

```bash
twistd web --path . --port 8888
```

Then open `crontunes.html`.
