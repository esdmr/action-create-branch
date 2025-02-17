import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github'
import { createBranch } from './create-branch';
import { inspect, InspectOptions } from 'util';

async function run() {
  const inspectOptions: InspectOptions = {
    colors: true,
    depth: Infinity,
  };

  try {
    const branch = core.getInput('branch');
    const sha = core.getInput('sha');
    const orphan = core.getInput('orphan') === 'true';

    core.debug(`Creating branch ${branch}`);
    core.debug(`sha: ${sha}`);
    core.debug(`orphan: ${orphan}`);

    const didCreateBranch = await createBranch(getOctokit, context, branch, orphan, sha, core.debug.bind(core), (object) => inspect(object, inspectOptions));

    if(didCreateBranch) {
      core.info(`Created new branch ${branch}`);
    } else {
      core.info(`Branch ${branch} already exists`);
    }
  } catch (error) {
    core.debug('error: ' + inspect(error ?? {}, inspectOptions));
    core.setFailed(error.message ?? 'Unknown error');
  }
}
run();
