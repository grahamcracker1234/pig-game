// Encapulate in anounymous IIFE (Immediately Invoked Function Expression) to hide game data from users attempting to cheat via the console.
(function main() {
	// Global constants
	const DURATION = 500;
	const CURRENT_PLAYER_CLASS = "current-player";
	const CLASSIC = "classic";
	const TWO_DICE = "two-dice";

	// Global variables
	let game = undefined;

	// Game class
	const Game = function(gamemode, goal, player1, player2) {
		// Public properties
		this.gamemode = gamemode ?? CLASSIC;
		this.goal = goal ?? 100;
		this.player1 = player1 ?? new Player("Player 1");
		this.player2 = player2 ?? new Player("Player 2");
		
		// Private properties
		let _currentPlayerIndex = 1;
		let _playersTurnCount = 0;

		// Get current player and return them.
		this.getCurrentPlayer = () => {
			if (_currentPlayerIndex === 1) return this.player1;
			else if (_currentPlayerIndex === 2) return this.player2;
			else return console.error("Game.getCurrentPlayer(): Game._currentPlayerIndex is invalid.");
		};

		// Roll the dice and return their values.
		this.rollDice = () => {
			const roll = () => Math.floor(Math.random() * 6 + 1);
			const roll1 = roll();

			// Roll second die if gamemode is two-dice, otherwise default value 0.
			const roll2 = gamemode === TWO_DICE ? roll() : 0;

			// Apply special properties based on specific roles
			if (roll1 === 1 && roll2 === 1) { // Double 1s.
				this.getCurrentPlayer().tempScore = 0;
				this.getCurrentPlayer().score = 0;
				this.endTurn();
			} else if (roll1 === roll2) { // Doubles
				this.getCurrentPlayer().tempScore += (roll1 + roll2) * 2;
			} else if (roll1 === 1 || roll2 === 1) { // Single 1.
				this.getCurrentPlayer().tempScore = 0;
				this.endTurn();
			} else { // No special roll
				this.getCurrentPlayer().tempScore += roll1 + roll2;
			}

			// Return tuple.
			return [roll1, roll2];
		};

		// Get round number.
		this.getRound = () => (_playersTurnCount >> 1) + 1;

		// Manages the end of turn.
		this.endTurn = () => {
			// Add temporary score to main score.
			this.getCurrentPlayer().score += this.getCurrentPlayer().tempScore;
			// Reset temporary score.
			this.getCurrentPlayer().tempScore = 0;
			// Increment turn count.
			_playersTurnCount++;

			// Change current player.
			if (_currentPlayerIndex === 1) _currentPlayerIndex = 2;
			else if (_currentPlayerIndex === 2) _currentPlayerIndex = 1;
			else console.error("Game.nextTurn(): Game._currentPlayerIndex is invalid.")
		};

		// Return sorted tuple of the players based on score. Highest score first.
		this.getSortedPlayers = () => {``
			if (this.player1.score > this.player2.score) return [this.player1, this.player2];
			else if (this.player1.score < this.player2.score) return [this.player2, this.player1];
			else console.error("Game.getSortedPlayers(): players' scores are tied.")
		};
	};

	// Player class.
	const Player = function(name) {
		this.name = name;
		this.score = 0;
		this.tempScore = 0;
	};

	// Code to run at start of game.
	const startGame = () => {
		// Determine gamemode, default to classic.
		const isClassic = document.querySelector("#is-classic").checked;
		const isTwoDice = document.querySelector("#is-two-dice").checked;
		const gamemode = isClassic ? CLASSIC : isTwoDice ? TWO_DICE : CLASSIC;

		// Target points.
		const goal = parseInt(document.querySelector("#points-to-win").value);

		// Create player1 with selected name, defaults to "Player 1".
		const player1Name = escape(document.querySelector("#player-1-title").value);
		const player1 = new Player(player1Name?.trim().length ? player1Name.trim() : "Player 1");
		
		// Create player2 with selected name, defaults to "Player 2".
		const player2Name = escape(document.querySelector("#player-2-title").value);
		const player2 = new Player(player2Name?.trim().length ? player2Name.trim() : "Player 2");

		// Create new game.
		game = new Game(gamemode, isNaN(goal) ? 100 : goal, player1, player2);

		// Update user interface.
		updateGameUI();

		// Fade out title.
		const title = document.querySelector("#title");
		title.style.opacity = 0;
		setTimeout(() => {
			title.style.display = "none";
		}, DURATION);
	};

	// Update user interface.
	const updateGameUI = () => {
		const player1 = game.player1;
		const player2 = game.player2;

		// Update player names.
		const player1Game = document.querySelector("#player-1-game");
		player1Game.innerHTML = player1.name;
		const player2Game = document.querySelector("#player-2-game");
		player2Game.innerHTML = player2.name;

		// Update player scores.
		document.querySelector("#player-1-score").innerHTML = player1.score;
		document.querySelector("#player-2-score").innerHTML = player2.score;

		// Stylize current player.
		const currentPlayer = game.getCurrentPlayer()
		if (currentPlayer === player1) {
			player1Game.classList.add(CURRENT_PLAYER_CLASS);
			player2Game.classList.remove(CURRENT_PLAYER_CLASS);
		} else if (currentPlayer === player2) {
			player2Game.classList.add(CURRENT_PLAYER_CLASS);
			player1Game.classList.remove(CURRENT_PLAYER_CLASS);
		} else console.error("updateGameUI: Game.getCurrentPlayer() is invalid.")

		// Update temporary score.
		document.querySelector("#temp-score").innerHTML = game.getCurrentPlayer().tempScore;

		// Update current round.
		document.querySelector("#round-number").innerHTML = `Round: ${game.getRound()}`;

		// Update target goal.
		const goal = game.goal;
		document.querySelector("#goal").innerHTML = goal === 1 ? "Goal: 1 point" : `Goal: ${goal} points`;

		// Hide second die, if gamemode is classic.
		if (game.gamemode === CLASSIC) document.querySelector("#dice2").style.display = "none";
	};

	// Roll the dice and manager user interface.
	const rollDice = () => {
		// Get rolls.
		const [roll1, roll2] = game.rollDice();

		// Always adjust dice1.
		const dice1 = document.querySelector("#dice1");
		dice1.src = `assets/img/diceRed${roll1}.png`;
		dice1.alt = `Dice with ${roll1} on front`;
		dice1.style.animation = "shake var(--duration)";

		const dice2 = document.querySelector("#dice2");
		// Only adjust dice2 if gamemode is two-dice.
		if (game.gamemode === TWO_DICE) {
			dice2.src = `assets/img/diceRed${roll2}.png`;
			dice2.alt = `Dice with ${roll2} on front`;
			dice2.style.animation = "shake var(--duration)";
		}

		// Animate dice.
		const rollDice = document.querySelector("#roll-dice");
		rollDice.disabled = true;
		setTimeout(() => {
			dice1.style.animation = "none";
			dice2.style.animation = "none";
			rollDice.disabled = false;
		}, DURATION);

		// Update user interface.
		updateGameUI();

		// Check if game is over.
		const currentPlayer = game.getCurrentPlayer();
		if (currentPlayer.score + currentPlayer.tempScore >= game.goal) endGame();
	};

	// End turn.
	const endTurn = () => {
		game.endTurn();
		updateGameUI();
	};

	// End game.
	const endGame = () => {
		// Hide game screen.
		const gameElement = document.querySelector("#game");
		gameElement.style.opacity = 0;
		setTimeout(() => {
			gameElement.style.display = "none";
		}, DURATION);

		// Apply temporary score to total
		const currentPlayer = game.getCurrentPlayer();
		currentPlayer.score += currentPlayer.tempScore;

		// Get and set winner and loser elements.
		const [winner, loser] = game.getSortedPlayers();
		document.querySelector("#outcome").innerHTML = `${winner.name} beat ${loser.name}`;
		document.querySelector("#score").innerHTML = `${winner.score} to ${loser.score}`;

		// Display rounds and gamemode.
		const rounds = game.getRound();
		const gamemode = game.gamemode === CLASSIC ? "Classic Pig" : "Two-Dice Pig";
		document.querySelector("#total-rounds").innerHTML = `${rounds === 1 ? "in 1 round" : `in ${rounds} rounds`} of  ${gamemode}`;
	};

	// Reloads page to play again.
	const playAgain = () => window.location.reload();

	// Apply duration to global css variable.
	document.documentElement.style.setProperty("--duration", `${DURATION}ms`);

	// Add event listeners to buttons.
	document.querySelector("#start-game").addEventListener("click", startGame);
	document.querySelector("#roll-dice").addEventListener("click", rollDice);
	document.querySelector("#end-turn").addEventListener("click", endTurn);
	document.querySelector("#play-again").addEventListener("click", playAgain);
	document.querySelector("#home").addEventListener("click", playAgain);
})();