//State variables
let state = null; //Holds the live game state
let stateSeed = null; //Holds the key to generate the initial state
let stateSeedRand = null;
let cleverLevels = [
	{
		name: `Walls won't work`,
		seed: `KsbBgCI81ou0Shk8yUt3ZHqYSZBGTYwHiwESlufNysIYnobNb74FX2XxbwGld6BF`
	},
	{
		name: `Taking aim`,
		seed: `NPb35mGdVjf0Erwnx5EMeiKOdMXYiJCxnbXihduCjzfISv2S4RIMz76vfUKwxPDz`
	},
	{
		name: `Inch by inch`,
		seed: `ssUssvPQFp6pJ1LIrn9h5T6GaTCZj77yzngBMatSfB2KmWGXgNydGJ2G2pggBukT`
	},
	{
		name: `Break free`,
		seed: `XZLWEoRTZpYVjJaC2RfLpAbWs613pnk0tGPT0WBhoPvMEkq2loWxseApMCnJyW8n`
	},
	{
		name: `A rough start`,
		seed: `jx7XOs19usfZwwxuDwq9kEp7sHG904pHtVFk7aMHvAqXzBcXHD8sH0X3e3CnykSn`
	},
	{
		name: `So close, yet so far`,
		seed: `ndYFgNWfbZJUPKjPxx6kqJ4X8Wv18Wjg588AhyEwxJSVy62dEXZJG9dSttV9oJh4`
	},
	{
		name: `One way out`,
		seed: `wQ90h6K0Hz6z3E4XU8XHvjiwJDy5P3ZMmQE8K9DeYUSC3T6JQgu3ZKMmvGR7BQle`
	},
	{
		name: `Sitting in the corner`,
		seed: `4CUfJgwaisQfVSHqyoCeSzigQq8A3Xrg4ivUjghO6x876RWsOBrLn0g7QK3oAtzs`
	},
	{
		name: `Water, water, everywhere`,
		seed: `XBrA5c1EgimJEXytr4VuDPmkjvUcvAHbWgFX9ozsSP3jyqrzIL8DiZmzA2JMgx1g`
	},
	{
		name: `Finnicky`,
		seed: `m9MSTO9TquM6D2U3sJMTcyEL4bU4Lip73WwHsbTwY5NfCKE2NHcjrYepSQ5aK0iu`
	}, {
		name: `Around the world`,
		seed: `Uw7HHKoxS6sVr6xFGDb2lV8wdqISPgcLIY0ISbg8AVZb05508b6WUFRSfY5ovPpN`
	}, {
		name: `Wedged between`,
		seed: `iBPde0eYLtOVkRggPojaCwlfL4SXischnNQBC4iOyc4oOLgwigNTMUhYFH9KOtPn`
	}
	//'nbzAirrD6qhTKRjXeGEQKBqpRsvfBv0hfbn9LlkPae0MJplM82e2i1Yx7yMTJ4ZG',
	//'UJoGhK7CQywQd5KdAg5GMMryQ7b2s3SKp49DRLMQSLkQUULhAXVwDSFq2mzithDG',
	//'6xWiMnV8bxinFYmOsfbXP0qfZV1ld57TkZ7ytaIHMFiSJda5SgeB7opfGE6H5pUq'
];

//put the levels in the ui
let gameLevelsEl = document.getElementById('game-levels');
cleverLevels.forEach(level => {
	var buttonEl = document.createElement('button');
	buttonEl.type = "button"
	buttonEl.innerHTML = level.name;
	buttonEl.addEventListener('click', () => resetGame(level.seed));
	gameLevelsEl.appendChild(buttonEl);
});

let toggleAiButton = document.getElementById('button-toggle-ai');
toggleAiButton.addEventListener('click', () => toggleAiPlay());

let generateRandomButton = document.getElementById('button-generate-random');
generateRandomButton.addEventListener('click', () => resetGame(getRandSeed()));

//AI variables
let isAiPlay = false;
let aiWins = 0;
let aiLoss = 0;
let aiMoveSpeed = 1;
let aiMinMovesForFun = 20;

//Render variables
let playerClsDir = 'down';
let playerCls = '';


