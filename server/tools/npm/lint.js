const env = require('../util/env');
const spawn = require('../../../shared/tools/util/spawn');
const path = require('path');
const { getOptionalArg } = require('../../../shared/tools/util/args');
const { getProjectDir } = require('../util/project');
const { selectProjectPrompt, projectOptions } = require('../util/prompt');

// Get the optional script `project` argument, and lint the project source code.
getOptionalArg('project')
  .then(lintProject)
  .then(process.exit)
  .catch((err) => { console.error(err); process.exit(1) });

/**
 * Lints the source code for a given project.
 * @param {string} project The name of the project that shall be linted.
 * @return {Promise<void>} A promise that resolves once the lint operation completes.
 */
async function lintProject(project) {
  if (!project) {
    project = await selectProjectPrompt(true);
  }
  env(project); // Be sure to init utilized .env based on selected project.

  if (project === 'all') {
    for (projectOpt of projectOptions) {
      await spawnLinter(projectOpt)
    }
  } else {
    await spawnLinter(project);
  }
}

/**
 * Spawns a linter sub-process for a given node project.
 * @param {string} project The project that shall be linted.
 * @return {Promise<void>} A promise that resolves once the linter sub-process completes.
 */
async function spawnLinter(project) {
  const projectDir = getProjectDir(project);
  const tsconfigPathname = path.join(projectDir, 'tsconfig.json');
  await spawn('tslint', ['-p', tsconfigPathname]);
}
