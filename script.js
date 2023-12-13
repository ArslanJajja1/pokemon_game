                                              // Pokémon Quiz Game Script  //

                                // --------------------------------------------------------- //

// API URL for Pokémon data
const pokemonApiUrl = "https://pokeapi.co/api/v2/pokemon/";

// Initialize variables for the current question and score
let currentQuestion = -1;
let score = 0;

// Default value of Total questions
let totalQuestions = 10;

// Variable to track whether the game is in a clickable state
let clickable = true;

// Function to start the game
async function startGame() {
  // Get the number of questions from the input field
  totalQuestions = parseInt(document.getElementById("num-questions").value, 10);

  // Validate the input to ensure it's a positive integer
  if (isNaN(totalQuestions) || totalQuestions < 1 || totalQuestions > 150) {
    alert("Enter a number of questions from 1 to 150.");
    return;
  }

  // Hide the settings container and start fetching questions
  document.getElementById("settings-container").style.display = "none";
   // Increment question
   currentQuestion++;
  // Unlock the game, when game starts
  clickable = true;
}

// Function to fetch a random Pokemon
async function fetchPokemon() {
  const randomId = Math.floor(Math.random() * 151) + 1;
  const apiUrl = `${pokemonApiUrl}${randomId}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Create a question object with image, options, and correct answer
    const question = {
      image: data.sprites.other.dream_world.front_default,
      options: await generateRandomOptions(data.name),
      correctAnswer: data.name,
    };

    // Display the question
    showQuestion(question);

    // Increment question
    currentQuestion++;
  } catch (error) {
    console.log("Error fetching Pokémon data:", error);
  }
}

// Function to generate random options for a question
async function generateRandomOptions(correctAnswer) {
  try {
    const options = [correctAnswer];
    const randomNamesPromises = Array.from({ length: 3 }, () => getRandomUniquePokemonName(options));

    // Fetch random Pokemon names for options using async/await
    const randomNames = await Promise.all(randomNamesPromises);

    options.push(...randomNames);
    return shuffleArray(options);
  } catch (error) {
    // Handle errors if any
    console.log("Error generating random options:", error);
  }
}

// Function to get a unique name of a random Pokemon that is not in the provided options
async function getRandomUniquePokemonName(options) {
  let randomName;
  do {
    randomName = await getRandomPokemonName();
  } while (options.includes(randomName));
  return randomName;
}

// Function to get the name of a random Pokemon
async function getRandomPokemonName() {
  const randomId = Math.floor(Math.random() * 151) + 1;
  const apiUrl = `${pokemonApiUrl}${randomId}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data.name;
}

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to display a question
function showQuestion(question) {
  // Set the Pokemon image
  document.getElementById("pokemon-image").src = question.image;

  // Generate random options and display them as buttons
  generateRandomOptions(question.correctAnswer)
    .then(options => {
      const optionsContainer = document.getElementById("options-container");
      optionsContainer.innerHTML = "";

      options.forEach((option, index) => {
        const optionElement = document.createElement("button");
        optionElement.classList.add("option");
        optionElement.innerText = option;
        optionElement.addEventListener("click", () => checkAnswer(option, question.correctAnswer, optionElement));
        optionsContainer.appendChild(optionElement);
      });
    })
    .catch(error => {
      console.log("Error generating random options:", error);
    });
}

// Function to check the user's answer
function checkAnswer(selectedOption, correctAnswer, selectedOptionElement) {

   // Check if the game has been started
   if (currentQuestion <= 0) {
    alert("Please start the game first.");
    return;
  }

  // Check if the game is in a clickable state
  if (!clickable) {
    console.log('Clickable is false')
    return;
  }

  // Lock the game to prevent rapid button clicks
  clickable = false;

  // Display feedback and update score
  document.getElementById("feedback").style.display = "block";

  if (selectedOption === correctAnswer) {
    selectedOptionElement.classList.add("correct");
    document.getElementById("feedback").innerText = `Correct Answer`;
    document.getElementById("feedback").classList.add("correct-feedback");
    score++;
  } else {
    selectedOptionElement.classList.add("incorrect");
    document.getElementById("feedback").innerText = `Wrong Answer`;
    document.getElementById("feedback").classList.add("incorrect-feedback");
  }

  // Update score and move to the next question after a delay
  updateScore();

  setTimeout(() => {
    selectedOptionElement.classList.remove("correct", "incorrect");
    document.getElementById("feedback").style.display = "none";
    document.getElementById("feedback").innerText = "";
    document.getElementById("feedback").classList.remove("correct-feedback", "incorrect-feedback");
    // Fetch a new question or end the game
    if (currentQuestion < totalQuestions) {
      fetchPokemon();
    // Unlock the game for the next question
    clickable = true;
    } else {
      endGame();
    }
  }, 2000);
}

// Function to update the displayed score
function updateScore() {
  document.getElementById("current-points").innerText = score;
}

// Function to end the game and reset variables
function endGame() {
  alert(`Game over! Your final score: ${score} out of ${totalQuestions}`);
  resetGame();
}

// Function to reset the game variables and start a new question
function resetGame() {
  currentQuestion = -1;
  score = 0;
  // Show the settings container and start fetching questions
  document.getElementById("settings-container").style.display = "block";
  updateScore();
  fetchPokemon();
}

// Initial question when the page loads
fetchPokemon();
