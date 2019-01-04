import { VColour } from './v-colour';
import { WaveForm } from './wave-form';
import { HueWalker } from './hue-walker';

/**
* This represents a set of things which will move. Examples would be elements of the Wave class. There could be others.
* Anything which defines a set of colour *relative* amplitudes as a function of the led-number and time.
*/
export class WaveSet {
	
  background: VColour;
  numLeds: number;
  changeBackground: boolean;		// if true then the HueWalker will be used to change the background
  waves: Array<WaveForm>;
  
  private lastHueChange: number = 0;
  private walker: HueWalker;

  constructor(background: VColour, numLeds: number, changeBackground: boolean = false) {
   this.background = background;   // background colour object
   this.numLeds = numLeds;
   this.changeBackground = changeBackground;
   this.waves = [];
   this.walker = this.changeBackground ? new HueWalker(this.background) : null;
  }
  /*
  * Add a Wave or wavelike object to the set
  */
  addWave(w:  WaveForm){
   this.waves.push(w);
   let idnum = this.waves.length-1;
   this.waves[idnum].id = "w"+idnum;
   this.waves[idnum].numLeds = this.numLeds;
  }
  /*
  * Add up all the waves and copy them into the given channel
  */
  render(chan: {array: Array<number>},time: number){
   let buf =  [];
   if (this.changeBackground && time-2 > this.lastHueChange){
	this.background = this.walker.next();
	this.lastHueChange = time;
   }
   //console.log("Adding background ",this.background);
   for (var k=0; k<this.numLeds; k++) buf.push(VColour.clone(this.background));

   for (k=0; k<this.waves.length; k++) this.waves[k].add(time,buf);
   //console.log(" ... finished adding");

   for (k=0; k<this.numLeds; k++){
	chan.array[k] = buf[k].toInt();
   } 
  }


}