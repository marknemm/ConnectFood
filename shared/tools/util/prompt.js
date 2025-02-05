const prompts = require('prompts');
const { promises: fs } = require('fs');

/**
 * Gets the file (name) choices under a given directory.
 * @param {string} dirName The name of the directory that the file choices are under.
 * @param {string} excludeFiles A list of the names of files to exclude (must not have extensions).
 * @return {Promise<string[]>} A promise that resolves to the retrieved file name choices (with no paths or extensions).
 */
async function getFileChoices(dirName, excludeFiles = []) {
  return fs.readdir(dirName)
    .then((files) => files
      .map((file) => file.replace(/\..*$/, ''))
      .filter((file) => excludeFiles.indexOf(file) < 0)
    );
}

/**
 * Generates an input prompt in stdin.
 * @param {string} message The input prompt main message/question.
 * @param {string} defaultValue An optional default value that shall be set when the user inputs an empty string.
 * @return {Promise<string>} A promise that resolves to the user input value.
 */
async function inputPrompt(message, defaultValue = '') {
  const response = await prompts({
    type: 'text',
    name: 'value',
    message
  });
  return (response.value) ? response.value
                          : defaultValue;
}

/**
 * Generates a select prompt in stdin.
 * @param {string} message The select prompt main message/question.
 * @param {string[]} choices A list of choices to select from.
 * @return {Promise<string>} A promise that resolves to the user selected choice.
 */
async function selectPrompt(message, choices) {
  const response = await prompts({
    type: 'select',
    name: 'choice',
    message,
    choices: choices.map(
      (choice) => ({ title: choice, value: choice })
    )
  });
  return response.choice;
}

module.exports = {
  getFileChoices,
  inputPrompt,
  selectPrompt
};
