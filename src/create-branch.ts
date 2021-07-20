import { Context } from "@actions/github/lib/context";
import { getOctokit } from "@actions/github";

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
          const tree = await toolkit.rest.git.createTree({
            tree: [],
            ...context.repo
          });

          const commit = await toolkit.rest.git.createCommit({
            message: 'Initial commit',
            tree: tree.data.sha,
            parents: [],
            ...context.repo
          });

          sha = commit.data.sha;
        }

        await toolkit.rest.git.createRef({
          ref: `refs/heads/${branch}`,
          sha: sha || context.sha,
          ...context.repo
        });

        return true;
      } else {
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
