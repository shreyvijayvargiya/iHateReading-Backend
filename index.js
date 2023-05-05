import fs from "fs";


function memoized(fn) {
	let cache = new Map();
	return (...args) => {
		const key = JSON.stringify(args);
		if (cache.has(key)) {
			return cache.get(key);
		}
		const result = fn(...args);
		cache.set(key, result);
		return result;
	};
}

const findRepeatingChar = (data, keys) => {
	return data.map((item) => {
		// check if item has the property or key that includes in keys array
		// if yes return only that property value in the new final array
		// else skip return null and skip to the next item of the array
		let newObj = {};
		keys.forEach((prop) => {
			if (item.hasOwnProperty(prop)) {
				newObj[prop] = item[prop];
			} else {
				return null;
			}
		});
		return newObj;
	});
};

// webpack usually does is takes the entire files code into one file
// now find the code that is not called invoked or used
// once that is find simple return the final code by removing the unrequired code

// read all the files content from dependency graph
// transpile all content for older javascript runtime engines
// put all code into one file
// remove unused and unrequired code from that single file
// now this is your bundle.js file

// how does static files are treated
// they are converted into base64String format and that is loaded fast and effiecient

// we will first fetcht the entire data from the API
// directly fetch all the ids from the array
// put them into a new array
// now move the slideshow using that array
// active will contain the active position of the array and active id
// using active id we will render the following single blog in preview mode


