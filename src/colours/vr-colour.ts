import { VColour } from './v-colour';

/**
* Represent colour of an LED with 4-element vector, white, red, green, blue
* The brightness scale is 0-255 for each. 
* Brightness is allowed to be a real number rather than an integer.
* Although javascript doesnt implement integers differently, this implementation includes a round() step.
*/
export class VRColour extends VColour {
	
  /**
  * Convert to an integer, where the 32 bits are the 4 separate colours 0-255
  */
  toInt(){
	  let res = 0;
	  for (var k=0; k<4; k++) {
		  if (this.val[k]<=0.5) res = res*256;
		  else {
			if (this.val[k]>254.5) res = res*256+255;
			else res = res*256+Math.round(this.val[k]);
		  }
	  }
	  console.log("VR-colour toint", this.val,res);
	  return res;
  }
  static childClass(){
	  return this;
  }
  /**
  * Make copy of self
  */
  clone(){
	  let res = [];
	  for (var k=0; k<4; k++) res.push(this.val[k]);
	  return new VRColour(res);
  }

}