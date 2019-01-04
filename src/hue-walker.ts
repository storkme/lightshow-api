import { VColour } from './v-colour';

/**
* This class takes an initial colour vector and then steps through all the colour points which have the 
* same luminance (sum of colours) and saturation (range of values) as the initial colour.
*
* Since I now have a class for colour, you could argue that this should just be a method of VColour now!!
*/
export class HueWalker {
	
  current: VColour;
  private init: VColour;
  private isWhite: boolean = false;
  private hi: number;
  private lo: number;
  private edge: number;
  private steps: number = 0;
  private edges: Array<Object>;
  private minmax: Array<Object>;
  

  constructor(initial: VColour) {
	this.init = initial;
	this.setup();
	this.rangeAndEdge(initial);
  }
  /**
  * The main output of the class, this returns the next colour, stepping through the hues
  * Note: it returns a reference to the same colour which is held in te object.
  */
  next(): VColour{
   if (this.isWhite) return this.init;

   for (var k=0; k<3; k++){	// do this a max of 3 times to avoid getting into a infinite loop
	if (this.atEndEdge()) {
	   this.edge++;
	   if (this.edge>5) this.edge = 0;
	   console.log("Changing to edge "+this.edge+" after "+this.steps+" steps");
	} else {
	   // just add the vector
   	   this.steps++;
	   for (var j=0; j<4; j++){
		this.current.val[j] = this.current.val[j] + this.edges[this.edge][j];
	   }
	   return this.current; 
 	}
   }
   // shouldnt get here if white has been excluded
   return this.current;
  }
  /**
  * Just output details to console, used for debugging
  */
  show(){
	console.log("HueWalker: whiteness="+this.lo+" to "+this.hi+". edge="+this.edge);
  }
  /**
  * Set up some constant values we will need
  * These could be class constantss if typescript has such a thing
  */
  private setup() {
   // the edge vectors
   this.edges = [
	[0, 0, 1, -1],	// red max
	[0, -1, 1, 0],	// blue min
	[0, -1, 0, 1],	// green max
	[0, 0, -1, 1],	// red min
	[0, 1, -1, 0],	// blue max
	[0, 1, 0, -1]	// green min
   ];
   // the array entry to test for minimum and maximum
   // first entry is index number of -1 in the above, second entry is index number of +1
   this.minmax = [
	[3,2],
	[1,2],
	[1,3],
	[2,3],
	[2,1],
	[3,1]
   ];
  }
  /**
  * Work out where on the colour hexagon our initial colour is.
  */
  private rangeAndEdge(init: VColour){
   let k;
   this.current = init;

   // edge case (actually centre case :) if the colour is white then always return white.
   if (init.isWhite()){
	this.isWhite = true;
	return;
   } else this.isWhite = false;

   // whiteness is min of 255-r, b, 255-g, r, 255-b, g in the same order of edges.
   let edge = -1;
   let whiteness = 255;
   let extremes = [255-init.val[1], init.val[3], 255-init.val[2], init.val[1], 255-init.val[3], init.val[2] ];
   for (k=0; k<6; k++){
	if (extremes[k]<whiteness){
	    whiteness=extremes[k];
	    edge = k;
	}
   }
   this.edge = edge;
   // hi and lo indirectly define the saturation
   this.lo = whiteness;
   this.hi = 255 - whiteness;
   //this.steps = 0;
   //this.show();
  }
  /**
  * Test wwhether we are at the end of an edge.
  * Note that the same colour point could be at the end of two edges in the top or bottom sections.
  */
  private atEndEdge(){
   const mm = this.minmax[this.edge];
   return this.current.val[mm[0]] <= this.lo || this.current.val[mm[1]] >= this.hi;
  }
}