// functions
let getRand = (min, max, useSeed) => {
	return Math.floor((useSeed ? stateSeedRand() : Math.random()) * (max - min + 1)) + min;
}
let isMatchingPos = (pos1, pos2) => pos1.x == pos2.x && pos1.y === pos2.y;
let anyMatchingPos = (pos1, posArray) => posArray.some(pos => isMatchingPos(pos, pos1));

let getRandSeed = (length = 64) => {
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var str = "";

  for (var i = 0; i < length; i++) str += possible.charAt(Math.floor(Math.random() * possible.length));

  return str;
};

//Generates a random game state
let generateState = (newSeed) => {
	stateSeed = newSeed || stateSeed;
	stateSeedRand = new Math.seedrandom(stateSeed);

	let occupiedSpaces = [];

	let getRandFreePos = (xMin, xMax, yMin, yMax) => {
		let randPos = { x: getRand(xMin, xMax, true), y: getRand(yMin, yMax, true)};
		if(anyMatchingPos(randPos, occupiedSpaces)) {
			return getRandFreePos(xMin, xMax, yMin, yMax); //recursion- reattempt to find a spot
		} else {
			occupiedSpaces.push(randPos);
			return randPos;
		}
	};

	let getRandFreePosArray = (xMin, xMax, yMin, yMax, length) => {
		let arr = [];
		
		for(let i = 0; i < length; i++) arr.push(getRandFreePos(xMin, xMax, yMin, yMax));

		return arr;
	};

	let xMin = 16;
	let xMax = 20;
	let yMin = 16;
	let yMax = 20;

	state = {
		xSize: getRand(xMin, xMax, true),
		ySize: getRand(yMin, yMax, true),
		allowInput: true
	};

	let area = state.xSize * state.ySize;
		
	//COORDS ONLY on these
	state.player = getRandFreePos(0, state.xSize, 0, state.ySize);
	state.goal = getRandFreePos(0, state.xSize, 0, state.ySize);
	state.walls = getRandFreePosArray(0, state.xSize, 0, state.ySize, (area / getRand(8, 16, true)));
	state.deaths = getRandFreePosArray(0, state.xSize, 0, state.ySize, (area / getRand(15, 30, true)));
};

// Draws the game cells
let render = () => {
	//TODO rather than emptying and redrawing every div we could be toggling classes here
	let gameContainerEl = document.getElementById('game-container');
	gameContainerEl.innerHTML = '';

	for(let y = 0; y <= state.ySize; y++) {
		let row = document.createElement('DIV');
		row.className= "row";

		for(let x = 0; x <= state.xSize; x++) {
			let cellType = '';

			switch(true) {
				case isMatchingPos({ x, y }, state.player):
					cellType = `player ${playerClsDir} ${playerCls}`;
						break;
				case isMatchingPos({ x, y }, state.goal):
					cellType = 'goal';
						break;
				case anyMatchingPos({ x, y }, state.walls):
					cellType = 'wall';
						break;
				case anyMatchingPos({ x, y }, state.deaths):
					cellType = 'death';
						break;
				default:
					break;
			}
			var cell = document.createElement('DIV');
			cell.className = `cell ${cellType} ${x} ${y}`;
			cell.onclick = () => {
				//Click to change cellType
			};
			row.appendChild(cell);  
		}
		gameContainerEl.appendChild(row);
	};

	let gameSeedEl = document.getElementById('game-seed');
	gameSeedEl.value = stateSeed;

	let gameInfoEl = document.getElementById('game-info');
	gameInfoEl.innerHTML = `
	<p>AI wins: ${aiWins}</p>
	<p>AI losses: ${aiLoss}</p>`;
};

let applySeed = () => {
	let gameSeedEl = document.getElementById('game-seed');
	resetGame(gameSeedEl.value);
}

let resetGame = (newSeed) => {
	generateState(newSeed);
	render();
};

//Returns the object that is at a position, returns false if nothing
let checkCollisions = (pos) => {
	if(anyMatchingPos(pos, state.walls) 
		|| pos.x < 0 || pos.x > state.xSize 
		|| pos.y < 0 || pos.y > state.ySize) {
		//stopped by wall
		return 'wall';
	} else if (anyMatchingPos(pos, state.deaths)) {
		//dead
		return 'death';
	} else if (isMatchingPos(pos, state.goal)) {
		//win
		return 'goal'
	} else {
		return false;
	}
};

