import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github'
import { createBranch } from './create-branch';

async function run() {
  try {
    const branch = core.getInput('branch');
    const sha = core.getInput('sha');
    const orphan = core.getInput('orphan') === 'true';

    core.debug(`Creating branch ${branch}`);

    const didCreateBranch = await createBranch(getOctokit, context, branch, orphan, sha);

    if(didCreateBranch) {
      core.info(`Created new branch ${branch}`);
    } else {
      core.info(`Branch ${branch} already exists`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}
run();
