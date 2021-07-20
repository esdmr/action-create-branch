import { createBranch, SHA1_EMPTY_TREE } from '../src/create-branch'
import { readFileSync } from 'fs';
import { context } from '@actions/github';

describe('Create a branch based on the input', () => {
  process.env.GITHUB_TOKEN = 'token'

  let branch = 'release-v1';
  let sha = 'ffac537e6cbbf934b08745a378932722df287a53';
  let contextMock = JSON.parse(readFileSync('__tests__/context.json', 'utf8'));
  let githubMock = jest.fn();
  let octokitMock = {
    rest: {
      git: {
        createRef: jest.fn(),
        createCommit: jest.fn()
      },
      repos: {
        getBranch: jest.fn()
      }
    }
  };

  beforeEach(() => {
    jest.resetAllMocks();

    octokitMock.rest.git.createCommit.mockImplementation(() => ({
      data: {
        sha
      }
    }));

    githubMock.mockImplementation(() => octokitMock);
  });

  it('gets a branch', async () => {
    octokitMock.rest.repos.getBranch.mockRejectedValue(new HttpError())
    process.env.GITHUB_REPOSITORY = 'peterjgrainger/test-action-changelog-reminder'
    await createBranch(githubMock, context, branch, false)
    expect(octokitMock.rest.repos.getBranch).toHaveBeenCalledWith({
      repo: 'test-action-changelog-reminder',
      owner: 'peterjgrainger',
      branch
    })
  });

  it('Creates a new branch if not already there', async () => {
    octokitMock.rest.repos.getBranch.mockRejectedValue(new HttpError())
    await createBranch(githubMock, contextMock, branch, false)
    expect(octokitMock.rest.git.createRef).toHaveBeenCalledWith({
      ref: 'refs/heads/release-v1',
      sha: 'ebb4992dc72451c1c6c99e1cce9d741ec0b5b7d7'
    })
  });

  it('Creates a new branch from a given commit SHA', async () => {
    octokitMock.rest.repos.getBranch.mockRejectedValue(new HttpError())
    await createBranch(githubMock, contextMock, branch, false, sha)
    expect(octokitMock.rest.git.createRef).toHaveBeenCalledWith({
      ref: 'refs/heads/release-v1',
      sha: 'ffac537e6cbbf934b08745a378932722df287a53'
    })
  })

  it('Creates a new orphan branch', async () => {
    octokitMock.rest.repos.getBranch.mockRejectedValue(new HttpError())
    await createBranch(githubMock, contextMock, branch, true)
    expect(octokitMock.rest.git.createRef).toHaveBeenCalledWith({
      ref: 'refs/heads/release-v1',
      sha: 'ffac537e6cbbf934b08745a378932722df287a53'
    })
  })

  it('Replaces refs/heads in branch name', async () => {
    octokitMock.rest.repos.getBranch.mockRejectedValue( new HttpError())
    await createBranch(githubMock, contextMock, `refs/heads/${branch}`, false)
    expect(octokitMock.rest.git.createRef).toHaveBeenCalledWith({
      ref: 'refs/heads/release-v1',
      sha: 'ebb4992dc72451c1c6c99e1cce9d741ec0b5b7d7'
    })
  });

  it('Fails if github token isn\'t defined', async () => {
    delete process.env.GITHUB_TOKEN
    expect.assertions(1);
    try {
      await createBranch(githubMock, contextMock, branch, false)
    } catch (error) {
      expect(error).toEqual(new ReferenceError('No token defined in the environment variables'))
    }
  });
});

class HttpError extends Error {
  name = 'HttpError'
  status = 404
}
