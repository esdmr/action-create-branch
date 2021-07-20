import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github'
import { createBranch } from './create-branch';
import { inspect, InspectOptions } from 'util';

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
    core.debug(error.stack ?? 'Undefined stack');

    const inspectOptions: InspectOptions = {
      colors: true,
      depth: Infinity,
    };

    core.debug('request: ' + inspect(error.request ?? {}, inspectOptions));
    core.debug('response: ' + inspect(error.response ?? {}, inspectOptions));

    core.setFailed(error.message ?? 'Unknown error');
  }
}
run();
