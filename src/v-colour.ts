/**
* Represent colour of an LED with 4-element vector, white, red, green, blue
* The brightness scale is 0-255 for each. 
* The numbers are allowed outside that range, will be rounded in toInt 
*/
export class VColour {
	
  val: Array<number>;  

  constructor(value?: Array<number> = [0,0,0,0]) {
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
  static clone(a: VColour){
	  return new this([a[0], a[1], a[2], a[3]]);
  }
  /**
  * add another colour to the current one.
  */
  add(a: VColour){
	  for (var k=0; k<4; k++) this.val[k] += a.val[k];
  }
  /**
  * subtract another colour from the current one.
  */
  sub(a: VColour){
	  for (var k=0; k<4; k++) this.val[k] -= a.val[k];
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
  toInt(){
	  let res = 0;
	  for (var k=0; k<4; k++) {
		  if (this.val[k]<=0) res = res*256;
		  else {
			if (this.val[k]>=255) res = res*256+255;
			else res = res*256+this.val[k];
		  }
	  }
	  return res;
  }

}