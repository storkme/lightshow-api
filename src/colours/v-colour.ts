import { HueWalker } from './hue-walker';
/**
* Represent colour of an LED with 4-element vector, white, red, green, blue
* The brightness scale is 0-255 for each. 
* The numbers are allowed outside that range, will be rounded in toInt 
*/
export class VColour {
	
  val: Array<number>;
  walker: HueWalker = null;

  constructor(value: Array<number> = [0,0,0,0]) {
	// violating good programming by not validating the length
	this.val = value;
  }
  /**
  * Load a colour from a hex buffer
  */
  static fromHex(msg: Buffer, pos: number){
	  return new this([msg.readUInt8(pos),msg.readUInt8(pos+1),msg.readUInt8(pos+2),msg.readUInt8(pos+3)]);
  }
  /**
  * Create a copy of given colour
  */
  static cloneX(a: VColour){
	  // create a new instance 
	  return new this([a.val[0], a.val[1], a.val[2], a.val[3]]);
  }
  /**
  * Make copy of self. Need to have one of these on each subclass.
  * There seems to be no way in JS or typescript to create a new instance of whatever class another object is.
  */
  clone(){
	  let res = [];
	  for (var k=0; k<4; k++) res.push(this.val[k]);
	  return new VColour(res);
  }
  /**
  * add another colour to the current one.
  */
  add(a: VColour){
	  for (var k=0; k<4; k++) this.val[k] += a.val[k];
  }
  /**
  * change the hue by one step
  * return this for chaining
  */
  next(){
	  if (!this.walker) this.walker = new HueWalker(this);
	  let x = this.walker.next();
	  this.val = x.val;
	  return this; 		// allow concatenation
  }
  /**
  * subtract another colour from the current one.
  */
  sub(a: VColour){
	  for (var k=0; k<4; k++) this.val[k] -= a.val[k];
  }
  /**
  * subtract another colour from the current one.
  * the difference is that this doesnt change the current colour, instead if produces a colour difference - just a 4 element array
  * Colour differences arent the same as colours - negative values are perfectly normal. When added to a colour they give another colour.
  */
  diff(a: VColour): Array<number>{
	  var res = [];
	  for (var k=0; k<4; k++) res.push(this.val[k] - a.val[k]);
	  return res;
  }
  /**
  * add an array to the current one.
  */
  addA(a: Array<number>){
	  for (var k=0; k<4; k++) this.val[k] += a[k];
  }
  /**
  * subtract an array from the current one.
  */
  subA(a: Array<number>){
	  for (var k=0; k<4; k++) this.val[k] -= a[k];
  }
  /**
  * Convert to an integer, where the 32 bits are the 4 separate colours 0-255
  */
  // GOT A HARDWARE PROBLEM - it seems to be encoding the colours as GBR instead of RGB
  // tshow-api[1038]: VR-colour toint [ 0, 90.00000000000006, -8.1969624407887e-14, 37.99999999999982 ] 5898278
  //  VR-colour toint [ 0, 117, 0, 11 ] 7667723
  // VR-colour toint [ 0, 117, 0, 11 ] 7667723
  // V-colour toint [ 0, 123, 5, 0 ] 8062208
  // col() toint [ 0, 82, 46, 0 ] 5385728
  //  101 read single integer colour  16711680 after I tapped red. Green showed up.
  // 101 read single integer colour  2817792 tapped green and it showed blue
  // 101 read single integer colour  2752767 tapped blue and it showed orange#
  // 101 read single integer colour  16711935 tapped pink, it showed yellow

  toInt_old(){
	  let vc=this.val;
	  let res = ((Math.round(vc[0])*256+Math.round(vc[1]))*256+Math.round(vc[2]))*256+Math.round(vc[3]);
	  console.log("V-colour col() toint", this.val,res);
	  return res;
  }
  toInt(){
	  let res = 0;
	  for (var k=0; k<4; k++) {
		  if (this.val[k]<=0) res = res*256;
		  else {
			if (this.val[k]>=255) res = res*256+255;
			else res = res*256+this.val[k];
		  }
	  }
	  //console.log("V-colour toint", this.val,res);
	  return res;
  }
  /**
  * returns true if r=g=b so no colour. So grey and black count as white as well :)
  */
  isWhite(): boolean{
	  return this.val[1]==this.val[2] && this.val[2] == this.val[3]
  }
  show(){
	  console.log("--- col "+this.val[0]+","+this.val[1]+","+this.val[2]+","+this.val[3]);
  }

}