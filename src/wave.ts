import { VColour } from './colours/v-colour';
import { WaveForm } from './wave-form';

/**
* This represents a colour wave, defined by time and space. 
*/
export class Wave implements WaveForm{
	
  // private current: VColour;
  id: string;
  numLeds: number = 100;		// used for wavegroup width
  private dead: boolean;
  private amplitude: Array<number>;   // is a relative color vector (could be negative)
  private w2: number;		// used for wavegroup width
  private speed: number;
  private starttime: number;
  private wavelength: number;
  private lam: number;
  private elife: number;		// time taken to reduce to 1/e of original
  private restartProb: number;
  private pending: boolean;

  constructor(amplitude: Array<number>, wavelength: number, width: number, speed: number, starttime: number, elife: number, restarttime: number) {
   this.amplitude = amplitude;   // is a relative color vector (could be negative)
   this.w2 = width * width;		// used for wavegroup width
   this.speed = speed;
   this.starttime = starttime;
   this.wavelength = wavelength;
   this.lam = 2*Math.PI / wavelength;
   this.elife = elife;		// time taken to reduce to 1/e of original
   this.restartProb = 1/restarttime;
   this.dead = false;
   this.pending = true;
   this.id = "w";
  }
  /**
  * return the actual value of the wave at x,t
  */
  val(x:number,t:number): Array<number> {
   if (t<this.starttime) {
	this.dead = false;
	return [0,0,0,0];
   }

   let tt = t-this.starttime;
   if (tt==0) console.log("Wave "+this.id+" starting");

   this.pending = false;

   let pos = x - tt*this.speed ;
   if (this.speed<0) pos = this.numLeds - pos;
   let decay = Math.exp(-tt/this.elife);
   this.checkForDead(tt,pos);
   let y = Math.cos(pos*this.lam)*Math.exp(-pos*pos/this.w2)*decay;
   //console.log("x,t,y,pos=",x,t,y,pos);   
   let res=[];
   for (var k=0; k<4; k++) res.push(y*this.amplitude[k]);
   return res;
  }
  /**
  * This is the main way the wave will be used - adding to a buffer of VColours
  */
  add(time: number, buf: Array<VColour>){
   if (this.dead) {
	// decide whether to restart it
	let r = Math.random();
	//console.log("===",r,this.restartProb);
	if (r<this.restartProb) this.reset(time);
	else return;	// if it is dead do nothing
   }
   let x,y;
   this.dead = true;	// val() will set to false if any value is significant
   
   //console.log("Wave.add time="+time);
   
   for (x=0; x<buf.length; x++){
	y = this.val(x,time);
	for (var k=0; k<4; k++){
	   buf[x].val[k] += y[k];
	}
        //console.log("...x= "+x+", add y to get buf ",y, buf[x]);
   }
  }
  /**
  * after a wave is dead, allow it to start again with all the parameters the same
  */
  reset(time: number){
   console.log("restarting "+this.id+" at time "+time);
   this.dead = false;
   this.starttime = time;
  }
  /**
  * Display wave details
  */
  show(){
   console.log("Wave: ---"+this.id+"--- amp=",this.amplitude);
  }
  /**
  * check if the wave is now dead (no significant values) at time tt and position pos
  */
  private checkForDead(tt: number,pos: number){
   // e^-3 is only 15 colour points so that's a good place to stop
   if (tt<this.elife*3) this.dead = false;
   if (pos*pos<this.w2*3) this.dead = false;
  }


}