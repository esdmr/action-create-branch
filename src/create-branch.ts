import { Context } from "@actions/github/lib/context";
import { getOctokit } from "@actions/github";

// > Git has a well-known, or at least sort-of-well-known, empty tree whose SHA1 ...
// https://stackoverflow.com/questions/9765453
export const SHA1_EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

type GitHub = ReturnType<typeof getOctokit>;

export async function createBranch(github: any, context: Context, branch: string, orphan: boolean, sha?: string) {
  const toolkit : GitHub = github(githubToken());
    // Sometimes branch might come in with refs/heads already
    branch = branch.replace('refs/heads/', '');

    // throws HttpError if branch already exists.
    try {
      await toolkit.rest.repos.getBranch({
        ...context.repo,
        branch
      });

      return false;
    } catch(error) {
      if(error.name === 'HttpError' && error.status === 404) {
        if(orphan) {
          const res = await toolkit.rest.git.createCommit({
            message: 'Initial commit',
            tree: SHA1_EMPTY_TREE,
            parents: [],
            ...context.repo
          });

          sha = res.data.sha;
        }

        await toolkit.rest.git.createRef({
          ref: `refs/heads/${branch}`,
          sha: sha || context.sha,
          ...context.repo
        });

        return true;
      } else {
        throw Error(error)
      }
    }
}

function githubToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token)
    throw ReferenceError('No token defined in the environment variables');
  return token;
}
