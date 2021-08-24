import { Context } from "@actions/github/lib/context";
import { getOctokit } from "@actions/github";

type GitHub = ReturnType<typeof getOctokit>;
const SHA1_EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

export async function createBranch(github: any, context: Context, branch: string, orphan: boolean, sha?: string, debug?: (message: string) => void, inspect?: (object: any) => string) {
  const toolkit : GitHub = github(githubToken());
  // Sometimes branch might come in with refs/heads already
  branch = branch.replace('refs/heads/', '');

  // throws HttpError if branch already does not exist.
  try {
    debug?.('Checking if the branch exists…');

    const branch_ = await toolkit.rest.repos.getBranch({
      ...context.repo,
      branch
    });

    debug?.(inspect?.(branch_) ?? '');

    return false;
  } catch(error) {
    if(error.name === 'HttpError' && error.status === 404) {
      debug?.('Branch does not exist');

      if(orphan) {
        debug?.('Requested to create a orphan branch, creating a empty tree…');

        const commit = await toolkit.rest.git.createCommit({
          message: 'Initial commit',
          tree: SHA1_EMPTY_TREE,
          parents: [],
          ...context.repo
        });

        debug?.('Created the commit');
        debug?.(inspect?.(commit) ?? '');
        sha = commit.data.sha;
      }

      debug?.('Creating a new branch…');

      const ref = await toolkit.rest.git.createRef({
        ref: `refs/heads/${branch}`,
        sha: sha || context.sha,
        ...context.repo
      });

      debug?.('Created the new branch');
      debug?.(inspect?.(ref) ?? '');

      return true;
    } else {
      debug?.('Something gone wrong');
      throw error
    }
  }
}

function githubToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token)
    throw ReferenceError('No token defined in the environment variables');
  return token;
}
