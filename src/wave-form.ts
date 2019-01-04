import { VColour } from './v-colour';
/**
* Anything that represents a colour function of space and time which can appear on the LEDs
*/
export interface WaveForm {
	
	// values
	id: string;
	numLeds: number;
	
	// methods
	add(time: number, buf: Array<VColour>);
	reset(time: number);
	
}