// Move events
let movePromise = (direction, commitMoves) => {
	return new Promise((resolve, reject) => {
		let distance = 0;
		let initialPos = {...state.player};

		playerClsDir = direction;
		playerCls = 'moving';

		let updatePosFn = null;
		switch(direction){
			case 'left': //left
				updatePosFn = pos => { return {...pos, x: pos.x - 1 } }
				break;
			case 'up': //up
				updatePosFn = pos => { return {...pos, y: pos.y - 1 } }
				break;
			case 'right': //right
				updatePosFn = pos => { return {...pos, x: pos.x + 1 } }
				break;
			case 'down': //down
				updatePosFn = pos => { return {...pos, y: pos.y + 1 } }
				break;
		};

		let step = (nextPos) => {
			let outcome = checkCollisions(nextPos, state);

			if(outcome) {
				playerCls = '';
				render(state);
				
				resolve({
					direction,
					outcome,
					distance
				});
			} else {
				distance++;

				if(commitMoves) {
					state.player.x = nextPos.x;
					state.player.y = nextPos.y;
					render(state);
					window.setTimeout(() => {
						step(updatePosFn({...nextPos}));
					}, isAiPlay ? aiMoveSpeed : 32);
				} else {
					step(updatePosFn({...nextPos}));
				}
			}
		};

		step(updatePosFn({...initialPos}));
	})
};

document.body.addEventListener("keydown", (e) => {
	if(!state.allowInput) return false;
	let moveDirection = null;

	switch(true){
		case e.keyCode === 37 || e.keyCode === 65: //left
			moveDirection = 'left';
			break;
		case e.keyCode === 38 || e.keyCode === 87: //up
			moveDirection = 'up';
			break;
		case e.keyCode === 39 || e.keyCode === 68: //right
			moveDirection = 'right';
			break;
		case e.keyCode === 40 || e.keyCode === 83: //down
			moveDirection = 'down';
			break;
		default:
			break;
	};

	if(moveDirection) {
		state.allowInput = false;
		movePromise(moveDirection, true).then(result => {
			switch(result.outcome) {
				case 'wall':
					state.allowInput = true;
					break;
				case 'death':
					resetGame();
					break;
				case 'goal':
					alert('goal');
					resetGame();
					break;
			};
		});
	}
});

resetGame(getRandSeed());

//AI Stuff
let toggleAiPlay = () => {
	isAiPlay = !isAiPlay;
	if(isAiPlay) beginAiPlay();
};

let beginAiPlay = (playStyle) => {
	let originPos = {...state.player};
	let allDirections = ['left', 'up', 'right', 'down'];

	let moveDirectionLog = [];
	let posResultLookup = []; // holds { x: 2, y: 3, results: [ direction: 'left', outcome: 'wall', ... etc] }

	//1.
	let assessMoveOptions = () => {
		return new Promise((resolve, reject) => {
			//We have already assessed this position before
			let existingResultsForPos = posResultLookup.find(posResult => isMatchingPos(posResult, state.player));

			if(existingResultsForPos) {
				resolve(existingResultsForPos.results);
			} else {
				Promise.all(allDirections.map(direction => movePromise(direction, false))).then(results => {
					posResultLookup.push({
						x: state.player.x,
						y: state.player.y,
						results
					});
					resolve(results);
				});
			}
		});
	};

	//2.
	let findBestResult = (results) => {
		//If a move will take us to the goal, just fucking move that way
		let bestResult = results.find(result => result.outcome === 'goal');

		if(!bestResult) {
			//Find moves that won't kill us or prevent us from moving at all
			let safeResults = results.filter(result => result.outcome === 'wall' && result.distance > 0);				

			safeResults.sort((res1, res2) => {
				let lastMoveDirection = moveDirectionLog[moveDirectionLog.length - 1];
				let horizontalDirections = ['left', 'right'];
				let verticalDirections = ['up', 'down'];
				let lastPriorityMoves = horizontalDirections.includes(lastMoveDirection) ? horizontalDirections : verticalDirections;

				// Firstly, deprioritise moves that take us back the way we came
				// The nature of the game means if you have STOPPED MOVING you can't move any further that way, 
				// so therefore going backwards is the only other option on your last move axis
				if(lastMoveDirection === res1.direction) {
					return -1;
				} else if (lastMoveDirection === res2.direction) {
					return 1;
				} else if(lastPriorityMoves.includes(res1.direction)) {
					return -1;
				} else if (lastPriorityMoves.includes(res2.direction)) {
					return 1;
				}

				let preferredMoves = [
					state.player.x < state.goal.x ? 'right' : 'left',
					state.player.y < state.goal.y ? 'down' : 'up'
				];

				let res1Preferred = preferredMoves.includes(res1.direction);
				let res2Preferred = preferredMoves.includes(res2.direction);

				//If there is still two decent moves, take the one that takes us in the DIRECTION of the goal, roughly
				
				//If they BOTH do bump up the better distance one

				if((res1Preferred && res2Preferred) || (!res1Preferred && !res2Preferred)) {
					//If they are BOTH preferred or BOTH NOT preferred they must be one of each axis 

					let horizontalDistanceToGoal = Math.abs(state.player.x - state.goal.x);
					let verticalDistanceToGoal = Math.abs(state.player.y- state.goal.y);

					//Was not sober at time of writing
					if(horizontalDirections.includes(res1.direction)) {
						//res1 is horizontal, res2 vertical
						return Math.abs(res1.distance - horizontalDistanceToGoal) < Math.abs(res2.distance - verticalDistanceToGoal) ? 1 : -1;
					} else {
						//res2 is vertical, res1 horizontal
						return Math.abs(res1.distance - verticalDistanceToGoal) < Math.abs(res2.distance - horizontalDistanceToGoal) ? 1 : -1;
					}
				}

				//If only one does, bump them up
				if(res1Preferred && !res2Preferred) return 1;
				if(!res1Preferred && res2Preferred) return -1;

				return 0;
			});

			bestResult = safeResults.length > 0 ? safeResults[safeResults.length - 1]: null;
		}

		posResultLookup = posResultLookup.map(posResult => {
			return isMatchingPos(posResult, state.player)
				? {
					...posResult,
					results: [...results.filter(result => result !== bestResult)]
				} 
				: posResult;
		});
	
		return bestResult;
	}

	let doNextMove = () => {
		if(!isAiPlay) return;

		assessMoveOptions()
			.then(results => {
				let bestResult = findBestResult(results);

				if(bestResult) {
					movePromise(bestResult.direction, true).then(result => {

					//If we've returned to our start position, clear the move direction log. It's the same as starting again.
					isMatchingPos(state.player, originPos) && moveDirectionLog.length > 0
						? moveDirectionLog = []
						: moveDirectionLog.push(bestResult.direction);

					if(result.outcome === 'goal') {
						aiWins++;
						window.setTimeout(() => {
							console.log(stateSeed);
							console.log('^ ' + moveDirectionLog.length + ' MOVES: ' +  moveDirectionLog.join(', '));

							//TODO: A win should not instantly stop. It should try again with a different inital move.
							// The inital move will not retrace its first move (deprioritized in sort)
							//This should cause enough entropy to find some alternate paths.
							
							if(moveDirectionLog.length < aiMinMovesForFun) {
								beginAiPlay();
								resetGame(getRandSeed());
							} else {
								toggleAiPlay();
								resetGame();
							}
						}, 100);
					} else {
						doNextMove();
					}
				});
			} else {
				//unsolvable game - reset.
				aiLoss++;
				window.setTimeout(() => {
					resetGame(getRandSeed());
					beginAiPlay();
				}, 100);
			}
		});
	};

	doNextMove();

	

	//1. Are there any directions left?
		//1

	//1. 
	//1. Pick a direction and remove it from the list of possible directions
	//2. Is there a wall immediately next to me in this direction? Don't move that way. Pick a new direction.
	//3. Is there a death at the end of that direction? Don't move that way. Pick a new direction.
	//4. 
	//Will 
};